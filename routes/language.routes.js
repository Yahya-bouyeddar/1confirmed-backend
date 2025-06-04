import express from "express";
import { getLanguages, updateUserLanguage } from "../controllers/language.controller.js";
import { protect } from "../middlewares/auth.js";
const router = express.Router();

router.get("/", getLanguages); 
router.put("/select", protect, updateUserLanguage); 

export default router;
