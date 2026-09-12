import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, getPool } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production';

app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// ==========================================
// MULTIPART IMAGE UPLOAD CONFIGURATION (MULTER)
// Renames every image with a random UUID to avoid any collision
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const randomId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// Dedicated resume multer storage for PDF files
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed for resume upload.'));
    }
  }
});

// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to perform this administrative action.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired login session. Please log in again.'
    });
  }
}

// Helper to safely parse JSON columns
function parseJsonField(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

// Helper to safely serialize values to JSON strings for MySQL JSON columns
// Prevents mysql2 from interpreting nested JavaScript arrays as comma-separated SQL arguments
function stringifyJsonField(val, fallback = []) {
  if (val !== undefined && val !== null) {
    if (typeof val === 'string') {
      try {
        JSON.parse(val);
        return val;
      } catch (e) {
        return JSON.stringify([val]);
      }
    }
    return JSON.stringify(val);
  }
  if (fallback !== undefined && fallback !== null) {
    return typeof fallback === 'string' ? fallback : JSON.stringify(fallback);
  }
  return JSON.stringify([]);
}

// Format project row to clean JSON object
function formatProject(row) {
  return {
    id: row.id, // UUID v4
    slug: row.slug || row.id,
    numericId: row.numericId,
    title: row.title,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    image: row.image,
    category: row.category,
    tags: parseJsonField(row.tags, []),
    gallery: parseJsonField(row.gallery, []),
    features: parseJsonField(row.features, []),
    techStack: parseJsonField(row.techStack, []),
    liveDemoUrl: row.liveDemoUrl,
    githubUrl: row.githubUrl,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS (JWT)
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. You are not authorized to access this console.'
      });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Access denied.'
      });
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
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me (returns active logged-in admin user from MySQL)
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, full_name, email, role, created_at FROM admin_users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    const settingsMap = {};
    settingsRows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });

    const user = {
      ...rows[0],
      linkedin_url: settingsMap.linkedin_url || process.env.LINKEDIN_URL || '',
      github_url: settingsMap.github_url || process.env.GITHUB_URL || ''
    };

    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/profile (updates admin details and social links in MySQL)
