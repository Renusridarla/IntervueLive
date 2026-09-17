import express from 'express';
import { uploadResume, getMyResume, generateQuestions } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume as uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, uploadMiddleware.single('resume'), uploadResume);
router.get('/my-resume', protect, getMyResume);
router.post('/generate-questions', protect, generateQuestions);

export default router;
