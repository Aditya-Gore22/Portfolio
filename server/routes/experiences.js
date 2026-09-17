import { Router } from 'express';
import { getExperiences, createExperience, deleteExperience } from '../controllers/experienceController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', getExperiences);
router.post('/', requireAuth, createExperience);
router.delete('/:id', requireAuth, deleteExperience);
export default router;
