import express from "express";
import { askQuestion } from "../chat.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

router.post("/ask", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const result = await askQuestion(question);
    
    res.json(result);
  } catch (error) {
    console.error("Error generating answer:", error);
    res.status(500).json({ error: "An internal error occurred while processing your request." });
  }
});

// Error handling middleware specifically for Clerk auth errors
router.use((err, req, res, next) => {
  if (err.message === "Unauthenticated") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next(err);
});

export default router;
