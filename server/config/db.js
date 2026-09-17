import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

dotenv.config();

const useSsl = process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1' && process.env.DB_HOST !== 'localhost');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
};

let pool = null;

export async function initDatabase() {
  try {
    // 1. Ensure database exists (for local or managed environments)
    try {
      const adminConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        ssl: dbConfig.ssl
      });

      await adminConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await adminConnection.end();
    } catch (dbErr) {
      // For cloud providers (like TiDB or Aiven), database is often pre-created
      logger.warn('Database verification note', { message: dbErr.message });
    }

    // 2. Initialize pool
    pool = mysql.createPool(dbConfig);

    // 3. Check if table migration to UUID is needed
    let needsMigration = false;
    try {
      const [columns] = await pool.query(`SHOW COLUMNS FROM projects LIKE 'slug'`);
      if (columns.length === 0) {
        needsMigration = true;
      }
    } catch (e) {
      // Table doesn't exist yet
    }

    if (needsMigration) {
      logger.info('Migrating tables to UUID schema...');
      await pool.query('DROP TABLE IF EXISTS projects');
      await pool.query('DROP TABLE IF EXISTS messages');
      await pool.query('DROP TABLE IF EXISTS achievements');
      await pool.query('DROP TABLE IF EXISTS experiences');
      await pool.query('DROP TABLE IF EXISTS skills');
      await pool.query('DROP TABLE IF EXISTS visitor_logs');
    }

    // 4. Create Tables with UUID (VARCHAR(36)) Primary Keys
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(150),
        email VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure full_name exists if table was created previously
    try {
      await pool.query("ALTER TABLE admin_users ADD COLUMN full_name VARCHAR(150)");
    } catch (e) {
      // Column already exists, safe to ignore
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_scores (
        id VARCHAR(36) PRIMARY KEY,
        player_name VARCHAR(100) DEFAULT 'Player',
        character_chosen VARCHAR(50) DEFAULT 'Player',
        time_seconds INT NOT NULL,
        bugs_squashed INT DEFAULT 0,
        outcome VARCHAR(50) DEFAULT 'victory',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        numericId INT UNIQUE AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        shortDescription TEXT,
        fullDescription TEXT,
        image LONGTEXT,
        category VARCHAR(100) DEFAULT 'Full Stack',
        tags JSON,
        gallery JSON,
        features JSON,
        techStack JSON,
        liveDemoUrl VARCHAR(500),
        githubUrl VARCHAR(500),
        published TINYINT(1) DEFAULT 1,
        featured TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure projects.image is LONGTEXT (for base64 or long image URLs)
    try {
      await pool.query("ALTER TABLE projects MODIFY COLUMN image LONGTEXT");
    } catch (e) {
      // safe to ignore
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        year VARCHAR(50),
        description TEXT,
        icon VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiences (
        id VARCHAR(36) PRIMARY KEY,
        role VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        period VARCHAR(100),
        description TEXT,
        skills JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100),
        proficiency INT DEFAULT 85,
        icon VARCHAR(100)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitor_logs (
        id VARCHAR(36) PRIMARY KEY,
        visited_date DATE UNIQUE,
        views_count INT DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Seed default admin user if not exists (only from .env)
    const [adminRows] = await pool.query('SELECT COUNT(*) as count FROM admin_users');
    if (adminRows[0].count === 0) {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminFullName = process.env.ADMIN_FULL_NAME || null;
      const adminEmail = process.env.ADMIN_EMAIL || null;

      if (adminUsername && adminPassword) {
        logger.info('Seeding initial admin user from environment variables...');
        const passwordHash = bcrypt.hashSync(adminPassword, 10);
        const adminId = uuidv4();

        await pool.query(
          `INSERT INTO admin_users (id, username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
          [adminId, adminUsername, adminFullName, adminEmail, passwordHash, 'admin']
        );
        logger.info('Default admin created', { username: adminUsername, uuid: adminId });
      } else {
        logger.warn('No ADMIN_USERNAME / ADMIN_PASSWORD configured in .env; skipping initial admin seed.');
      }
    }

    // 6. Ensure default site settings exist from environment variables
    const siteSettings = [
      { key: 'site_title', value: process.env.SITE_TITLE },
      { key: 'admin_name', value: process.env.ADMIN_FULL_NAME },
      { key: 'admin_tagline', value: process.env.ADMIN_TAGLINE },
      { key: 'admin_quote', value: process.env.ADMIN_QUOTE },
      { key: 'contact_email', value: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL },
      { key: 'linkedin_url', value: process.env.LINKEDIN_URL },
      { key: 'github_url', value: process.env.GITHUB_URL },
      { key: 'portfolio_url', value: process.env.PORTFOLIO_URL }
    ];

    for (const s of siteSettings) {
      if (s.value) {
        await pool.query(
          `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = setting_value`,
          [s.key, s.value]
        );
      }
    }

    logger.info('MySQL database connected & UUID schema ready.');
    return pool;
  } catch (error) {
    logger.error('MySQL database initialization failed', { message: error.message, stack: error.stack });
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDatabase() first.');
  }
  return pool;
}

export default {
  initDatabase,
  getPool
};
