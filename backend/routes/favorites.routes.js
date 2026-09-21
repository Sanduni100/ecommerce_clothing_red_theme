const express = require("express");
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT f.id AS favorite_id, p.*,
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
     FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = ?`,
    [req.user.id]
  );
  res.json(rows);
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    await pool.query("INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)", [req.user.id, product_id]);
    res.status(201).json({ message: "Added to favourites" });
  } catch (err) {
    res.status(500).json({ message: "Could not add favourite" });
  }
});

router.delete("/:productId", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM favorites WHERE user_id=? AND product_id=?", [req.user.id, req.params.productId]);
    res.json({ message: "Removed from favourites" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove favourite" });
  }
});

module.exports = router;
