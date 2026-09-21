const express = require("express");
const pool = require("../config/db");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

// GET /api/products  (supports ?category=&search=&sort=&minPrice=&maxPrice=)
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, featured } = req.query;
    let sql = `SELECT p.*, c.name AS category_name, c.slug AS category_slug
               FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const params = [];
    if (category) {
      sql += " AND c.slug = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice) {
      sql += " AND p.price >= ?";
      params.push(minPrice);
    }
    if (maxPrice) {
      sql += " AND p.price <= ?";
      params.push(maxPrice);
    }
    if (featured === "true") {
      sql += " AND p.featured = 1";
    }
    if (sort === "price_asc") sql += " ORDER BY p.price ASC";
    else if (sort === "price_desc") sql += " ORDER BY p.price DESC";
    else if (sort === "newest") sql += " ORDER BY p.created_at DESC";
    else sql += " ORDER BY p.id DESC";

    const [products] = await pool.query(sql, params);
    if (!products.length) return res.json([]);

    const ids = products.map((p) => p.id);
    const [images] = await pool.query(
      `SELECT * FROM product_images WHERE product_id IN (?) ORDER BY sort_order ASC`,
      [ids]
    );
    const withImages = products.map((p) => ({
      ...p,
      images: images.filter((img) => img.product_id === p.id).map((img) => img.image_url),
    }));
    res.json(withImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    const [images] = await pool.query(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC",
      [req.params.id]
    );
    res.json({ ...rows[0], images: images.map((i) => i.image_url) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load product" });
  }
});

// POST /api/products  (admin, supports multiple images -> field name "images")
router.post("/", verifyToken, requireAdmin, upload.array("images", 8), async (req, res) => {
  try {
    const { name, description, price, compare_at_price, category_id, stock, sizes, colors, featured } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Name and price are required" });
    const slug = slugify(name);
    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, price, compare_at_price, category_id, stock, sizes, colors, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || "", price, compare_at_price || null, category_id || null, stock || 0, sizes || "S,M,L,XL", colors || "", featured ? 1 : 0]
    );
    const productId = result.insertId;
    if (req.files && req.files.length) {
      const values = req.files.map((f, idx) => [productId, `/uploads/products/${f.filename}`, idx]);
      await pool.query("INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?", [values]);
    }
    res.status(201).json({ id: productId, message: "Product created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create product" });
  }
});

// PUT /api/products/:id (admin, can append more images)
router.put("/:id", verifyToken, requireAdmin, upload.array("images", 8), async (req, res) => {
  try {
    const { name, description, price, compare_at_price, category_id, stock, sizes, colors, featured } = req.body;
    await pool.query(
      `UPDATE products SET name=?, description=?, price=?, compare_at_price=?, category_id=?, stock=?, sizes=?, colors=?, featured=? WHERE id=?`,
      [name, description, price, compare_at_price || null, category_id || null, stock || 0, sizes, colors || "", featured ? 1 : 0, req.params.id]
    );
    if (req.files && req.files.length) {
      const [existing] = await pool.query("SELECT MAX(sort_order) AS maxOrder FROM product_images WHERE product_id = ?", [req.params.id]);
      let start = (existing[0].maxOrder ?? -1) + 1;
      const values = req.files.map((f, idx) => [req.params.id, `/uploads/products/${f.filename}`, start + idx]);
      await pool.query("INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?", [values]);
    }
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update product" });
  }
});

// DELETE /api/products/:id (admin)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete product" });
  }
});

// DELETE /api/products/:id/images/:imageId (admin, remove one of several images)
router.delete("/:id/images/:imageId", verifyToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM product_images WHERE id = ? AND product_id = ?", [req.params.imageId, req.params.id]);
    res.json({ message: "Image removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not remove image" });
  }
});

module.exports = router;
