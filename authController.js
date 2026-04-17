// controllers/authController.js
const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// Must match middleware/auth.js exactly — single hardcoded secret
const SECRET = 'fastyshop2025';

const sign = u => jwt.sign(
  { id: u.id, name: u.name, email: u.email, role: u.role },
  SECRET,
  { expiresIn: '7d' }
);

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

    const [ex] = await db.query('SELECT id FROM users WHERE email=?', [email.trim()]);
    if (ex.length) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const [r]  = await db.query('INSERT INTO users (name,email,password,phone) VALUES (?,?,?,?)',
      [name.trim(), email.trim(), hash, phone || null]);

    const user = { id: r.insertId, name: name.trim(), email: email.trim(), role: 'customer' };
    res.status(201).json({ success: true, message: 'Registered!', token: sign(user), user });
  } catch (e) {
    console.error('register:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    const [rows] = await db.query('SELECT * FROM users WHERE email=?', [email.trim()]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const { password: _, ...safeUser } = rows[0];
    res.json({ success: true, message: 'Login successful!', token: sign(rows[0]), user: safeUser });
  } catch (e) {
    console.error('login:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id,name,email,phone,address,city,pincode,role,created_at FROM users WHERE id=?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: rows[0] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, pincode } = req.body;
    await db.query('UPDATE users SET name=?,phone=?,address=?,city=?,pincode=? WHERE id=?',
      [name, phone, address, city, pincode, req.user.id]);
    res.json({ success: true, message: 'Profile updated.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
