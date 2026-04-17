const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token. Please login.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'fastyshop_secret');
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required.' });
};

module.exports = { protect, adminOnly };
