// routes/auth.routes.js

import express from "express";

import { protect } from "../middlewares/auth.js";
import { updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/:id", protect, updateUser);

export default router;
