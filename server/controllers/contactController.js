/**
 * controllers/contactController.js
 */
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

// POST /api/contact
export async function submitMessage(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      throw new AppError('Name, email, and message are required.', 400);
    }
    const pool = getPool();
    const messageUuid = uuidv4();
    await pool.query(
      'INSERT INTO messages (id, name, email, subject, message, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [messageUuid, name.trim(), email.trim(), subject ? subject.trim() : 'General Inquiry', message.trim()]
    );
    const [inserted] = await pool.query('SELECT * FROM messages WHERE id = ?', [messageUuid]);
    return res.status(200).json({
      success: true,
      message: 'Transmission received! Your message has been saved to the database.',
      data: inserted[0],
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/messages
export async function getMessages(req, res, next) {
  try {
    const pool = getPool();
    const filter = req.query.filter;
    let query = 'SELECT * FROM messages ORDER BY created_at DESC';
    if (filter === 'unread') query = 'SELECT * FROM messages WHERE is_read = 0 ORDER BY created_at DESC';
    else if (filter === 'read') query = 'SELECT * FROM messages WHERE is_read = 1 ORDER BY created_at DESC';
    const [messages] = await pool.query(query);
    return res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/messages/:id/read
export async function toggleReadStatus(req, res, next) {
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
    return res.status(200).json({ success: true, data: updated[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/messages/:id
export async function deleteMessage(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new AppError('Message not found', 404);
    return res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
