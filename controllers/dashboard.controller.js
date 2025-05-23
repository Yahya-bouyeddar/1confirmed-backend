// import prisma from "../lib/prisma.js";
import axios from "axios";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const [totalClients, totalMessages] = await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.message.count({ where: { userId } }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const token = process.env.CONFIRMED_TOKEN;
    let totalTemplates = 0;

    if (token) {
      const templatesRes = await axios.get("https://1confirmed.com/api/v1/templates", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          language_id: user.languageId || 1,
          is_broadcast: 0,
        },
      });

      totalTemplates = templatesRes.data?.data?.length || 0;
    }

    res.json({
      totalClients,
      totalMessages,
      totalTemplates,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Erreur getDashboardStats:", error.message);
    res.status(500).json({ message: "Erreur récupération statistiques" });
  }
};
