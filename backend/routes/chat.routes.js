const express = require("express");
const pool = require("../config/db");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

// Public: list FAQs for the chat widget quick-select
router.get("/faqs", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM faqs ORDER BY sort_order ASC");
  res.json(rows);
});

// Public: send a message, get an auto-answer by keyword match
router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const [faqs] = await pool.query("SELECT * FROM faqs ORDER BY sort_order ASC");
    const text = message.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const faq of faqs) {
      const keywords = faq.keywords.split(",").map((k) => k.trim()).filter(Boolean);
      const score = keywords.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
      if (score > bestScore) {
        bestScore = score;
        best = faq;
      }
    }
    if (best) {
      return res.json({ answer: best.answer, matched: best.question });
    }
    res.json({
      answer: "I couldn't find an exact answer for that. Could you leave your email? Our support team will follow up within 24 hours, or pick a topic below.",
      matched: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Chat is temporarily unavailable" });
  }
});

// Admin: manage FAQs
router.post("/faqs", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { question, answer, keywords, sort_order } = req.body;
    if (!question || !answer) return res.status(400).json({ message: "Question and answer are required" });
    const [result] = await pool.query(
      "INSERT INTO faqs (question, answer, keywords, sort_order) VALUES (?, ?, ?, ?)",
      [question, answer, keywords || "", sort_order || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Could not create FAQ" });
  }
});

router.put("/faqs/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { question, answer, keywords, sort_order } = req.body;
    await pool.query("UPDATE faqs SET question=?, answer=?, keywords=?, sort_order=? WHERE id=?", [
      question, answer, keywords || "", sort_order || 0, req.params.id,
    ]);
    res.json({ message: "FAQ updated" });
  } catch (err) {
    res.status(500).json({ message: "Could not update FAQ" });
  }
});

router.delete("/faqs/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM faqs WHERE id=?", [req.params.id]);
    res.json({ message: "FAQ deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete FAQ" });
  }
});

module.exports = router;
