import express from "express";
import { getLanguages, updateUserLanguage } from "../controllers/language.controller.js";
import { protect } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", getLanguages); // ✅ public
router.put("/select", protect, updateUserLanguage); // ✅ privé

export default router;
