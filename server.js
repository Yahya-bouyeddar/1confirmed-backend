import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import app from './app.js';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Base de données connectée avec Prisma");

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur de connexion à la base :", error);
    process.exit(1);
  }
}

startServer();
