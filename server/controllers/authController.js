/**
 * controllers/authController.js
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production';

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

// PUT /api/auth/change-password
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
