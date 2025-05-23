// controllers/message.controller.js
import { PrismaClient } from "@prisma/client";
import { sendMessage1Confirmed, fetchTemplates1Confirmed } from "../services/confirmedApi.js";

const prisma = new PrismaClient();

export const sendMessage = async (req, res) => {
  // Log the entire request body
  console.log("📨 Received request body:", JSON.stringify(req.body, null, 2));
  
  const { phone, templateId, languageId, data, globalData, catchData } = req.body;
  const userId = req.user.id;

  // Log the extracted values
  console.log("📱 Phone:", phone);
  console.log("📋 Template ID:", templateId);
  console.log("🌐 Language ID:", languageId);
  console.log("📄 Template Data:", JSON.stringify(data, null, 2));

  // Basic validation
  if (!phone) {
    return res.status(400).json({ message: "Le numéro de téléphone est requis." });
  }
  if (!templateId) {
    return res.status(400).json({ message: "L'ID du template est requis." });
  }

  try {
    // Get template details to validate required variables
    const templatesResponse = await fetchTemplates1Confirmed();
    const template = templatesResponse.data.find(t => t.id === parseInt(templateId));
    
    if (!template) {
      return res.status(400).json({ message: "Template non trouvé." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Validate global variables
    const globalVariables = {};
    if (template.global_variables && template.global_variables.length > 0) {
      for (const variable of template.global_variables) {
        const value = globalData?.[variable.variable];
        if (!value) {
          return res.status(400).json({ 
            message: `La variable globale ${variable.name} (${variable.variable}) est requise.` 
          });
        }
        globalVariables[variable.variable] = value;
      }
    }

    // Validate catch data
    const catchVariables = {};
    if (template.catch_data && template.catch_data.length > 0) {
      for (const field of template.catch_data) {
        const value = catchData?.[field.name.toLowerCase()];
        if (!value) {
          return res.status(400).json({ 
            message: `Le champ ${field.name} est requis.` 
          });
        }
        catchVariables[field.name.toLowerCase()] = value;
      }
    }

    // Combine all variables
    const combinedData = {
      ...data,
      ...globalVariables,
      ...catchVariables
    };

    // Simplified payload - since template variables are handled by frontend
    const payload = {
      phone: phone,
      template_id: parseInt(templateId),
      template_account_flow_id: parseInt(templateId),
      language_id: parseInt(languageId || user.languageId || 1),
      name: user.agencyName || "Agence Immobilière",
      data: data || {}, // Use data as-is since it's prepared by frontend
    };

    console.log("⏳ Envoi du message à 1Confirmed avec payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await sendMessage1Confirmed(payload);
    console.log("✅ Réponse de 1Confirmed:", JSON.stringify(apiResponse, null, 2));

    const savedMessage = await prisma.message.create({
      data: {
        phone,
        templateId: String(templateId),
        languageId: String(languageId || user.languageId || 1),
        dataJson: JSON.stringify(data),
        status: apiResponse?.status || "pending",
        userId,
      },
    });

    res.status(200).json({ 
      success: true,
      message: savedMessage, 
      response: apiResponse 
    });
  } catch (error) {
    console.error("❌ Erreur sendMessage:", error.message);
    
    // Log additional error details
    if (error.response?.data) {
      console.error("API Error Details:", JSON.stringify(error.response.data, null, 2));
    }

    if (error.message.includes('template_account_flow_id is required')) {
      return res.status(400).json({ message: "ID du template manquant ou invalide." });
    }
    if (error.message.includes('data object with template variables')) {
      return res.status(400).json({ message: "Variables du template manquantes ou invalides." });
    }
    if (error.message.includes('recipient phone number')) {
      return res.status(400).json({ message: "Numéro de téléphone manquant ou invalide." });
    }
    if (error.message.includes('Invalid or expired')) {
      return res.status(401).json({ message: "Token 1Confirmed invalide ou expiré." });
    }
    if (error.message.includes('Invalid request:')) {
      return res.status(400).json({ 
        message: error.message,
        details: error.response?.data 
      });
    }

    res.status(500).json({ 
      message: "Erreur lors de l'envoi du message.", 
      error: error.message,
      details: error.response?.data
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
    res.status(500).json({ message: "Erreur lors de la récupération des messages." });
  }
};
