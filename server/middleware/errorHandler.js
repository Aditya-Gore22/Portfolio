/**
 * middleware/errorHandler.js
 * Central Express error-handling middleware.
 *
 * All controllers call next(err) or next(new AppError(msg, status))
 * instead of sending their own 500 responses.
 *
 * Must be registered LAST in index.js after all routes.
 */
import logger from '../utils/logger.js';

/** Operational (known) error with an explicit HTTP status code. */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 4-argument signature tells Express this is an error handler. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : isDev
    ? err.message
    : 'An unexpected server error occurred.';

  logger.error('Request error', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: isDev ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && !err.isOperational ? { stack: err.stack } : {}),
  });
}
