/**
 * controllers/achievementController.js
 */
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getAchievements(req, res, next) {
  try {
    const [rows] = await getPool().query('SELECT * FROM achievements ORDER BY created_at DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) { next(err); }
}

export async function createAchievement(req, res, next) {
  try {
    const { title, organization, year, description, icon } = req.body;
    if (!title) throw new AppError('Title is required', 400);
    const id = uuidv4();
    const pool = getPool();
    await pool.query(
      'INSERT INTO achievements (id, title, organization, year, description, icon) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, organization || '', year || new Date().getFullYear(), description || '', icon || 'FaAward']
    );
    const [created] = await pool.query('SELECT * FROM achievements WHERE id = ?', [id]);
    return res.status(201).json({ success: true, data: created[0] });
  } catch (err) { next(err); }
}

export async function deleteAchievement(req, res, next) {
  try {
    await getPool().query('DELETE FROM achievements WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Achievement deleted.' });
  } catch (err) { next(err); }
}
