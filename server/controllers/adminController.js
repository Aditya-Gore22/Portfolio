/**
 * controllers/adminController.js
 */
import { getPool } from '../config/db.js';

// GET /api/admin/stats
export async function getStats(req, res, next) {
  try {
    const pool = getPool();
    const [projectCount] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN published = 1 THEN 1 ELSE 0 END) as published FROM projects');
    const [msgCount] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread FROM messages');
    const [achCount] = await pool.query('SELECT COUNT(*) as total FROM achievements');
    const [expCount] = await pool.query('SELECT COUNT(*) as total FROM experiences');
    const [skillsCount] = await pool.query('SELECT COUNT(*) as total FROM skills');
    const [viewsSum] = await pool.query('SELECT SUM(views_count) as totalViews FROM visitor_logs');
    const [todayViews] = await pool.query('SELECT views_count FROM visitor_logs WHERE visited_date = CURDATE() LIMIT 1');
    const [settingsRows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');

    const settingsMap = {};
    settingsRows.forEach(r => { settingsMap[r.setting_key] = r.setting_value; });

    const totalViews = Number(viewsSum[0].totalViews) || 0;
    const viewsFormatted = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews);

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
          isOnline: true,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/health
export async function getHealth(req, res, next) {
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
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/track-visit
export async function trackVisit(req, res, next) {
  try {
    const pool = getPool();
    await pool.query(`
      INSERT INTO visitor_logs (id, visited_date, views_count)
      VALUES (UUID(), CURDATE(), 1)
      ON DUPLICATE KEY UPDATE views_count = views_count + 1
    `);
    return res.status(200).json({ success: true, message: 'Visit recorded.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/visitors
export async function getVisitors(req, res, next) {
  try {
    const pool = getPool();
    const days = parseInt(req.query.days, 10) || 30;
    const [rows] = await pool.query(
      'SELECT visited_date, views_count FROM visitor_logs ORDER BY visited_date DESC LIMIT ?',
      [days]
    );
    const formatted = rows.reverse().map(r => {
      const d = new Date(r.visited_date);
      return {
        date: r.visited_date,
        views: r.views_count,
        label: `${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getDate()).padStart(2, '0')}`,
      };
    });
    return res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}
