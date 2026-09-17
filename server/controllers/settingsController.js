/**
 * controllers/settingsController.js
 */
import { getPool } from '../config/db.js';

export async function getSettings(req, res, next) {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM site_settings');
    const defaults = {
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
      resume_version: '2.1',
    };
    const settingsMap = { ...defaults };
    rows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });
    return res.status(200).json({ success: true, settings: settingsMap });
  } catch (err) { next(err); }
}

export async function updateSettings(req, res, next) {
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
    if (settings.contact_email) {
      await pool.query('UPDATE admin_users SET email = ? WHERE id = ?', [settings.contact_email.trim(), req.user.id]);
    }
    if (settings.admin_name) {
      await pool.query('UPDATE admin_users SET full_name = ? WHERE id = ?', [settings.admin_name.trim(), req.user.id]);
    }
    return res.status(200).json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) { next(err); }
}
