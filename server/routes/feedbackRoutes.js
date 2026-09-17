import express from 'express';
import { generateOrGetFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:interviewId', protect, generateOrGetFeedback);

export default router;
