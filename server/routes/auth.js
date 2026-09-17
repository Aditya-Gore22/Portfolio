import { Router } from 'express';
import { login, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/change-password', requireAuth, changePassword);
export default router;
