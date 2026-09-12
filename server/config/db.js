import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_JSON_FILE = path.join(__dirname, '..', 'data', 'projects.json');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

let pool = null;

export async function initDatabase() {
  try {
    // 1. Ensure database exists
    const adminConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConnection.end();

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
      console.log('Migrating tables to UUID schema...');
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
        full_name VARCHAR(150) DEFAULT 'Aditya Gore',
        email VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure full_name exists if table was created previously
    try {
      await pool.query("ALTER TABLE admin_users ADD COLUMN full_name VARCHAR(150) DEFAULT 'Aditya Gore'");
    } catch (e) {
      // Column already exists, safe to ignore
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_scores (
        id VARCHAR(36) PRIMARY KEY,
        player_name VARCHAR(100) DEFAULT 'Aditya',
        character_chosen VARCHAR(50) DEFAULT 'Aditya',
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
        image VARCHAR(500),
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

    // 5. Seed default admin user if not exists
    const [adminRows] = await pool.query('SELECT COUNT(*) as count FROM admin_users');
    if (adminRows[0].count === 0) {
      console.log('Seeding initial admin user with UUID...');
      const adminUsername = process.env.ADMIN_USERNAME || 'aditya';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const passwordHash = bcrypt.hashSync(adminPassword, 10);
      const adminId = uuidv4();

      await pool.query(
        `INSERT INTO admin_users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
        [adminId, adminUsername, 'adityagore@example.com', passwordHash, 'admin']
      );
      console.log(`Default admin created: ${adminUsername} (UUID: ${adminId})`);
    }

    // 6. Seed initial projects from projects.json with UUIDs
    const [projectRows] = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (projectRows[0].count === 0 && fs.existsSync(PROJECTS_JSON_FILE)) {
      console.log('Seeding projects with UUIDs into MySQL...');
      const rawData = fs.readFileSync(PROJECTS_JSON_FILE, 'utf-8');
      const seedProjects = JSON.parse(rawData || '[]');

      for (const p of seedProjects) {
        const projectUuid = uuidv4();
        await pool.query(
          `INSERT INTO projects (
            id, slug, numericId, title, shortDescription, fullDescription, 
            image, category, tags, gallery, features, techStack, 
            liveDemoUrl, githubUrl, published, featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            projectUuid,
            p.id, // slug (e.g. 'construction-management-system')
            p.numericId || null,
            p.title,
            p.shortDescription || '',
            p.fullDescription || '',
            p.image || '',
            p.category || 'Full Stack',
            JSON.stringify(p.tags || []),
            JSON.stringify(p.gallery || []),
            JSON.stringify(p.features || []),
            JSON.stringify(p.techStack || []),
            p.liveDemoUrl || '',
            p.githubUrl || '',
            1,
            1
          ]
        );
      }
      console.log(`Seeded ${seedProjects.length} projects with UUID primary keys.`);
    }

    // 7. Seed initial messages with UUIDs
    const [msgRows] = await pool.query('SELECT COUNT(*) as count FROM messages');
    if (msgRows[0].count === 0) {
      console.log('Seeding initial messages with UUIDs...');
      const sampleMessages = [
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          subject: 'Portfolio Appreciation',
          message: 'Hey! I really liked your portfolio. Are you available for freelance projects or full-time opportunities?',
          is_read: 0,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          name: 'Priya Singh',
          email: 'priya.singh@techcorp.io',
          subject: 'Potential Opportunity',
          message: 'Can we discuss a potential opportunity for a Full Stack Developer role on our engineering team?',
          is_read: 0,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000)
        },
        {
          name: 'Aman Kumar',
          email: 'aman.kumar@devmail.com',
          subject: 'Question on Architecture',
          message: 'Great work on your projects! I had a few questions about your backend implementation and database schema.',
          is_read: 0,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          name: 'Neha Tiwari',
          email: 'neha.t@creativepulse.com',
          subject: 'Gaming Theme Feedback',
          message: 'Loved the gaming theme! It\'s really unique and interactive. The retro pixel game was super fun.',
          is_read: 0,
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000)
        },
        {
          name: 'Vikram Patel',
          email: 'vikram.p@startupvalley.co',
          subject: 'Internship Opportunities',
          message: 'Are you open to internships or summer developer roles? Impressive work on the Construction Management project.',
          is_read: 0,
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000)
        }
      ];

      for (const m of sampleMessages) {
        await pool.query(
          `INSERT INTO messages (id, name, email, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), m.name, m.email, m.subject, m.message, m.is_read, m.created_at]
        );
      }
    }

    // 8. Seed achievements with UUIDs
    const [achRows] = await pool.query('SELECT COUNT(*) as count FROM achievements');
    if (achRows[0].count === 0) {
      console.log('Seeding initial achievements with UUIDs...');
      const sampleAchievements = [
        {
          title: 'Full Stack Web Development Certification',
          organization: 'Meta / Coursera',
          year: '2024',
          description: 'Completed comprehensive specializations in React, Node.js, and relational database systems.',
          icon: 'FaAward'
        },
        {
          title: 'CodeSprint Hackathon Finalist',
          organization: 'National Tech Summit',
          year: '2023',
          description: 'Ranked top 10 nationwide for building an emergency logistics and real-time dispatch dashboard.',
          icon: 'FaTrophy'
        },
        {
          title: '150+ LeetCode Data Structures Solved',
          organization: 'LeetCode',
          year: '2024',
          description: 'Demonstrated deep problem-solving skills in algorithms, dynamic programming, and graphs.',
          icon: 'FaMedal'
        },
        {
          title: 'Top Open Source Contributor',
          organization: 'GitHub Community',
          year: '2023',
          description: 'Contributed developer tools, bug fixes, and documentation to active open-source repositories.',
          icon: 'FaStar'
        }
      ];

      for (const a of sampleAchievements) {
        await pool.query(
          `INSERT INTO achievements (id, title, organization, year, description, icon) VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), a.title, a.organization, a.year, a.description, a.icon]
        );
      }
    }

    // 9. Seed experiences with UUIDs
    const [expRows] = await pool.query('SELECT COUNT(*) as count FROM experiences');
    if (expRows[0].count === 0) {
      console.log('Seeding initial experiences with UUIDs...');
      const sampleExperiences = [
        {
          role: 'Full Stack Developer Intern',
          company: 'Aquil Projects',
          period: '2024 - Present',
          description: 'Building modern responsive web applications, RESTful APIs in Node.js, and relational schemas in MySQL.',
          skills: JSON.stringify(['React', 'Node.js', 'Express', 'MySQL', 'Git'])
        },
        {
          role: 'Freelance Web Developer',
          company: 'Independent Contractor',
          period: '2023 - 2024',
          description: 'Delivered client landing pages, performance optimizations, and interactive front-ends.',
          skills: JSON.stringify(['JavaScript', 'HTML5', 'CSS3', 'UI/UX Design'])
        }
      ];

      for (const e of sampleExperiences) {
        await pool.query(
          `INSERT INTO experiences (id, role, company, period, description, skills) VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), e.role, e.company, e.period, e.description, e.skills]
        );
      }
    }

    // 10. Seed visitor logs with UUIDs
    const [visitorRows] = await pool.query('SELECT COUNT(*) as count FROM visitor_logs');
    if (visitorRows[0].count === 0) {
      console.log('Seeding 30-day visitor logs with UUIDs...');
      const counts = [
        22, 18, 35, 42, 28, 45, 52, 65, 38, 48,
        58, 62, 70, 85, 95, 120, 110, 88, 75, 60,
        55, 48, 52, 45, 68, 55, 62, 50, 42, 38
      ];

      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = counts[29 - i] || 35;

        await pool.query(
          `INSERT INTO visitor_logs (id, visited_date, views_count) VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE views_count = ?`,
          [uuidv4(), dateStr, count, count]
        );
      }
    }

    // 12. Seed skills if empty
    const [skillsRows] = await pool.query('SELECT COUNT(*) as count FROM skills');
    if (skillsRows[0].count === 0) {
      console.log('Seeding initial skills with UUIDs...');
      const defaultSkills = [
        { name: 'React', category: 'Frontend', proficiency: 92, icon: 'SiReact' },
        { name: 'JavaScript (ES6+)', category: 'Frontend', proficiency: 90, icon: 'SiJavascript' },
        { name: 'Node.js', category: 'Backend', proficiency: 88, icon: 'SiNodedotjs' },
        { name: 'Express.js', category: 'Backend', proficiency: 85, icon: 'SiExpress' },
        { name: 'MySQL', category: 'Database', proficiency: 86, icon: 'SiMysql' },
        { name: 'REST APIs', category: 'Backend', proficiency: 90, icon: 'FaProjectDiagram' },
        { name: 'HTML5 & CSS3', category: 'Frontend', proficiency: 94, icon: 'SiHtml5' },
        { name: 'Git & GitHub', category: 'Tools', proficiency: 88, icon: 'SiGit' },
        { name: 'JWT Authentication', category: 'Backend', proficiency: 85, icon: 'FaLock' },
        { name: 'Java', category: 'Backend', proficiency: 80, icon: 'FaJava' },
        { name: 'C++', category: 'Languages', proficiency: 78, icon: 'FaCode' },
        { name: 'Python', category: 'Languages', proficiency: 82, icon: 'FaCode' }
      ];

      for (const s of defaultSkills) {
        await pool.query(
          `INSERT INTO skills (id, name, category, proficiency, icon) VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), s.name, s.category, s.proficiency, s.icon]
        );
      }
    }

    // 13. Seed game scores if empty
    const [gameRows] = await pool.query('SELECT COUNT(*) as count FROM game_scores');
    if (gameRows[0].count === 0) {
      console.log('Seeding initial game scores with UUIDs...');
      const defaultScores = [
        { player_name: 'Aditya', character_chosen: 'Aditya', time_seconds: 48, bugs_squashed: 8, outcome: 'victory' },
        { player_name: 'Maya', character_chosen: 'Maya', time_seconds: 56, bugs_squashed: 10, outcome: 'victory' },
        { player_name: 'Aditya', character_chosen: 'Aditya', time_seconds: 64, bugs_squashed: 6, outcome: 'victory' },
        { player_name: 'Guest Player', character_chosen: 'Aditya', time_seconds: 32, bugs_squashed: 3, outcome: 'gameover' },
        { player_name: 'Maya', character_chosen: 'Maya', time_seconds: 51, bugs_squashed: 9, outcome: 'victory' }
      ];

      for (const gs of defaultScores) {
        await pool.query(
          `INSERT INTO game_scores (id, player_name, character_chosen, time_seconds, bugs_squashed, outcome) VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), gs.player_name, gs.character_chosen, gs.time_seconds, gs.bugs_squashed, gs.outcome]
        );
      }
    }

    // 14. Seed initial site settings if not present
    const defaultSiteSettings = [
      { key: 'site_title', value: 'Aditya Gore | Full Stack Developer Portfolio' },
      { key: 'admin_name', value: 'Aditya Gore' },
      { key: 'admin_tagline', value: 'Full Stack Web Developer • Database Administrator' },
      { key: 'admin_quote', value: 'Build. Improve. Repeat.' },
      { key: 'contact_email', value: 'adityagore@example.com' },
      { key: 'linkedin_url', value: 'https://www.linkedin.com/in/aditya-gore-b37233266/' },
      { key: 'github_url', value: 'https://github.com/Aditya-Gore22' },
      { key: 'portfolio_url', value: 'https://aditya-gore.dev' }
    ];
    for (const s of defaultSiteSettings) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = setting_value`,
        [s.key, s.value]
      );
    }

    console.log('MySQL database connected & UUID schema ready.');
    return pool;
  } catch (error) {
    console.error('MySQL database initialization failed:', error);
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
