-- ============================================================
--  Fasty Shop — Full Database Schema + Seed Data with Images
--  Run: mysql -u root -p < config/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS fasty_shop;
USE fasty_shop;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  address    TEXT,
  city       VARCHAR(100),
  pincode    VARCHAR(10),
  role       ENUM('customer','admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  emoji VARCHAR(10)
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock          INT DEFAULT 0,
  category_id    INT,
  emoji          VARCHAR(10) DEFAULT '📦',
  image_url      VARCHAR(500) DEFAULT NULL,
  images         JSON DEFAULT NULL,
  badge          ENUM('sale','new','hot','') DEFAULT '',
  rating         DECIMAL(3,1) DEFAULT 0.0,
  review_count   INT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  total_amount     DECIMAL(10,2) NOT NULL,
  discount_amount  DECIMAL(10,2) DEFAULT 0,
  gst_amount       DECIMAL(10,2) DEFAULT 0,
  final_amount     DECIMAL(10,2) NOT NULL,
  status           ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_method   VARCHAR(50),
  payment_status   ENUM('pending','paid','failed') DEFAULT 'pending',
  shipping_name    VARCHAR(100),
  shipping_phone   VARCHAR(20),
  shipping_address TEXT,
  shipping_city    VARCHAR(100),
  shipping_pincode VARCHAR(10),
  coupon_code      VARCHAR(30),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- CART
CREATE TABLE IF NOT EXISTS cart (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(30) NOT NULL UNIQUE,
  discount_type   ENUM('percent','flat') DEFAULT 'percent',
  discount_value  DECIMAL(5,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  is_active       TINYINT(1) DEFAULT 1,
  expires_at      DATE
);

-- ── SEED DATA ─────────────────────────────────────────────────

-- Admin (password: Admin@123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@fastyshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin');

-- Categories
INSERT IGNORE INTO categories (id, name, emoji) VALUES
(1,'Electronics','📱'),(2,'Fashion','👗'),(3,'Home & Living','🏠'),
(4,'Groceries','🍎'),(5,'Books','📚'),(6,'Gaming','🎮'),
(7,'Beauty','💄'),(8,'Sports','⚽'),(9,'Toys','🧸'),(10,'Tools','🔧');

-- Products with real image URLs from Unsplash (publicly accessible CDN)
INSERT IGNORE INTO products (id,name,description,price,original_price,stock,category_id,emoji,image_url,badge,rating,review_count) VALUES
(1,'Sony WH-1000XM5 Headphones','Industry-leading noise cancellation wireless headphones with 30hr battery life.',24999,34999,50,1,'🎧','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80','sale',4.9,2341),
(2,'Apple iPhone 15 (128GB)','6.1-inch OLED display, A16 Bionic chip, 48MP main camera.',69999,79999,30,1,'📱','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80','hot',4.8,5620),
(3,'Nike Air Max 270 Sneakers','Lightweight lifestyle sneakers with Max Air cushioning unit.',8999,12999,100,2,'👟','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80','sale',4.7,890),
(4,'Instant Pot Duo 7-in-1 Cooker','Pressure cooker, slow cooker, rice cooker, steamer, sauté and more.',7999,11999,40,3,'🍲','https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80','sale',4.6,1200),
(5,'Kindle Paperwhite 2024','7-inch glare-free display, 8-week battery life, 16GB storage.',13999,16999,60,5,'📖','https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80','new',4.8,980),
(6,'PS5 DualSense Controller','Haptic feedback, adaptive triggers and built-in microphone.',6499,7499,75,6,'🎮','https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80','hot',4.9,3400),
(7,'Mamaearth Vitamin C Serum','Brightening face serum with Vitamin C and Turmeric for glowing skin.',649,999,200,7,'💆','https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80','sale',4.5,560),
(8,'Premium Yoga Mat 6mm','Non-slip TPE material, eco-friendly, includes carry strap.',2199,3999,90,8,'🧘','https://m.media-amazon.com/images/I/61+J--H8kHL._SL1500_.jpg','new',4.7,430),
(9,'LEGO Technic Race Car','245-piece building set for ages 8+. Develops creativity and motor skills.',3999,5999,35,9,'🧱','https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80','sale',4.8,720),
(10,'Bosch 13mm Drill Set','750W corded drill with 13-piece accessory kit and carry case.',4499,6999,55,10,'🔧','https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80','sale',4.6,310),
(11,'Samsung 43" 4K Smart TV','Crystal 4K UHD processor, HDR, built-in Alexa and Google Assistant.',32999,49999,20,1,'📺','https://m.media-amazon.com/images/I/81IzIFwBqpL._SL1500_.jpg','hot',4.7,1890),
(12,"Levi's 511 Slim Fit Jeans",'Classic slim fit, mid-rise waistband, stretch denim for all-day comfort.',3299,4999,80,2,'👖','https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80','sale',4.5,640);
(13,"OnePlus Nord Buds 3r TWS Earbuds up to 54 Hours Playback.',1599,1999,150,18','http://localhost:5000/uploads/products/product-1775660592408-324517.jpg','sale',4.6,550);

-- Coupons
INSERT IGNORE INTO coupons (code,discount_type,discount_value,min_order_value) VALUES
('FASTY10','percent',10,499),
('SAVE20','percent',20,999),
('FLAT100','flat',100,1999);
