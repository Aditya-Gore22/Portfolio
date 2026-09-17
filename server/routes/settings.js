import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', getSettings);
router.put('/', requireAuth, updateSettings);
export default router;
