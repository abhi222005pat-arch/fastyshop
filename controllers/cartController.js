const db = require('../config/db');

function imgUrl(req, val) {
  if (!val) return null;
  if (/^https?:\/\//.test(val)) return val;
  return `${req.protocol}://${req.get('host')}/uploads/products/${val}`;
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.original_price,
              p.image_url, p.emoji, p.stock, p.badge, cat.name AS category
       FROM cart c
       JOIN products p ON c.product_id=p.id
       LEFT JOIN categories cat ON p.category_id=cat.id
       WHERE c.user_id=? ORDER BY c.added_at DESC`,
      [req.user.id]
    );
    const mapped   = items.map(i=>({...i, image_url:imgUrl(req,i.image_url)}));
    const subtotal = mapped.reduce((s,i)=>s+Number(i.price)*i.quantity,0);
    res.json({ success:true, data:mapped, summary:{ subtotal:+subtotal.toFixed(2), gst:+(subtotal*.18).toFixed(2), total:+(subtotal*1.18).toFixed(2), itemCount:mapped.reduce((s,i)=>s+i.quantity,0) } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity=1 } = req.body;
    if (!product_id) return res.status(400).json({ success:false, message:'product_id required.' });
    const [p] = await db.query('SELECT id,stock FROM products WHERE id=?', [product_id]);
    if (!p.length) return res.status(404).json({ success:false, message:'Product not found.' });
    if (p[0].stock < quantity) return res.status(400).json({ success:false, message:'Not enough stock.' });
    await db.query('INSERT INTO cart (user_id,product_id,quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity)', [req.user.id, product_id, quantity]);
    res.json({ success:true, message:'Added to cart.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// PUT /api/cart/:product_id
exports.updateCart = async (req, res) => {
  try {
    const qty = parseInt(req.body.quantity);
    if (!qty||qty<1) return res.status(400).json({ success:false, message:'Quantity must be ≥1.' });
    await db.query('UPDATE cart SET quantity=? WHERE user_id=? AND product_id=?', [qty,req.user.id,req.params.product_id]);
    res.json({ success:true, message:'Updated.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// DELETE /api/cart/:product_id
exports.removeFromCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id=? AND product_id=?', [req.user.id, req.params.product_id]);
    res.json({ success:true, message:'Removed.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id=?', [req.user.id]);
    res.json({ success:true, message:'Cart cleared.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// POST /api/cart/coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { code, subtotal=0 } = req.body;
    if (!code) return res.status(400).json({ success:false, message:'Coupon code required.' });
    const [rows] = await db.query("SELECT * FROM coupons WHERE code=? AND is_active=1 AND (expires_at IS NULL OR expires_at>=CURDATE())", [code.toUpperCase()]);
    if (!rows.length) return res.status(400).json({ success:false, message:'Invalid or expired coupon.' });
    const c = rows[0];
    if (Number(subtotal)<Number(c.min_order_value)) return res.status(400).json({ success:false, message:`Min order ₹${c.min_order_value} required.` });
    const discount = c.discount_type==='percent' ? Math.round(Number(subtotal)*(c.discount_value/100)) : Number(c.discount_value);
    res.json({ success:true, message:`Coupon applied! You saved ₹${discount}`, discount, coupon:c });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};
