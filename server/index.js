/**
 * index.js – Slim entry point for the Portfolio API server.
 *
 * Responsibilities:
 *   1. Bootstrap Express with global middleware (CORS, body parser, static files, request logger)
 *   2. Mount all API routers
 *   3. Register the central error handler (must be last)
 *   4. Initialise DB and start listening
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './config/db.js';
import logger from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route modules
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import contactRouter, { messagesRouter } from './routes/contact.js';
import adminRouter from './routes/admin.js';
import achievementsRouter from './routes/achievements.js';
import experiencesRouter from './routes/experiences.js';
import settingsRouter from './routes/settings.js';
import resumeRouter from './routes/resume.js';
import skillsRouter from './routes/skills.js';
import gameRouter from './routes/game.js';
import uploadRouter from './routes/upload.js';
import { trackVisit } from './controllers/adminController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(requestLogger);   // Log every request

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/projects',     projectsRouter);
app.use('/api/contact',      contactRouter);
app.use('/api/messages',     messagesRouter);
app.use('/api/admin',        adminRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/experiences',  experiencesRouter);
app.use('/api/settings',     settingsRouter);
app.use('/api/resume',       resumeRouter);
app.use('/api/skills',       skillsRouter);
app.use('/api/game',         gameRouter);
app.use('/api/upload',       uploadRouter);

// POST /api/track-visit  (thin standalone endpoint)
app.post('/api/track-visit', trackVisit);

// Root health check
app.get('/', (_req, res) => {
  res.send('Portfolio & Admin API is operational with MySQL, UUID, and JWT.');
});

// ── Central Error Handler (must be registered last) ─────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      logger.info('Server started', { port: PORT, env: process.env.NODE_ENV || 'development' });
    });
  } catch (error) {
    logger.error('Failed to start server', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
