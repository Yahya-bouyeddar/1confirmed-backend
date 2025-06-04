// controllers/template.controller.js

import { fetchTemplates1Confirmed } from "../services/confirmedApi.js";


// export const getTemplates = async (req, res) => {
//   try {
//     const confirmedToken = req.user.confirmedToken;

//     if (!confirmedToken) {
//       return res.status(401).json({ message: "Token 1Confirmed manquant." });
//     }

//     const templates = await fetchTemplates1Confirmed(confirmedToken);
//     res.status(200).json(templates);
//   } catch (error) {
//     console.error(
//       "Erreur getTemplates:",
//       error.response?.data || error.message
//     );
//     res
//       .status(500)
//       .json({ message: "Erreur lors du chargement des templates." });
//   }
// };
export const getTemplates = async (req, res) => {
  try {
    const templates = await fetchTemplates1Confirmed(req.user.languageId);
    console.dir(templates.data[0], { depth: null });
    
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Erreur chargement templates' });
  }
};