
import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);

export default router;
