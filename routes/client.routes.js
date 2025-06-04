
import express from 'express';
import {
  createClient,
  getClients,
  updateClient,
  deleteClient
} from '../controllers/client.controller.js';

import { protect } from '../middlewares/auth.js';

const router = express.Router();


router.post('/', protect, createClient);

router.get('/', protect, getClients);

router.put('/:id', protect, updateClient);

router.delete('/:id', protect, deleteClient);

export default router;
