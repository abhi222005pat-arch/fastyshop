// ============================================================
//  Fasty Shop — server.js
//  Dr. D Y Patil Arts, Commerce & Science College, Akurdi
//  Developer: Abhishek Pattar
// ============================================================
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

// Make sure uploads folder exists on startup
const uploadDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── STATIC FILES ────────────────────────────────────────────
// 1. Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Serve the website (HTML/CSS/JS) from /public folder
//    Open http://localhost:5000 — do NOT open HTML files directly!
app.use(express.static(path.join(__dirname, 'public')));

// ── API ──────────────────────────────────────────────────────
app.use('/api', require('./routes/index'));

// ── CATCH-ALL: serve index.html for any unknown route ───────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return;
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── ERROR HANDLER ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log('\n================================================');
  console.log('   FASTY SHOP — Running on http://localhost:' + PORT);
  console.log('================================================');
  console.log('  Website  → http://localhost:' + PORT);
  console.log('  Admin    → http://localhost:' + PORT + '/admin-products.html');
  console.log('  Orders   → http://localhost:' + PORT + '/admin-orders.html');
  console.log('  API      → http://localhost:' + PORT + '/api');
  console.log('\n  !! Always open http://localhost:' + PORT);
  console.log('  !! NOT file:// — images will break!\n');
});
