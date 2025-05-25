// controllers/auth.controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔐 Fonction : Enregistrer un nouvel utilisateur
export const updateUser = async (req, res) => {
  const userData = req.body;
  const userId = parseInt(req.params.id);

  try {
    // Vérifie si l'utilisateur existe déjà
    await prisma.user.update({ where: { id:userId }, data: userData });
    res.status(201).json({ message: "Utilisateur mis à jour avec succès." });
  } catch (error) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'utilisateur."+error?.message });
  }
};
