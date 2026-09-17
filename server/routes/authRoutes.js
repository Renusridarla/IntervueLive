import express from 'express';
import { registerUser, loginUser, getMe, getCandidates } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/candidates', protect, authorizeRoles('interviewer'), getCandidates);

export default router;
