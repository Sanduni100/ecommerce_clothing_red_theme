const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/products.routes"));
app.use("/api/categories", require("./routes/categories.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/favorites", require("./routes/favorites.routes"));
app.use("/api/orders", require("./routes/orders.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/chat", require("./routes/chat.routes"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Centralised error handler (e.g. multer file errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Lumine API running on http://localhost:${PORT}`));
