const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// Build a full http URL from a stored filename or return URL as-is
function imgUrl(req, val) {
  if (!val) return null;
  if (/^https?:\/\//.test(val)) return val;
  return `${req.protocol}://${req.get('host')}/uploads/products/${val}`;
}

function safeJson(s, fb=[]) {
  if (!s) return fb;
  try { return JSON.parse(s); } catch { return fb; }
}

function delFile(val) {
  if (!val || /^https?:\/\//.test(val)) return;
  try {
    const p = path.join(__dirname,'..','uploads','products',path.basename(val));
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
}

function mapP(req, p) {
  return { ...p, image_url: imgUrl(req, p.image_url), images: safeJson(p.images,[]).map(f=>imgUrl(req,f)) };
}

function extractFiles(req) {
  const f = req.files||{};
  const cover = f.image?.[0]?.filename || null;
  const extra = [];
  for (let i=1;i<=5;i++) { const x=f[`image_extra_${i}`]?.[0]?.filename; if(x) extra.push(x); }
  return { cover, extra };
}

// GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, badge, min_price, max_price, sort, page=1, limit=200 } = req.query;
    const offset = (Math.max(1,parseInt(page))-1)*parseInt(limit);
    const where=[]; const params=[];

    if (search)    { where.push('p.name LIKE ?');       params.push(`%${search}%`); }
    if (category)  { where.push('p.category_id=?');    params.push(parseInt(category)); }
    if (badge && badge.trim()) { where.push('p.badge=?'); params.push(badge.trim()); }
    if (min_price) { where.push('p.price>=?');          params.push(parseFloat(min_price)); }
    if (max_price) { where.push('p.price<=?');          params.push(parseFloat(max_price)); }

    const w = where.length ? 'WHERE '+where.join(' AND ') : '';
    const ob = { price_asc:'p.price ASC', price_desc:'p.price DESC', rating:'p.rating DESC', newest:'p.created_at DESC' }[sort]||'p.created_at DESC';

    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, c.emoji AS category_emoji
       FROM products p LEFT JOIN categories c ON p.category_id=c.id
       ${w} ORDER BY ${ob} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{total}]] = await db.query(`SELECT COUNT(*) AS total FROM products p ${w}`, params);

    res.json({ success:true, data:rows.map(p=>mapP(req,p)), pagination:{total,page:parseInt(page),limit:parseInt(limit),totalPages:Math.ceil(total/limit)} });
  } catch (e) { console.error(e); res.status(500).json({ success:false, message:e.message }); }
};

// GET /api/products/categories/all
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id');
    res.json({ success:true, data:rows });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success:false, message:'Product not found.' });
    res.json({ success:true, data:mapP(req,rows[0]) });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};

// POST /api/products  (admin, multipart)
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, original_price, stock, category_id, badge, image_url:textUrl } = req.body;
    if (!name?.trim()) return res.status(400).json({ success:false, message:'Product name is required.' });
    if (!price || isNaN(parseFloat(price))) return res.status(400).json({ success:false, message:'Valid price is required.' });
    if (!category_id) return res.status(400).json({ success:false, message:'Category is required.' });

    const { cover, extra } = extractFiles(req);
    const imageUrl = cover || (textUrl?.trim()||null);
    const imagesJson = extra.length ? JSON.stringify(extra) : null;

    const [r] = await db.query(
      'INSERT INTO products (name,description,price,original_price,stock,category_id,badge,image_url,images) VALUES (?,?,?,?,?,?,?,?,?)',
      [name.trim(), description?.trim()||null, parseFloat(price), original_price?parseFloat(original_price):null, parseInt(stock)||0, parseInt(category_id), badge?.trim()||'', imageUrl, imagesJson]
    );
    res.status(201).json({ success:true, message:'Product added!', id:r.insertId, image_url:imgUrl(req,imageUrl) });
  } catch (e) { console.error(e); res.status(500).json({ success:false, message:e.message }); }
};

// PUT /api/products/:id  (admin)
exports.updateProduct = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Product not found.' });
    const ex = rows[0];
    const { name, description, price, original_price, stock, category_id, badge, image_url:textUrl } = req.body;
    const { cover, extra } = extractFiles(req);

    let imageUrl = ex.image_url;
    if (cover)              { delFile(ex.image_url); imageUrl = cover; }
    else if (textUrl?.trim()){ delFile(ex.image_url); imageUrl = textUrl.trim(); }

    const oldExtras = safeJson(ex.images,[]);
    const allExtras = [...oldExtras, ...extra];
    const imagesJson = allExtras.length ? JSON.stringify(allExtras) : null;

    await db.query(
      'UPDATE products SET name=?,description=?,price=?,original_price=?,stock=?,category_id=?,badge=?,image_url=?,images=? WHERE id=?',
      [name?.trim()||ex.name, description?.trim()??ex.description, price?parseFloat(price):ex.price,
       original_price!==undefined?(original_price?parseFloat(original_price):null):ex.original_price,
       stock!==undefined?parseInt(stock):ex.stock, category_id?parseInt(category_id):ex.category_id,
       badge!==undefined?(badge?.trim()||''):ex.badge, imageUrl, imagesJson, req.params.id]
    );
    res.json({ success:true, message:'Product updated.', image_url:imgUrl(req,imageUrl) });
  } catch (e) { console.error(e); res.status(500).json({ success:false, message:e.message }); }
};

// DELETE /api/products/:id  (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Product not found.' });
    delFile(rows[0].image_url);
    safeJson(rows[0].images,[]).forEach(delFile);
    await db.query('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ success:true, message:'Product deleted.' });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
};
