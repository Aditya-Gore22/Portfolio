import { Router } from 'express';
import { uploadImage, upload } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/', requireAuth, upload.single('image'), uploadImage);
export default router;
