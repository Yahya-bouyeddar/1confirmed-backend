import express from 'express';
import { getTemplates } from '../controllers/template.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getTemplates);

export default router;
