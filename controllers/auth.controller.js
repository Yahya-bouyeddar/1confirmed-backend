
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password, agencyName } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        agencyName,
      },
    });

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email introuvable." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        agencyName: user.agencyName,
        languageId: user.languageId,
        confirmedToken: user.confirmedToken,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
};
export const saveConfirmedToken = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token manquant." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        confirmedToken: token,
      },
    });

    res.status(200).json({
      message: "Token 1Confirmed enregistré avec succès.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        confirmedToken: updatedUser.confirmedToken,
      }
    });
  } catch (error) {
    console.error("Erreur saveConfirmedToken:", error);
    res.status(500).json({ message: "Erreur lors de l’enregistrement du token." });
  }
};
export const getMe = async (req, res) => {
  try {
    res.json(req.user); 
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération utilisateur" });
  }
};
