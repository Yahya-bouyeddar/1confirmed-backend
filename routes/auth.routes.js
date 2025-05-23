// routes/auth.routes.js

import express from 'express';
import { register, login, saveConfirmedToken, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// 📩 POST /api/auth/register
router.post('/register', register);

// 🔐 POST /api/auth/login
router.post('/login', login);
router.post('/save-token', protect, saveConfirmedToken);
router.get("/me", protect, getMe);

export default router;
