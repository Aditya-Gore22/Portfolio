import { Router } from 'express';
import { getSkills, createSkill, deleteSkill } from '../controllers/skillController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', getSkills);
router.post('/', requireAuth, createSkill);
router.delete('/:id', requireAuth, deleteSkill);
export default router;
