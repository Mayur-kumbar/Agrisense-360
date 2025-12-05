// src/routes/advisories.js
import express from "express";
import { createAdvisory, getAdvisories, getAdvisoryById } from "../controllers/advisoryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// POST from n8n (protected by service token or Bearer JWT)
router.post("/", createAdvisory);

// GET list (protected for now — you can open it later)
router.get("/", requireAuth, getAdvisories);

// GET a single advisory
router.get("/:id", requireAuth, getAdvisoryById);

export default router;
