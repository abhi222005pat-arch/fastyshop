# 🛒 Fasty Shop — Complete Setup Guide
**Dr. D Y Patil Arts, Commerce & Science College, Akurdi, Pune**
**Developer: Abhishek Pattar**

---

## ⚠️ IMPORTANT — Why images were not showing

You were opening index.html directly as a file (`file:///D:/...`).
This BREAKS images because images are served from `http://localhost:5000`.

**✅ CORRECT way:** Always open `http://localhost:5000` in browser.
**❌ WRONG way:** Double-clicking index.html from File Explorer.

---

## 📁 Project Structure

```
fasty-shop/
├── START.bat              ← Double-click this to start!
├── server.js              ← Express server
├── package.json
├── .env                   ← Set your MySQL password here
├── config/
│   ├── db.js
│   └── schema.sql         ← Run this in MySQL once
├── middleware/
├── controllers/
├── routes/
├── uploads/products/      ← Product images saved here
└── public/                ← All HTML, CSS, JS files
    ├── index.html         ← Main website
    ├── admin-products.html ← Manage products
    ├── admin-orders.html  ← Manage orders
    └── add-product.html   ← Add new product
```

---

## 🚀 Setup Steps (Do this once)

### Step 1 — Install Node.js
Download from https://nodejs.org (version 18 or higher)

### Step 2 — Install MySQL
Download from https://dev.mysql.com/downloads/installer/
Remember your root password!

### Step 3 — Create the database
Open MySQL command line and run:
```
mysql -u root -p < config/schema.sql
```
Or open MySQL Workbench and paste the contents of `config/schema.sql` and execute.

### Step 4 — Set your MySQL password
Open `.env` file and change:
```
DB_PASSWORD=your_mysql_password_here
```

### Step 5 — Start the server
**Double-click `START.bat`** — it installs packages and starts automatically.

OR open a terminal in this folder and run:
```
npm install
node server.js
```

### Step 6 — Open the website
**Open your browser and go to: http://localhost:5000**

---

## 🌐 All URLs

| Page | URL |
|------|-----|
| 🏠 Main Website | http://localhost:5000 |
| 📦 Manage Products | http://localhost:5000/admin-products.html |
| 📋 View Orders | http://localhost:5000/admin-orders.html |
| ➕ Add Product | http://localhost:5000/add-product.html |
| 🔌 API | http://localhost:5000/api |

---

## 🔑 Default Admin Login

| Field | Value |
|-------|-------|
| Email | admin@fastyshop.com |
| Password | Admin@123 |

---

## 🎟️ Test Coupon Codes

| Code | Discount |
|------|----------|
| FASTY10 | 10% off |
| SAVE20 | 20% off |
| FLAT100 | ₹100 flat off |
