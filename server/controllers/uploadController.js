/**
 * controllers/uploadController.js
 * Handles image and resume file uploads.
 * Multer instances are created in this file so routes can import them.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ---------- Multer configurations ----------

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new AppError('Only image files are allowed.', 400));
  },
});

export const uploadResume = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const cleanName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
      cb(null, `${cleanName}_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' || ext === '.pdf') cb(null, true);
    else cb(new AppError('Only PDF documents are allowed for resume upload.', 400));
  },
});

// ---------- Controllers ----------

// POST /api/upload
export function uploadImage(req, res, next) {
  if (!req.file) return next(new AppError('No image file provided.', 400));
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully with random UUID name.',
    imageUrl,
    filename: req.file.filename,
  });
}

// POST /api/resume/upload
export async function uploadResumeFile(req, res, next) {
  try {
    if (!req.file) throw new AppError('Please select a valid PDF file to upload.', 400);

    const pool = getPool();
    const resumeUrl = `/uploads/${req.file.filename}`;
    const resumeFilename = req.file.originalname || 'Aditya_Gore_Resume.pdf';
    const sizeInKb = (req.file.size / 1024).toFixed(1);
    const resumeFilesize = req.file.size > (1024 * 1024)
      ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeInKb} KB`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const resumeUpdatedAt = req.body.updated_at || formattedDate;
    const resumeVersion = req.body.version || '2.1';

    const updates = [
      ['resume_url', resumeUrl],
      ['resume_filename', resumeFilename],
      ['resume_filesize', resumeFilesize],
      ['resume_updated_at', resumeUpdatedAt],
      ['resume_version', resumeVersion],
    ];
    for (const [k, v] of updates) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [k, v, v]
      );
    }

    // Sync to client/public so the static link stays in sync
    try {
      const publicPath = path.join(__dirname, '..', '..', 'client', 'public', 'Aditya_Gore_Resume.pdf');
      fs.copyFileSync(req.file.path, publicPath);
    } catch (copyErr) {
      logger.warn('Could not copy resume to client/public', { error: copyErr.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and published successfully!',
      resume: { resume_url: resumeUrl, resume_filename: resumeFilename, resume_filesize: resumeFilesize, resume_updated_at: resumeUpdatedAt, resume_version: resumeVersion },
    });
  } catch (err) { next(err); }
}

// GET /api/resume
export async function getResume(req, res, next) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT setting_key, setting_value FROM site_settings
       WHERE setting_key IN ('resume_url','resume_filename','resume_filesize','resume_updated_at','resume_version')`
    );
    const resumeMap = {
      resume_url: '/Aditya_Gore_Resume.pdf',
      resume_filename: 'Aditya_Gore_Resume.pdf',
      resume_filesize: '46.2 KB',
      resume_updated_at: '12 Sep 2026',
      resume_version: '2.1',
    };
    rows.forEach(r => { resumeMap[r.setting_key] = r.setting_value; });
    return res.status(200).json({ success: true, resume: resumeMap });
  } catch (err) { next(err); }
}
