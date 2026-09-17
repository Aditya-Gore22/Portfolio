/**
 * controllers/gameController.js
 */
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/db.js';

export async function getGameStats(req, res, next) {
  try {
    const pool = getPool();
    const [runsCount] = await pool.query('SELECT COUNT(*) as totalRuns, SUM(bugs_squashed) as totalBugs FROM game_scores');
    const [bestTimeRow] = await pool.query("SELECT MIN(time_seconds) as bestTime FROM game_scores WHERE outcome = 'victory'");
    const [favHeroRow] = await pool.query('SELECT character_chosen, COUNT(*) as count FROM game_scores GROUP BY character_chosen ORDER BY count DESC LIMIT 1');
    const [recentScores] = await pool.query('SELECT * FROM game_scores ORDER BY created_at DESC LIMIT 8');

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
        recentScores,
      },
    });
  } catch (err) { next(err); }
}

export async function recordScore(req, res, next) {
  try {
    const { player_name, character_chosen, time_seconds, bugs_squashed, outcome } = req.body;
    const pool = getPool();
    const id = uuidv4();
    await pool.query(
      'INSERT INTO game_scores (id, player_name, character_chosen, time_seconds, bugs_squashed, outcome) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id,
        (player_name || 'Player').slice(0, 100),
        character_chosen || 'Aditya',
        parseInt(time_seconds, 10) || 0,
        parseInt(bugs_squashed, 10) || 0,
        outcome || 'victory',
      ]
    );
    return res.status(201).json({ success: true, message: 'Game run recorded in MySQL.', id });
  } catch (err) { next(err); }
}
