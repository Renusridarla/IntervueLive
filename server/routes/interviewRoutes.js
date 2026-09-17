import express from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewByRoomId,
  saveQuestionResponse,
  updateInterviewStatus
} from '../controllers/interviewController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('interviewer'), createInterview);
router.get('/', protect, getInterviews);
router.get('/room/:roomId', protect, getInterviewByRoomId);
router.put('/question/:questionId/response', protect, saveQuestionResponse);
router.put('/:id/status', protect, updateInterviewStatus);

export default router;
