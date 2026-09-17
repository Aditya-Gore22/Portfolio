import { Router } from 'express';
import { getStats, getHealth, trackVisit, getVisitors } from '../controllers/adminController.js';
const router = Router();
router.get('/stats', getStats);
router.get('/health', getHealth);
router.get('/visitors', getVisitors);
export default router;
