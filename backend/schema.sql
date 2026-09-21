-- Lumine E-commerce Database Schema
CREATE DATABASE IF NOT EXISTS lumine_ecommerce;
USE lumine_ecommerce;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) NULL,
  category_id INT,
  stock INT DEFAULT 0,
  sizes VARCHAR(255) DEFAULT 'S,M,L,XL',
  colors VARCHAR(255) DEFAULT '',
  featured TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  size VARCHAR(20) DEFAULT NULL,
  color VARCHAR(40) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_fav (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_intent_id VARCHAR(255),
  shipping_name VARCHAR(150),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_phone VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  size VARCHAR(20),
  color VARCHAR(40),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  keywords VARCHAR(255) DEFAULT '',
  sort_order INT DEFAULT 0
);

-- Seed: categories
INSERT INTO categories (name, slug) VALUES
('Dresses','dresses'),('Tops','tops'),('Trousers','trousers'),('Outerwear','outerwear'),('Accessories','accessories');

-- Seed: admin user (password: Admin@123, hashed with bcrypt at seed time via config/seed.js instead)

-- Seed: FAQ for live chat auto-answers
INSERT INTO faqs (question, answer, keywords, sort_order) VALUES
('What are your shipping times?', 'Standard shipping takes 3-5 business days within the country. Express shipping (1-2 days) is available at checkout.', 'shipping,delivery,deliver,when,arrive', 1),
('What is your return policy?', 'You can return unworn items with tags within 14 days of delivery for a full refund. Start a return from your Orders page.', 'return,refund,exchange', 2),
('Which payment methods do you accept?', 'We accept all major credit/debit cards and secure online payments through Stripe. Prices can be viewed in LKR (Rs) or USD.', 'payment,pay,card,visa,mastercard,currency', 3),
('How do I track my order?', 'Once your order ships, you will receive a tracking link by email. You can also check order status under My Orders.', 'track,tracking,order status', 4),
('Do you ship internationally?', 'Yes, we currently ship to select countries. Shipping fees are calculated automatically at checkout based on your address.', 'international,worldwide,overseas', 5),
('How do I contact a human agent?', 'If I can''t answer your question, leave your email here and our support team will reply within 24 hours.', 'human,agent,support,contact,help', 6);
