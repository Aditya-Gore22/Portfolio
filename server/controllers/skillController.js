/**
 * controllers/skillController.js
 */
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getSkills(req, res, next) {
  try {
    const [rows] = await getPool().query('SELECT * FROM skills ORDER BY category ASC, proficiency DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (err) { next(err); }
}

export async function createSkill(req, res, next) {
  try {
    const { name, category, proficiency, icon } = req.body;
    if (!name) throw new AppError('Skill name is required.', 400);
    const id = uuidv4();
    const pool = getPool();
    await pool.query(
      'INSERT INTO skills (id, name, category, proficiency, icon) VALUES (?, ?, ?, ?, ?)',
      [id, name.trim(), category ? category.trim() : 'General', parseInt(proficiency, 10) || 85, icon || 'FaCode']
    );
    const [created] = await pool.query('SELECT * FROM skills WHERE id = ?', [id]);
    return res.status(201).json({ success: true, message: 'Skill added to MySQL.', data: created[0] });
  } catch (err) { next(err); }
}

export async function deleteSkill(req, res, next) {
  try {
    await getPool().query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Skill deleted from MySQL.' });
  } catch (err) { next(err); }
}
