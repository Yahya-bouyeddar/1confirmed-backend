import express from 'express';
import { getCredits, getCreditsHistory } from '../controllers/credits.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getCredits);

router.get('/history', protect, getCreditsHistory);

export default router;
