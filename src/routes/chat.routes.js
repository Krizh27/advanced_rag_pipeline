import express from "express";
import { askQuestion } from "../chat.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
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

export default router;
