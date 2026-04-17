const db = require('../config/db');

function imgUrl(req, val) {
  if (!val) return null;
  if (/^https?:\/\//.test(val)) return val;
  return `${req.protocol}://${req.get('host')}/uploads/products/${val}`;
}

// POST /api/orders
exports.placeOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { shipping_name, shipping_phone, shipping_address, shipping_city, shipping_pincode, payment_method, coupon_code, discount_amount=0 } = req.body;
    if (!shipping_name||!shipping_address||!shipping_city||!shipping_pincode||!payment_method)
      return res.status(400).json({ success:false, message:'All shipping and payment fields are required.' });

    const [cart] = await conn.query(
      'SELECT c.product_id, c.quantity, p.price, p.name, p.stock FROM cart c JOIN products p ON c.product_id=p.id WHERE c.user_id=?',
      [req.user.id]
    );
    if (!cart.length) { await conn.rollback(); return res.status(400).json({ success:false, message:'Cart is empty.' }); }

    for (const item of cart) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success:false, message:`Insufficient stock for "${item.name}".` });
      }
    }

    const subtotal    = cart.reduce((s,i)=>s+Number(i.price)*i.quantity, 0);
    const disc        = Math.min(parseFloat(discount_amount)||0, subtotal);
    const gst         = parseFloat(((subtotal-disc)*0.18).toFixed(2));
    const final       = parseFloat((subtotal-disc+gst).toFixed(2));

    const [or] = await conn.query(
      'INSERT INTO orders (user_id,total_amount,discount_amount,gst_amount,final_amount,payment_method,payment_status,shipping_name,shipping_phone,shipping_address,shipping_city,shipping_pincode,coupon_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, subtotal, disc, gst, final, payment_method, payment_method==='Cash on Delivery'?'pending':'paid', shipping_name, shipping_phone||null, shipping_address, shipping_city, shipping_pincode, coupon_code||null]
    );

    for (const item of cart) {
      await conn.query('INSERT INTO order_items (order_id,product_id,quantity,unit_price,total_price) VALUES (?,?,?,?,?)', [or.insertId, item.product_id, item.quantity, item.price, Number(item.price)*item.quantity]);
      await conn.query('UPDATE products SET stock=stock-? WHERE id=?', [item.quantity, item.product_id]);
    }
    await conn.query('DELETE FROM cart WHERE user_id=?', [req.user.id]);
    await conn.commit();

    res.status(201).json({ success:true, message:'Order placed! 🎉', order:{ id:or.insertId, final_amount:final, status:'pending' } });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ success:false, message:e.message });
  } finally { conn.release(); }
};

// GET /api/orders
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id=o.id) AS item_count FROM orders o WHERE o.user_id=? ORDER BY o.created_at DESC',
      [req.user.id]
    );
    res.json({ success:true, data:orders });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!orders.length) return res.status(404).json({ success:false, message:'Order not found.' });
    const [items] = await db.query(
      'SELECT oi.*, p.name, p.image_url, p.emoji, c.name AS category_name FROM order_items oi JOIN products p ON oi.product_id=p.id LEFT JOIN categories c ON p.category_id=c.id WHERE oi.order_id=?',
      [req.params.id]
    );
    const mapped = items.map(i=>({...i, image_url:imgUrl(req,i.image_url)}));
    res.json({ success:true, data:{...orders[0], items:mapped} });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [orders] = await conn.query('SELECT * FROM orders WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!orders.length) { await conn.rollback(); return res.status(404).json({ success:false, message:'Order not found.' }); }
    if (!['pending','confirmed'].includes(orders[0].status)) { await conn.rollback(); return res.status(400).json({ success:false, message:'Cannot cancel at this stage.' }); }
    const [items] = await conn.query('SELECT product_id,quantity FROM order_items WHERE order_id=?', [req.params.id]);
    for (const i of items) await conn.query('UPDATE products SET stock=stock+? WHERE id=?', [i.quantity, i.product_id]);
    await conn.query("UPDATE orders SET status='cancelled' WHERE id=?", [req.params.id]);
    await conn.commit();
    res.json({ success:true, message:'Order cancelled.' });
  } catch (e) { await conn.rollback(); res.status(500).json({ success:false, message:e.message }); }
  finally { conn.release(); }
};
