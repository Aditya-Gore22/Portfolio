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
    await pool.query(
      'INSERT INTO experiences (id, role, company, period, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [id, role, company, period || '', description || '', JSON.stringify(skills || [])]
    );
    const [created] = await pool.query('SELECT * FROM experiences WHERE id = ?', [id]);
    return res.status(201).json({ success: true, data: created[0] });
  } catch (err) { next(err); }
}

export async function deleteExperience(req, res, next) {
  try {
    await getPool().query('DELETE FROM experiences WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Experience deleted.' });
  } catch (err) { next(err); }
}
