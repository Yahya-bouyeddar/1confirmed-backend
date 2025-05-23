// controllers/credits.controller.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 🟢 GET /api/credits
export const getCredits = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        creditsUsed: true,
        creditsUsedThisMonth: true,
      },
    });

    res.json({
      available: user.credits || 0,
      totalUsed: user.creditsUsed || 0,
      usedThisMonth: user.creditsUsedThisMonth || 0,
    });
  } catch (error) {
    console.error('Erreur getCredits:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des crédits." });
  }
};

// 🟢 GET /api/credits/history
export const getCreditsHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const history = await prisma.creditHistory.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json(history);
  } catch (error) {
    console.error('Erreur getCreditsHistory:', error);
    res.status(500).json({ message: "Erreur lors de la récupération de l’historique." });
  }
};
