import express from 'express';
import { login, register, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/current', authMiddleware, getCurrentUser);

export default router;