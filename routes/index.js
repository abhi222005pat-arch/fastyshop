const express = require('express');
const router  = express.Router();
const { protect, adminOnly }          = require('../middleware/auth');
const { uploadImages, handleUpload }  = require('../middleware/upload');
const upload = handleUpload(uploadImages);

const auth    = require('../controllers/authController');
const product = require('../controllers/productController');
const cart    = require('../controllers/cartController');
const order   = require('../controllers/orderController');
const admin   = require('../controllers/adminController');

// AUTH
router.post('/auth/register',        auth.register);
router.post('/auth/login',           auth.login);
router.get ('/auth/profile',         protect, auth.getProfile);
router.put ('/auth/profile',         protect, auth.updateProfile);

// PRODUCTS — categories/all MUST come before /:id
router.get   ('/products/categories/all',   product.getCategories);
router.get   ('/products',                   product.getAllProducts);
router.get   ('/products/:id',               product.getProduct);
router.post  ('/products',       protect, adminOnly, upload, product.addProduct);
router.put   ('/products/:id',   protect, adminOnly, upload, product.updateProduct);
router.delete('/products/:id',   protect, adminOnly,         product.deleteProduct);

// CART
router.get   ('/cart',             protect, cart.getCart);
router.post  ('/cart',             protect, cart.addToCart);
router.post  ('/cart/coupon',      protect, cart.applyCoupon);
router.put   ('/cart/:product_id', protect, cart.updateCart);
router.delete('/cart',             protect, cart.clearCart);
router.delete('/cart/:product_id', protect, cart.removeFromCart);

// ORDERS
router.get ('/orders',            protect, order.getMyOrders);
router.get ('/orders/:id',        protect, order.getOrder);
router.post('/orders',            protect, order.placeOrder);
router.put ('/orders/:id/cancel', protect, order.cancelOrder);

// ADMIN
router.get   ('/admin/dashboard',          protect, adminOnly, admin.getDashboard);
router.get   ('/admin/users',              protect, adminOnly, admin.getAllUsers);
router.delete('/admin/users/:id',          protect, adminOnly, admin.deleteUser);
router.get   ('/admin/orders',             protect, adminOnly, admin.getAllOrders);
router.put   ('/admin/orders/:id/status',  protect, adminOnly, admin.updateOrderStatus);

module.exports = router;
