
import express from 'express';
import { register, login, saveConfirmedToken, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);
router.post('/save-token', protect, saveConfirmedToken);
router.get("/me", protect, getMe);

export default router;
