/**
 * controllers/experienceController.js
 */
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { parseJsonField } from '../utils/helpers.js';

export async function getExperiences(req, res, next) {
  try {
    const [rows] = await getPool().query('SELECT * FROM experiences ORDER BY created_at DESC');
    const parsed = rows.map(r => ({ ...r, skills: parseJsonField(r.skills, []) }));
    return res.status(200).json({ success: true, data: parsed });
  } catch (err) { next(err); }
}

export async function createExperience(req, res, next) {
  try {
    const { role, company, period, description, skills } = req.body;
    if (!role || !company) throw new AppError('Role and company required', 400);
    const id = uuidv4();
    const pool = getPool();
    const formattedSkills = typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : (Array.isArray(skills) ? skills : []);

    await pool.query(
      'INSERT INTO experiences (id, role, company, period, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [id, role.trim(), company.trim(), period ? period.trim() : '', description ? description.trim() : '', JSON.stringify(formattedSkills)]
    );
    const [created] = await pool.query('SELECT * FROM experiences WHERE id = ?', [id]);
    return res.status(201).json({
      success: true,
      data: { ...created[0], skills: parseJsonField(created[0].skills, []) }
    });
  } catch (err) { next(err); }
}

export async function updateExperience(req, res, next) {
  try {
    const { id } = req.params;
    const { role, company, period, description, skills } = req.body;
    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM experiences WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) throw new AppError('Experience not found', 404);

    const c = existing[0];
    const formattedSkills = skills !== undefined
      ? (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(skills) ? skills : []))
      : parseJsonField(c.skills, []);

    await pool.query(
      'UPDATE experiences SET role = ?, company = ?, period = ?, description = ?, skills = ? WHERE id = ?',
      [
        role !== undefined ? role.trim() : c.role,
        company !== undefined ? company.trim() : c.company,
        period !== undefined ? period.trim() : c.period,
        description !== undefined ? description.trim() : c.description,
        JSON.stringify(formattedSkills),
        id
      ]
    );
    const [updated] = await pool.query('SELECT * FROM experiences WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Experience updated.',
      data: { ...updated[0], skills: parseJsonField(updated[0].skills, []) }
    });
  } catch (err) { next(err); }
}

export async function deleteExperience(req, res, next) {
  try {
    await getPool().query('DELETE FROM experiences WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Experience deleted.' });
  } catch (err) { next(err); }
}
