import { PrismaClient } from '@prisma/client';
import { fetchCredits1Confirmed } from '../services/confirmedApi.js';
const prisma = new PrismaClient();

export const getCredits = async (req, res) => {
  try {
    const data = await fetchCredits1Confirmed();
    res.json( data);
  } catch (error) {
    console.error('Erreur getCredits:', error.message);
    res.status(500).json({ message: "Impossible de récupérer le solde 1Confirmed." });
  }
};

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
