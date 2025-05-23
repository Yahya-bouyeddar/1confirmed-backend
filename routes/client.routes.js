// routes/client.routes.js

import express from 'express';
import {
  createClient,
  getClients,
  updateClient,
  deleteClient
} from '../controllers/client.controller.js';

import { protect } from '../middlewares/auth.js';

const router = express.Router();

// 🔐 Toutes les routes ici sont protégées par token JWT

// ➕ Ajouter un client
router.post('/', protect, createClient);

// 📋 Voir la liste des clients de l'agence connectée
router.get('/', protect, getClients);

// ✏️ Modifier un client
router.put('/:id', protect, updateClient);

// ❌ Supprimer un client
router.delete('/:id', protect, deleteClient);

export default router;
