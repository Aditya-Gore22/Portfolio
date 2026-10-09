/**
 * controllers/authController.js
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production';

// ── Nodemailer transporter (lazy-init so missing env vars don't crash boot) ──
function getMailTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || pass === 'your_gmail_app_password_here') {
    return null; // email not configured
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      throw new AppError('Email and password are required.', 400);
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      throw new AppError('Access denied. You are not authorized to access this console.', 401);
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid password. Access denied.', 401);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, full_name, email, role, created_at FROM admin_users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) throw new AppError('User not found.', 404);

    const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    const settingsMap = {};
    settingsRows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });

    const user = {
      ...rows[0],
      linkedin_url: settingsMap.linkedin_url || process.env.LINKEDIN_URL || '',
      github_url: settingsMap.github_url || process.env.GITHUB_URL || '',
    };

    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/profile
export async function updateProfile(req, res, next) {
  try {
    const { full_name, email, username, linkedin_url, github_url } = req.body;
    const pool = getPool();

    if (username) {
      const [existing] = await pool.query(
        'SELECT id FROM admin_users WHERE LOWER(username) = LOWER(?) AND id != ? LIMIT 1',
        [username.trim(), req.user.id]
      );
      if (existing.length > 0) {
        throw new AppError('Username is already taken by another account.', 400);
      }
    }

    await pool.query(
      'UPDATE admin_users SET full_name = ?, email = ?, username = ? WHERE id = ?',
      [
        (full_name || 'Aditya Gore').trim(),
        (email || '').trim(),
        (username || req.user.username).trim(),
        req.user.id,
      ]
    );

    const upsert = async (key, value) => {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, String(value).trim(), String(value).trim()]
      );
    };

    if (email) await upsert('contact_email', email);
    if (full_name) await upsert('admin_name', full_name);
    if (linkedin_url !== undefined) await upsert('linkedin_url', linkedin_url);
    if (github_url !== undefined) await upsert('github_url', github_url);

    const [rows] = await pool.query(
      'SELECT id, username, full_name, email, role, created_at FROM admin_users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile & social links updated in MySQL database successfully.',
      user: {
        ...rows[0],
        linkedin_url: linkedin_url !== undefined ? linkedin_url : '',
        github_url: github_url !== undefined ? github_url : '',
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/change-password  (requires login)
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required.', 400);
    }
    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long.', 400);
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ? LIMIT 1', [req.user.id]);
    if (rows.length === 0) throw new AppError('Admin user not found.', 404);

    const user = rows[0];
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully! Only you can log in with this new password.',
    });
  } catch (err) {
    next(err);
  }
}

// ════════════════════════════════════════════════════
//  FORGOT PASSWORD  —  POST /api/auth/forgot-password
//  Public route. Accepts { email } in body.
//  Sends a one-time 15-minute reset link to the admin email.
// ════════════════════════════════════════════════════
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      throw new AppError('Email address is required.', 400);
    }

    const pool = getPool();

    // Find admin with this email
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email.trim()]
    );

    // ALWAYS return success to prevent email enumeration attacks
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.'
      });
    }

    const user = rows[0];

    // Invalidate any existing unused tokens for this user
    await pool.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
      [user.id]
    );

    // Generate a cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [tokenId, user.id, rawToken, expiresAt]
    );

    // Build reset URL — points to frontend with #reset-password/TOKEN
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/#reset-password/${rawToken}`;

    // ── Email HTML template ──────────────────────────────────────────────────
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #070f22; border: 1px solid #1a2e4a; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #111827 100%); padding: 32px 36px 24px; border-bottom: 1px solid #1a2e4a; text-align: center; }
    .header h1 { margin: 0 0 4px; font-size: 20px; color: #ffffff; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 13px; color: #64748b; }
    .body { padding: 32px 36px; }
    .body p { margin: 0 0 18px; color: #94a3b8; font-size: 15px; line-height: 1.6; }
    .body .greeting { color: #e2e8f0; font-size: 16px; font-weight: 600; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #0ea5e9, #7c3aed); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; }
    .divider { height: 1px; background: #1a2e4a; margin: 24px 0; }
    .url-box { background: #030712; border: 1px solid #1e3a5f; border-radius: 8px; padding: 12px 16px; word-break: break-all; font-size: 12px; color: #38bdf8; font-family: monospace; }
    .warning-box { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 14px 18px; margin: 20px 0 0; }
    .warning-box p { margin: 0; color: #fbbf24; font-size: 13px; }
    .footer { background: #030712; padding: 20px 36px; text-align: center; }
    .footer p { margin: 0; color: #374151; font-size: 12px; }
    .shield { font-size: 28px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="shield">🔐</div>
      <h1>Admin Password Reset</h1>
      <p>Aditya Gore — Portfolio Admin Panel</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, ${user.full_name || user.username}!</p>
      <p>
        You (or someone claiming to be you) requested a password reset for your portfolio admin account.
        Click the button below to set a new password. This link is valid for <strong style="color:#f8fafc;">15 minutes</strong> only.
      </p>
      <div class="cta-wrap">
        <a href="${resetUrl}" class="cta-btn">🔑 Reset My Password</a>
      </div>
      <div class="divider"></div>
      <p style="font-size:13px; margin-bottom:8px;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <div class="url-box">${resetUrl}</div>
      <div class="warning-box">
        <p>⚠️ If you did <strong>not</strong> request this reset, you can safely ignore this email. Your password will not change unless you click the link above.</p>
      </div>
    </div>
    <div class="footer">
      <p>Aditya Gore Portfolio • This is an automated security email</p>
    </div>
  </div>
</body>
</html>`;

    // ── Send email ───────────────────────────────────────────────────────────
    const transporter = getMailTransporter();
    if (!transporter) {
      // Dev fallback: log token to console instead of crashing
      console.warn('\n⚠️  EMAIL NOT CONFIGURED — password reset link (dev only):\n' + resetUrl + '\n');
      return res.status(200).json({
        success: true,
        message: 'Reset link generated (email not configured — check server console in dev).',
        devResetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: '🔐 Admin Password Reset — Aditya Gore Portfolio',
      html: htmlBody,
      text: `Hi ${user.full_name || user.username},\n\nYour admin password reset link (expires in 15 min):\n${resetUrl}\n\nIf you did not request this, ignore this email.\n`
    });

    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent. Check your inbox!'
    });
  } catch (err) {
    next(err);
  }
}

// ════════════════════════════════════════════════════
//  RESET PASSWORD  —  POST /api/auth/reset-password
//  Public route. Accepts { token, newPassword }.
// ════════════════════════════════════════════════════
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required.', 400);
    }
    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long.', 400);
    }

    const pool = getPool();

    // Find valid, unused, non-expired token
    const [tokenRows] = await pool.query(
      `SELECT prt.*, au.id as admin_id
       FROM password_reset_tokens prt
       JOIN admin_users au ON prt.user_id = au.id
       WHERE prt.token = ?
         AND prt.used = 0
         AND prt.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (tokenRows.length === 0) {
      throw new AppError(
        'This reset link is invalid or has expired (links expire after 15 minutes). Please request a new one.',
        400
      );
    }

    const { admin_id, id: tokenId } = tokenRows[0];

    // Hash new password and update admin
    const newHash = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newHash, admin_id]);

    // Mark token as used (single-use)
    await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenId]);

    // Also invalidate all other pending tokens for this user for safety
    await pool.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
      [admin_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
}

// ════════════════════════════════════════════════════
//  VERIFY RESET TOKEN  —  GET /api/auth/verify-reset-token/:token
//  Public. Used by frontend to check token validity before showing form.
// ════════════════════════════════════════════════════
export async function verifyResetToken(req, res, next) {
  try {
    const { token } = req.params;
    if (!token) throw new AppError('Token is required.', 400);

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT prt.id, prt.expires_at, au.username, au.full_name
       FROM password_reset_tokens prt
       JOIN admin_users au ON prt.user_id = au.id
       WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
    }

    const timeLeft = Math.round((new Date(rows[0].expires_at) - Date.now()) / 1000 / 60);
    return res.status(200).json({
      success: true,
      username: rows[0].full_name || rows[0].username,
      expiresInMinutes: timeLeft
    });
  } catch (err) {
    next(err);
  }
}
