import { Router } from 'express';
import { submitMessage, getMessages, toggleReadStatus, deleteMessage } from '../controllers/contactController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/', submitMessage);
export default router;

// Separate router for /messages
export const messagesRouter = Router();
messagesRouter.get('/', getMessages);
messagesRouter.patch('/:id/read', requireAuth, toggleReadStatus);
messagesRouter.delete('/:id', requireAuth, deleteMessage);
