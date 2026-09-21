const express = require("express");
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.*, p.name, p.price, p.stock,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Could not load cart" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { product_id, quantity, size, color } = req.body;
    if (!product_id) return res.status(400).json({ message: "Product is required" });
    const [existing] = await pool.query(
      "SELECT * FROM cart_items WHERE user_id=? AND product_id=? AND size<=>? AND color<=>?",
      [req.user.id, product_id, size || null, color || null]
    );
    if (existing.length) {
      await pool.query("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [quantity || 1, existing[0].id]);
    } else {
      await pool.query(
        "INSERT INTO cart_items (user_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, product_id, quantity || 1, size || null, color || null]
      );
    }
    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add to cart" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });
    await pool.query("UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?", [quantity, req.params.id, req.user.id]);
    res.json({ message: "Cart updated" });
  } catch (err) {
    res.status(500).json({ message: "Could not update cart" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM cart_items WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Could not remove item" });
  }
});

module.exports = router;
