const express = require("express");
const pool = require("../config/db");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.get("/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    const [[{ totalOrders }]] = await pool.query("SELECT COUNT(*) AS totalOrders FROM orders");
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total),0) AS totalRevenue FROM orders WHERE status != 'cancelled'");
    const [[{ totalProducts }]] = await pool.query("SELECT COUNT(*) AS totalProducts FROM products");
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role='customer'");
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at, u.name AS customer_name
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 6`
    );
    const [topProducts] = await pool.query(
      `SELECT p.name, SUM(oi.quantity) AS sold FROM order_items oi JOIN products p ON oi.product_id = p.id
       GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5`
    );
    res.json({ totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders, topProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load dashboard stats" });
  }
});

router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
  res.json(rows);
});

module.exports = router;
