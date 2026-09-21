const express = require("express");
const Stripe = require("stripe");
const pool = require("../config/db");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Create a payment intent for the current cart total
router.post("/create-payment-intent", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body; // amount in smallest currency unit (e.g. cents)
    if (!amount || amount < 1) return res.status(400).json({ message: "Invalid amount" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment could not be initialised. Please try again." });
  }
});

// Finalise the order after payment succeeds
router.post("/", verifyToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { items, total, payment_intent_id, shipping } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: "Your cart is empty" });

    await conn.beginTransaction();
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total, status, payment_intent_id, shipping_name, shipping_address, shipping_city, shipping_phone)
       VALUES (?, ?, 'paid', ?, ?, ?, ?, ?)`,
      [req.user.id, total, payment_intent_id || null, shipping?.name || "", shipping?.address || "", shipping?.city || "", shipping?.phone || ""]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.quantity, item.size || null, item.color || null]
      );
      await conn.query("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [item.quantity, item.product_id]);
    }
    await conn.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    await conn.commit();
    res.status(201).json({ id: orderId, message: "Order placed successfully" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Could not place order. Please try again." });
  } finally {
    conn.release();
  }
});

router.get("/mine", verifyToken, async (req, res) => {
  const [orders] = await pool.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  for (const order of orders) {
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    order.items = items;
  }
  res.json(orders);
});

// Admin: all orders
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  const [orders] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
  );
  res.json(orders);
});

router.put("/:id/status", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query("UPDATE orders SET status=? WHERE id=?", [status, req.params.id]);
    res.json({ message: "Order status updated" });
  } catch (err) {
    res.status(500).json({ message: "Could not update order" });
  }
});

module.exports = router;