app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, email, username, linkedin_url, github_url } = req.body;
    const pool = getPool();

    if (username) {
      const [existing] = await pool.query(
        'SELECT id FROM admin_users WHERE LOWER(username) = LOWER(?) AND id != ? LIMIT 1',
        [username.trim(), req.user.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Username is already taken by another account.' });
      }
    }

    await pool.query(
      'UPDATE admin_users SET full_name = ?, email = ?, username = ? WHERE id = ?',
      [
        (full_name || 'Aditya Gore').trim(),
        (email || '').trim(),
        (username || req.user.username).trim(),
        req.user.id
      ]
    );

    // Synchronize to site_settings table so changes apply globally across the website
    if (email) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('contact_email', ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [email.trim(), email.trim()]
      );
    }
    if (full_name) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('admin_name', ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [full_name.trim(), full_name.trim()]
      );
    }
    if (linkedin_url !== undefined) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('linkedin_url', ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [String(linkedin_url).trim(), String(linkedin_url).trim()]
      );
    }
    if (github_url !== undefined) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES ('github_url', ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [String(github_url).trim(), String(github_url).trim()]
      );
    }

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
        github_url: github_url !== undefined ? github_url : ''
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/change-password (only logged-in admin can change their password)
app.put('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE id = ? LIMIT 1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    const user = rows[0];
    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await pool.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully! Only you can log in with this new password.'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. MULTIPART PHOTO UPLOAD ENDPOINT
// ==========================================

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully with random UUID name.',
      imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. PROJECTS API (CRUD with UUID)
// ==========================================

// GET all projects
app.get('/api/projects', async (req, res) => {
  try {
    const pool = getPool();
    const showAll = req.query.all === 'true';

    const query = showAll
      ? 'SELECT * FROM projects ORDER BY numericId ASC'
      : 'SELECT * FROM projects WHERE published = 1 ORDER BY numericId ASC';

    const [rows] = await pool.query(query);
    const data = rows.map(formatProject);

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET single project by UUID or slug or numericId
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? OR LOWER(slug) = LOWER(?) OR numericId = ? LIMIT 1',
      [id, id, isNaN(id) ? -1 : Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Project with identifier '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatProject(rows[0])
    });
  } catch (err) {
    console.error('Error fetching single project:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new project (requires JWT)
app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const {
      title,
      shortDescription,
      fullDescription,
      image,
      category,
      tags,
      gallery,
      features,
      techStack,
      liveDemoUrl,
      githubUrl,
      published,
      featured
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const projectUuid = uuidv4();

    // Generate unique slug
    let slug = req.body.slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const [existing] = await pool.query('SELECT id FROM projects WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    await pool.query(
      `INSERT INTO projects (
        id, slug, title, shortDescription, fullDescription, image, category,
        tags, gallery, features, techStack, liveDemoUrl, githubUrl,
        published, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectUuid,
        slug,
        title,
        shortDescription || '',
        fullDescription || shortDescription || '',
        image || '/images/02_construction_project.png',
        category || 'Full Stack',
        stringifyJsonField(tags, ['React', 'Node.js']),
        stringifyJsonField(gallery, []),
        stringifyJsonField(features, []),
        stringifyJsonField(techStack, []),
        liveDemoUrl || '',
        githubUrl || '',
        published !== undefined ? (published ? 1 : 0) : 1,
        featured !== undefined ? (featured ? 1 : 0) : 1
      ]
    );

    const [newRow] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectUuid]);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully with UUID!',
      data: formatProject(newRow[0])
    });
  } catch (err) {
    console.error('Error creating project:', err);
    return res.status(500).json({ success: false, message: err.message, error: err.message });
  }
});

// PUT update existing project (requires JWT)
app.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [existing] = await pool.query(
      'SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1',
      [id, id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const current = existing[0];
    const {
      title,
      shortDescription,
      fullDescription,
      image,
      category,
      tags,
      gallery,
      features,
      techStack,
      liveDemoUrl,
      githubUrl,
      published,
      featured
    } = req.body;

    await pool.query(
      `UPDATE projects SET 
        title = ?,
        shortDescription = ?,
        fullDescription = ?,
        image = ?,
        category = ?,
        tags = ?,
        gallery = ?,
        features = ?,
        techStack = ?,
        liveDemoUrl = ?,
        githubUrl = ?,
        published = ?,
        featured = ?
      WHERE id = ?`,
      [
        title !== undefined ? title : current.title,
        shortDescription !== undefined ? shortDescription : current.shortDescription,
        fullDescription !== undefined ? fullDescription : current.fullDescription,
        image !== undefined ? image : current.image,
        category !== undefined ? category : current.category,
        stringifyJsonField(tags, current.tags),
        stringifyJsonField(gallery, current.gallery),
        stringifyJsonField(features, current.features),
        stringifyJsonField(techStack, current.techStack),
        liveDemoUrl !== undefined ? liveDemoUrl : current.liveDemoUrl,
        githubUrl !== undefined ? githubUrl : current.githubUrl,
        published !== undefined ? (published ? 1 : 0) : current.published,
        featured !== undefined ? (featured ? 1 : 0) : current.featured,
        current.id
      ]
    );

    const [updatedRow] = await pool.query('SELECT * FROM projects WHERE id = ?', [current.id]);

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully!',
      data: formatProject(updatedRow[0])
    });
  } catch (err) {
    console.error('Error updating project:', err);
    return res.status(500).json({ success: false, message: err.message, error: err.message });
  }
});

// DELETE project (requires JWT)
app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [result] = await pool.query('DELETE FROM projects WHERE id = ? OR slug = ?', [id, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. CONTACT / MESSAGES API (with UUID)
// ==========================================

// POST new message from Contact page
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const messageUuid = uuidv4();
    const pool = getPool();

    await pool.query(
      'INSERT INTO messages (id, name, email, subject, message, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [messageUuid, name.trim(), email.trim(), subject ? subject.trim() : 'General Inquiry', message.trim()]
    );

    const [inserted] = await pool.query('SELECT * FROM messages WHERE id = ?', [messageUuid]);

    return res.status(200).json({
      success: true,
      message: 'Transmission received! Your message has been saved to the database.',
      data: inserted[0]
    });
  } catch (err) {
    console.error('Error saving contact message:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET all messages (for Admin)
app.get('/api/messages', async (req, res) => {
  try {
    const pool = getPool();
    const filter = req.query.filter; // 'unread' | 'read' | undefined

    let query = 'SELECT * FROM messages ORDER BY created_at DESC';
    if (filter === 'unread') {
      query = 'SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC';
    } else if (filter === 'read') {
      query = 'SELECT * FROM messages WHERE is_read = 1 ORDER BY created_at DESC';
    }

    const [messages] = await pool.query(query);

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle read status (requires JWT)
app.patch('/api/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const pool = getPool();

    if (is_read !== undefined) {
      await pool.query('UPDATE messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, id]);
    } else {
      await pool.query('UPDATE messages SET is_read = NOT is_read WHERE id = ?', [id]);
    }

    const [updated] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      data: updated[0]
    });
  } catch (err) {
    console.error('Error updating message status:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE message (requires JWT)
app.delete('/api/messages/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. ADMIN DASHBOARD STATS & ANALYTICS
// ==========================================

app.get('/api/admin/stats', async (req, res) => {
  try {
    const pool = getPool();

    const [projectCount] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published FROM projects');
    const [msgCount] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM messages');
    const [achCount] = await pool.query('SELECT COUNT(*) as total FROM achievements');
    const [expCount] = await pool.query('SELECT COUNT(*) as total FROM experiences');
    const [skillsCount] = await pool.query('SELECT COUNT(*) as total FROM skills');
    const [viewsSum] = await pool.query('SELECT SUM(views_count) as totalViews FROM visitor_logs');
    const [todayViews] = await pool.query('SELECT views_count FROM visitor_logs WHERE visited_date = CURDATE() LIMIT 1');

    const totalViews = Number(viewsSum[0].totalViews) || 0;
    const viewsFormatted = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews);

    const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    const settingsMap = {};
    settingsRows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects: projectCount[0].total || 0,
        publishedProjects: projectCount[0].published || 0,
        projectsDelta: `+${projectCount[0].total || 0}`,
        totalMessages: msgCount[0].total || 0,
        unreadMessages: Number(msgCount[0].unread) || 0,
        messagesDelta: `+${Number(msgCount[0].unread) || 0} unread`,
        totalViews,
        viewsFormatted,
        viewsDelta: `+${todayViews[0]?.views_count || 12} today`,
        totalAchievements: achCount[0].total || 0,
        achievementsDelta: `+${achCount[0].total || 0}`,
        totalExperiences: expCount[0].total || 0,
        totalSkills: skillsCount[0].total || 0,
        siteStatus: {
          website: settingsMap.portfolio_url || 'https://aditya-gore.dev',
          database: 'Connected (MySQL 9.5)',
          contactForm: 'Working Properly',
          security: 'JWT + bcrypt Active',
          isOnline: true
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/health (Live real-time server and database diagnostic)
app.get('/api/admin/health', async (req, res) => {
  try {
    const pool = getPool();
    const startTime = Date.now();
    await pool.query('SELECT 1');
    const dbLatencyMs = Date.now() - startTime;

    const [counts] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM projects) as projects,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM achievements) as achievements,
        (SELECT COUNT(*) FROM experiences) as experiences,
        (SELECT COUNT(*) FROM skills) as skills,
        (SELECT COUNT(*) FROM visitor_logs) as visitorDays,
        (SELECT COUNT(*) FROM game_scores) as gameScores
    `);

    return res.status(200).json({
      success: true,
      status: 'Healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      dbLatencyMs,
      database: 'MySQL 9.5 (portfolio_db)',
      tableCounts: counts[0],
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    });
  } catch (err) {
    return res.status(500).json({ success: false, status: 'Degraded', error: err.message });
  }
});

// POST /api/track-visit (Log daily page views dynamically into visitor_logs)
app.post('/api/track-visit', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(`
      INSERT INTO visitor_logs (id, visited_date, views_count)
      VALUES (UUID(), CURDATE(), 1)
      ON DUPLICATE KEY UPDATE views_count = views_count + 1
    `);
    return res.status(200).json({ success: true, message: 'Visit recorded.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/visitors', async (req, res) => {
  try {
    const pool = getPool();
    const days = parseInt(req.query.days, 10) || 30;

    const [rows] = await pool.query(
      'SELECT visited_date, views_count FROM visitor_logs ORDER BY visited_date DESC LIMIT ?',
      [days]
    );

    const formatted = rows.reverse().map(r => {
      const d = new Date(r.visited_date);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const dayStr = String(d.getDate()).padStart(2, '0');
      return {
        date: r.visited_date,
        views: r.views_count,
        label: `${monthStr} ${dayStr}`
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (err) {
    console.error('Error fetching visitors analytics:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. ACHIEVEMENTS & EXPERIENCES API (with UUID)
// ==========================================

app.get('/api/achievements', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM achievements ORDER BY created_at DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/achievements', requireAuth, async (req, res) => {
  try {
    const { title, organization, year, description, icon } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const achievementUuid = uuidv4();
    const pool = getPool();

    await pool.query(
      'INSERT INTO achievements (id, title, organization, year, description, icon) VALUES (?, ?, ?, ?, ?, ?)',
      [achievementUuid, title, organization || '', year || new Date().getFullYear(), description || '', icon || 'FaAward']
    );

    const [created] = await pool.query('SELECT * FROM achievements WHERE id = ?', [achievementUuid]);
    return res.status(201).json({ success: true, data: created[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/achievements/:id', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM achievements WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Achievement deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/experiences', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM experiences ORDER BY created_at DESC');
    const parsed = rows.map(r => ({ ...r, skills: parseJsonField(r.skills, []) }));
    return res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/experiences', requireAuth, async (req, res) => {
  try {
    const { role, company, period, description, skills } = req.body;
    if (!role || !company) return res.status(400).json({ success: false, message: 'Role and company required' });

    const expUuid = uuidv4();
    const pool = getPool();

    await pool.query(
      'INSERT INTO experiences (id, role, company, period, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [expUuid, role, company, period || '', description || '', JSON.stringify(skills || [])]
    );

    const [created] = await pool.query('SELECT * FROM experiences WHERE id = ?', [expUuid]);
    return res.status(201).json({ success: true, data: created[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/experiences/:id', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM experiences WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Experience deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. SITE SETTINGS API
// ==========================================

app.get('/api/settings', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM site_settings');
    const defaultSettings = {
      site_title: process.env.SITE_TITLE || '',
      admin_name: process.env.ADMIN_FULL_NAME || '',
      admin_tagline: process.env.ADMIN_TAGLINE || '',
      admin_quote: process.env.ADMIN_QUOTE || '',
      contact_email: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || '',
      linkedin_url: process.env.LINKEDIN_URL || '',
      github_url: process.env.GITHUB_URL || '',
      portfolio_url: process.env.PORTFOLIO_URL || '',
      resume_url: '/Aditya_Gore_Resume.pdf',
      resume_filename: 'Aditya_Gore_Resume.pdf',
      resume_filesize: '46.2 KB',
      resume_updated_at: '12 Sep 2026',
      resume_version: '2.1'
    };

    const settingsMap = { ...defaultSettings };
    rows.forEach(r => {
      settingsMap[r.setting_key] = r.setting_value;
    });
    return res.status(200).json({ success: true, settings: settingsMap });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, String(value), String(value)]
      );
    }

    // Sync admin_users table if email or full_name changed via site settings
    if (settings.contact_email) {
      await pool.query('UPDATE admin_users SET email = ? WHERE id = ?', [settings.contact_email.trim(), req.user.id]);
    }
    if (settings.admin_name) {
      await pool.query('UPDATE admin_users SET full_name = ? WHERE id = ?', [settings.admin_name.trim(), req.user.id]);
    }

    return res.status(200).json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// RESUME UPLOAD & RETRIEVAL API
// ==========================================

app.post('/api/resume/upload', requireAuth, uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid PDF file to upload.' });
    }

    const pool = getPool();
    const resumeUrl = `/uploads/${req.file.filename}`;
    const resumeFilename = req.file.originalname || 'Aditya_Gore_Resume.pdf';
    
    // Calculate file size
    const sizeInKb = (req.file.size / 1024).toFixed(1);
    const resumeFilesize = req.file.size > (1024 * 1024)
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeInKb} KB`;

    // Date formatting (e.g., "12 Sep 2026")
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const resumeUpdatedAt = req.body.updated_at || formattedDate;
    const resumeVersion = req.body.version || '2.1';

    // Store resume metadata in site_settings
    const updates = [
      ['resume_url', resumeUrl],
      ['resume_filename', resumeFilename],
      ['resume_filesize', resumeFilesize],
      ['resume_updated_at', resumeUpdatedAt],
      ['resume_version', resumeVersion]
    ];

    for (const [k, v] of updates) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [k, v, v]
      );
    }

    // Also overwrite client/public/Aditya_Gore_Resume.pdf so direct static link stays in sync
    try {
      const publicPath = path.join(__dirname, '..', 'client', 'public', 'Aditya_Gore_Resume.pdf');
      fs.copyFileSync(req.file.path, publicPath);
    } catch (copyErr) {
      console.warn('Could not copy to client/public:', copyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and published successfully!',
      resume: {
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
        resume_filesize: resumeFilesize,
        resume_updated_at: resumeUpdatedAt,
        resume_version: resumeVersion
      }
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to upload resume.' });
  }
});

app.get('/api/resume', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT setting_key, setting_value FROM site_settings 
       WHERE setting_key IN ('resume_url', 'resume_filename', 'resume_filesize', 'resume_updated_at', 'resume_version')`
    );

    const resumeMap = {
      resume_url: '/Aditya_Gore_Resume.pdf',
      resume_filename: 'Aditya_Gore_Resume.pdf',
      resume_filesize: '46.2 KB',
      resume_updated_at: '12 Sep 2026',
      resume_version: '2.1'
    };

    rows.forEach(r => {
      resumeMap[r.setting_key] = r.setting_value;
    });

    return res.status(200).json({ success: true, resume: resumeMap });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. SKILLS API (Full CRUD with UUID)
// ==========================================

app.get('/api/skills', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM skills ORDER BY category ASC, proficiency DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/skills', requireAuth, async (req, res) => {
  try {
    const { name, category, proficiency, icon } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Skill name is required.' });

    const pool = getPool();
    const skillUuid = uuidv4();

    await pool.query(
      'INSERT INTO skills (id, name, category, proficiency, icon) VALUES (?, ?, ?, ?, ?)',
      [
        skillUuid,
        name.trim(),
        category ? category.trim() : 'General',
        parseInt(proficiency, 10) || 85,
        icon || 'FaCode'
      ]
    );

    const [created] = await pool.query('SELECT * FROM skills WHERE id = ?', [skillUuid]);
    return res.status(201).json({ success: true, message: 'Skill added to MySQL.', data: created[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/skills/:id', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Skill deleted from MySQL.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. GAMING MINI-GAME STATS & SCORES API
// ==========================================

app.get('/api/game/stats', async (req, res) => {
  try {
    const pool = getPool();

    const [runsCount] = await pool.query('SELECT COUNT(*) as totalRuns, SUM(bugs_squashed) as totalBugs FROM game_scores');
    const [bestTimeRow] = await pool.query(
      "SELECT MIN(time_seconds) as bestTime FROM game_scores WHERE outcome = 'victory'"
    );
    const [favHeroRow] = await pool.query(
      'SELECT character_chosen, COUNT(*) as count FROM game_scores GROUP BY character_chosen ORDER BY count DESC LIMIT 1'
    );
    const [recentScores] = await pool.query(
      'SELECT * FROM game_scores ORDER BY created_at DESC LIMIT 8'
    );

    const bestSecs = bestTimeRow[0]?.bestTime || 48;
    const mins = Math.floor(bestSecs / 60);
    const secs = bestSecs % 60;
    const bestTimeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return res.status(200).json({
      success: true,
      stats: {
        totalPlays: runsCount[0]?.totalRuns || 0,
        totalBugsSquashed: runsCount[0]?.totalBugs || 0,
        bestTimeSeconds: bestSecs,
        bestTimeFormatted,
        favoriteHero: favHeroRow[0]?.character_chosen || 'Aditya',
        recentScores
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/game/score', async (req, res) => {
  try {
    const { player_name, character_chosen, time_seconds, bugs_squashed, outcome } = req.body;
    const pool = getPool();
    const scoreUuid = uuidv4();

    await pool.query(
      'INSERT INTO game_scores (id, player_name, character_chosen, time_seconds, bugs_squashed, outcome) VALUES (?, ?, ?, ?, ?, ?)',
      [
        scoreUuid,
        (player_name || 'Player').slice(0, 100),
        character_chosen || 'Aditya',
        parseInt(time_seconds, 10) || 0,
        parseInt(bugs_squashed, 10) || 0,
        outcome || 'victory'
      ]
    );

    return res.status(201).json({ success: true, message: 'Game run recorded in MySQL.', id: scoreUuid });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Portfolio & Admin API is operational with MySQL, UUID, and JWT.');
});

// ==========================================
// START SERVER WITH DATABASE INITIALIZATION
// ==========================================

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running with MySQL, UUID & JWT on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
