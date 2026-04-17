const db = require('../config/db');

function imgUrl(req, val) {
  if (!val) return null;
  if (/^https?:\/\//.test(val)) return val;
  return `${req.protocol}://${req.get('host')}/uploads/products/${val}`;
}

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [[{totalUsers}]]    = await db.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role='customer'");
    const [[{totalProducts}]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{totalOrders}]]   = await db.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{totalRevenue}]]  = await db.query("SELECT IFNULL(SUM(final_amount),0) AS totalRevenue FROM orders WHERE payment_status='paid'");
    const [[{pendingOrders}]] = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status='pending'");
    const [[{lowStock}]]      = await db.query('SELECT COUNT(*) AS lowStock FROM products WHERE stock<10');
    const [recentOrders]      = await db.query('SELECT o.id,o.final_amount,o.status,o.created_at,u.name AS customer_name FROM orders o JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 10');
    res.json({ success:true, data:{ stats:{totalUsers,totalProducts,totalOrders,totalRevenue,pendingOrders,lowStock}, recentOrders } });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id,name,email,phone,city,role,created_at,(SELECT COUNT(*) FROM orders WHERE user_id=users.id) AS order_count FROM users ORDER BY created_at DESC');
    res.json({ success:true, data:users });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page=1, limit=50 } = req.query;
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(limit);
    const where=[]; const params=[];
    if (status?.trim()) { where.push('o.status=?'); params.push(status.trim()); }
    const w = where.length ? 'WHERE '+where.join(' AND ') : '';

    const [orders] = await db.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
         (SELECT COUNT(*) FROM order_items WHERE order_id=o.id) AS item_count
       FROM orders o JOIN users u ON o.user_id=u.id ${w} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const enriched = await Promise.all(orders.map(async o => {
      const [items] = await db.query(
        'SELECT oi.quantity,oi.unit_price,oi.total_price,p.id AS product_id,p.name AS product_name,p.image_url,c.name AS category_name FROM order_items oi JOIN products p ON oi.product_id=p.id LEFT JOIN categories c ON p.category_id=c.id WHERE oi.order_id=?',
        [o.id]
      );
      return { ...o, items: items.map(i=>({...i, image_url:imgUrl(req,i.image_url)})) };
    }));

    const [[{total}]] = await db.query(`SELECT COUNT(*) AS total FROM orders o ${w}`, params);
    res.json({ success:true, data:enriched, pagination:{total,page:parseInt(page),totalPages:Math.ceil(total/limit)} });
  } catch (e) { console.error(e); res.status(500).json({ success:false, message:e.message }); }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const valid = ['pending','confirmed','shipped','delivered','cancelled'];
    if (!valid.includes(req.body.status)) return res.status(400).json({ success:false, message:'Invalid status.' });
    await db.query('UPDATE orders SET status=? WHERE id=?', [req.body.status, req.params.id]);
    res.json({ success:true, message:`Status updated to "${req.body.status}".` });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id)===req.user.id) return res.status(400).json({ success:false, message:'Cannot delete own account.' });
    await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ success:true, message:'User deleted.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};
