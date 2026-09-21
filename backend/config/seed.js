// Seeds an admin user + demo products with placeholder images.
// Run with: npm run seed  (after schema.sql has been imported)
const bcrypt = require("bcryptjs");
const pool = require("./db");

async function seed() {
  const hashed = await bcrypt.hash("Admin@123", 10);
  await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin') ON DUPLICATE KEY UPDATE password=VALUES(password)",
    ["Admin", "admin@lumine.com", hashed]
  );

  const [cats] = await pool.query("SELECT id, slug FROM categories");
  const catId = (slug) => cats.find((c) => c.slug === slug)?.id || null;

  const demo = [
    { name: "Casual Checkered Flannel", price: 49.0, category: "tops" },
    { name: "Short Party Dress", price: 79.0, category: "dresses" },
    { name: "Woven Blazer & Crop Top", price: 68.0, category: "outerwear" },
    { name: "Summer Floral Shirt", price: 39.0, category: "tops" },
  ];

  for (const d of demo) {
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const [r] = await pool.query(
      "INSERT INTO products (name, slug, description, price, category_id, stock, featured) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [d.name, slug, `${d.name} — made from soft, durable fabric.`, d.price, catId(d.category), 25]
    );
    await pool.query("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, 0)", [
      r.insertId,
      "/placeholder.svg",
    ]);
  }

  console.log("Seed complete. Admin login: admin@lumine.com / Admin@123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
