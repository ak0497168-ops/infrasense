import express from 'express';
import { register, login, getMe, updatePreferences } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.patch('/preferences', authMiddleware, updatePreferences);

export default router;
