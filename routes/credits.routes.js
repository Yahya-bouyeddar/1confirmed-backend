// routes/credits.routes.js
import express from 'express';
import { getCredits, getCreditsHistory } from '../controllers/credits.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// 🔐 GET /api/credits
router.get('/', protect, getCredits);

// 🔐 GET /api/credits/history
router.get('/history', protect, getCreditsHistory);

export default router;
