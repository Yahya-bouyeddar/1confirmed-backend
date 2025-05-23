import { PrismaClient } from "@prisma/client";
import axios from "axios";
const prisma = new PrismaClient();
const confirmedToken = process.env.CONFIRMED_TOKEN;
export const getLanguages = async (req, res) => {
  try {
    const response = await axios.get(
      "https://1confirmed.com/api/v1/languages",
      {
        headers: {
          Authorization: `Bearer ${confirmedToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Erreur récupération langues" });
  }
};

export const updateUserLanguage = async (req, res) => {
  const { languageId } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { languageId },
    });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour langue" });
  }
};
