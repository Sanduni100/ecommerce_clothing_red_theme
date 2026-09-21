const express = require("express");
const pool = require("../config/db");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  res.json(rows);
});

router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ message: "Name and slug are required" });
    const [result] = await pool.query("INSERT INTO categories (name, slug) VALUES (?, ?)", [name, slug]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Could not create category" });
  }
});

module.exports = router;
