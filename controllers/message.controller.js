import { PrismaClient } from "@prisma/client";
import {
  sendMessage1Confirmed,
  fetchTemplates1Confirmed,
} from "../services/confirmedApi.js";
import axios from "axios";

const prisma = new PrismaClient();
const confirmedToken = process.env.CONFIRMED_TOKEN;
export const sendMessage = async (req, res) => {
  console.log("📨 Received request body:", JSON.stringify(req.body, null, 2));

  const { phone, templateId,countryId, data, globalData, catchData } =
    req.body;

  

  const userId = req.user.id;
  const languageId = req.user.languageId || 1;
  let template_account_flow_id =null
  const templateAccountIdRes = await axios.get(`https://1confirmed.com/api/v1/template/accounts`, {
        headers: { Authorization: `Bearer ${confirmedToken}` },
        params: {
          template_id: templateId
        },
      });
      if (templateAccountIdRes.data.data.length > 0){
        template_account_flow_id =  templateAccountIdRes.data.data.find((item) => item.country.id === countryId)?.template_account_flow_id
      }
      if (!template_account_flow_id) {
        template_account_flow_id = templateAccountIdRes.data.data[0]?.template_account_flow_id;
      }

  if (!phone || !templateId) {
    return res
      .status(400)
      .json({ message: "Téléphone et ID du template sont requis." });
  }

  try {
    const templatesResponse = await fetchTemplates1Confirmed(languageId);
    const template = templatesResponse.data.find(
      (t) => t.id === parseInt(templateId)
    );

    if (!template) {
      return res.status(400).json({ message: "Template non trouvé." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const globalVariables = {};
    if (template.global_variables?.length) {
      for (const variable of template.global_variables) {
        const value = globalData?.[variable.variable];
        if (!value) {
          return res.status(400).json({
            message: `La variable globale ${variable.name} (${variable.variable}) est requise.`,
          });
        }
        globalVariables[variable.variable] = value;
      }
    }

    const catchVariables = {};
    if (template.catch_data?.length) {
      for (const field of template.catch_data) {
        const key = field.name.toLowerCase();
        const value = catchData?.[key];
        if (!value) {
          return res
            .status(400)
            .json({ message: `Le champ ${field.name} est requis.` });
        }
        catchVariables[key] = value;
      }
    }

    const combinedData = {
      ...data,
      ...globalVariables,
      ...catchVariables,
    };

    const payload = {
      phone,
      template_id: parseInt(templateId),
      template_account_flow_id: parseInt(template_account_flow_id),
      language_id:languageId,
      name: user.agencyName || "Agence Immobilière",
      data:combinedData,
    };

    console.log("⏳ Envoi à 1Confirmed:", JSON.stringify(payload, null, 2));

    const apiResponse = await sendMessage1Confirmed(payload);

    const savedMessage = await prisma.message.create({
      data: {
        phone,
        templateId: String(templateId),
        languageId: String(payload.language_id),
        dataJson: JSON.stringify(combinedData),
        status: 'delivered',
        userId,
      },
    });

    res
      .status(200)
      .json({ success: true, message: savedMessage, response: apiResponse });
  } catch (error) {
    console.error("❌ Erreur sendMessage:", error.message);
    if (error.response?.data) {
      console.error(
        "API Error Details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    const knownErrors = [
      {
        match: "template_account_flow_id is required",
        message: "ID du template manquant ou invalide.",
      },
      {
        match: "data object with template variables",
        message: "Variables du template manquantes ou invalides.",
      },
      {
        match: "recipient phone number",
        message: "Numéro de téléphone manquant ou invalide.",
      },
      {
        match: "Invalid or expired",
        message: "Token 1Confirmed invalide ou expiré.",
      },
    ];

    for (const err of knownErrors) {
      if (error.message.includes(err.match)) {
        return res.status(400).json({ message: err.message });
      }
    }

    res.status(500).json({
      message: "Erreur lors de l'envoi du message.",
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.user.id;
  try {
    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur getMessages:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des messages." });
  }
};
