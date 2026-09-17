import { Router } from 'express';
import { uploadResumeFile, getResume, uploadResume } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/upload', requireAuth, uploadResume.single('resume'), uploadResumeFile);
router.get('/', getResume);
export default router;
