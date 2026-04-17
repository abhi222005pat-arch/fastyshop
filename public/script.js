/* ============================================================
   Fasty Shop — script.js
   ============================================================ */
'use strict';

const API = 'http://localhost:5000/api';

// ── SAME IMAGE URLS used in database seed ─────────────────────
// These match exactly what's in schema.sql so fallback = DB
const IMGS = {
  1:  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  2:  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
  3:  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  4:  'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
  5:  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
  6:  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80',
  7:  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
  8:  'https://images.unsplash.com/photo-1601925228998-36e673eadffb?w=600&q=80',
  9:  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
  10: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
  11: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834f?w=600&q=80',
  12: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
};

// Fallback products — used ONLY when backend is offline
const FALLBACK = [
  { id:1,  name:'Sony WH-1000XM5 Headphones', category_name:'Electronics', image_url:IMGS[1],  price:24999, original_price:34999, rating:4.9, review_count:2341, badge:'sale', stock:50,  images:[], category_id:1 },
  { id:2,  name:'Apple iPhone 15 (128GB)',     category_name:'Electronics', image_url:IMGS[2],  price:69999, original_price:79999, rating:4.8, review_count:5620, badge:'hot',  stock:30,  images:[], category_id:1 },
  { id:3,  name:'Nike Air Max 270 Sneakers',   category_name:'Fashion',     image_url:IMGS[3],  price:8999,  original_price:12999, rating:4.7, review_count:890,  badge:'sale', stock:100, images:[], category_id:2 },
  { id:4,  name:'Instant Pot Duo 7-in-1 Cooker',category_name:'Home & Living',image_url:IMGS[4],price:7999,  original_price:11999, rating:4.6, review_count:1200, badge:'sale', stock:40,  images:[], category_id:3 },
  { id:5,  name:'Kindle Paperwhite 2024',      category_name:'Books',       image_url:IMGS[5],  price:13999, original_price:16999, rating:4.8, review_count:980,  badge:'new',  stock:60,  images:[], category_id:5 },
  { id:6,  name:'PS5 DualSense Controller',    category_name:'Gaming',      image_url:IMGS[6],  price:6499,  original_price:7499,  rating:4.9, review_count:3400, badge:'hot',  stock:75,  images:[], category_id:6 },
  { id:7,  name:'Mamaearth Vitamin C Serum',   category_name:'Beauty',      image_url:IMGS[7],  price:649,   original_price:999,   rating:4.5, review_count:560,  badge:'sale', stock:200, images:[], category_id:7 },
  { id:8,  name:'Premium Yoga Mat 6mm',        category_name:'Sports',      image_url:IMGS[8],  price:2199,  original_price:3999,  rating:4.7, review_count:430,  badge:'new',  stock:90,  images:[], category_id:8 },
  { id:9,  name:'LEGO Technic Race Car',       category_name:'Toys',        image_url:IMGS[9],  price:3999,  original_price:5999,  rating:4.8, review_count:720,  badge:'sale', stock:35,  images:[], category_id:9 },
  { id:10, name:'Bosch 13mm Drill Set',        category_name:'Tools',       image_url:IMGS[10], price:4499,  original_price:6999,  rating:4.6, review_count:310,  badge:'sale', stock:55,  images:[], category_id:10 },
  { id:11, name:'Samsung 43" 4K Smart TV',     category_name:'Electronics', image_url:IMGS[11], price:32999, original_price:49999, rating:4.7, review_count:1890, badge:'hot',  stock:20,  images:[], category_id:1 },
  { id:12, name:"Levi's 511 Slim Fit Jeans",   category_name:'Fashion',     image_url:IMGS[12], price:3299,  original_price:4999,  rating:4.5, review_count:640,  badge:'sale', stock:80,  images:[], category_id:2 },
];

const FALLBACK_CATS = [
  {id:1,name:'Electronics',emoji:'📱'},{id:2,name:'Fashion',emoji:'👗'},
  {id:3,name:'Home & Living',emoji:'🏠'},{id:4,name:'Groceries',emoji:'🍎'},
  {id:5,name:'Books',emoji:'📚'},{id:6,name:'Gaming',emoji:'🎮'},
  {id:7,name:'Beauty',emoji:'💄'},{id:8,name:'Sports',emoji:'⚽'},
  {id:9,name:'Toys',emoji:'🧸'},{id:10,name:'Tools',emoji:'🔧'},
];

// ── STATE ─────────────────────────────────────────────────────
const S = {
  token:      localStorage.getItem('fasty_token') || null,
  user:       JSON.parse(localStorage.getItem('fasty_user') || 'null'),
  cart:       [],
  product:    null,
  qty:        1,
  discount:   0,
  coupon:     '',
  payMethod:  'Credit Card',
  products:   [],
  categories: [],
};

// ── API ───────────────────────────────────────────────────────
async function api(endpoint, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (S.token) headers['Authorization'] = `Bearer ${S.token}`;
  try {
    const res  = await fetch(`${API}${endpoint}`, { ...opts, headers });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { success: false, message: 'Server offline.' } };
  }
}

// ── TOAST ─────────────────────────────────────────────────────
let _tt;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.className = `toast show${type !== 'success' ? ' '+type : ''}`;
  document.getElementById('toastIcon').textContent = type==='error'?'✕':type==='warn'?'⚠':'✓';
  document.getElementById('toastMsg').textContent  = msg;
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── NAVIGATION ────────────────────────────────────────────────
function goPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${name}`)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active-nav'));
  document.getElementById(`nb-${name}`)?.classList.add('active-nav');
  if (name === 'listing') loadProducts();
  if (name === 'cart')    renderCart();
  if (name === 'orders')  loadOrders();
  window.scrollTo({ top:0, behavior:'smooth' });
}
function requireLogin(page) {
  if (!S.token) { toast('Please login first','warn'); goPage('login'); return; }
  goPage(page);
}

// ── AUTH ──────────────────────────────────────────────────────
function setUser(token, user) {
  S.token = token; S.user = user;
  localStorage.setItem('fasty_token', token);
  localStorage.setItem('fasty_user', JSON.stringify(user));
  refreshNav();
}
function refreshNav() {
  const loginBtn  = document.getElementById('nb-login');
  const adminDD   = document.getElementById('adminDD');
  const adminName = document.getElementById('adminDDName');
  const adminEmail= document.getElementById('adminDDEmail');

  if (!loginBtn) return;

  if (S.user) {
    const firstName = S.user.name.split(' ')[0];

    if (S.user.role === 'admin') {
      // ── Admin logged in: hide login button, show admin dropdown ──
      loginBtn.style.display  = 'none';
      if (adminDD)    adminDD.style.display    = 'block';
      if (adminName)  adminName.textContent     = firstName;
      if (adminEmail) adminEmail.textContent    = S.user.email || 'admin@fastyshop.com';
    } else {
      // ── Regular user logged in: show name on login button, hide admin dropdown ──
      loginBtn.style.display  = '';
      loginBtn.textContent    = `👤 ${firstName}`;
      loginBtn.onclick        = doLogout;
      if (adminDD) adminDD.style.display = 'none';
    }
  } else {
    // ── Not logged in ──
    loginBtn.style.display  = '';
    loginBtn.textContent    = '👤 Login';
    loginBtn.onclick        = () => goPage('login');
    if (adminDD) adminDD.style.display = 'none';
  }
}

// Toggle admin dropdown open/close
function toggleAdminDD() {
  const dd = document.getElementById('adminDD');
  if (dd) dd.classList.toggle('open');
}

// Close admin dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dd = document.getElementById('adminDD');
  if (dd && dd.classList.contains('open') && !dd.contains(e.target)) {
    dd.classList.remove('open');
  }
});

function doLogout() {
  S.token=null; S.user=null; S.cart=[];
  localStorage.removeItem('fasty_token'); localStorage.removeItem('fasty_user');
  // Close admin dropdown if open
  const dd = document.getElementById('adminDD');
  if (dd) dd.classList.remove('open');
  refreshNav(); updateBadge(); toast('Logged out successfully'); goPage('home');
}
async function handleLogin() {
  const email=document.getElementById('loginEmail').value.trim();
  const pass =document.getElementById('loginPassword').value;
  const errEl=document.getElementById('loginError');
  const btn  =document.getElementById('loginBtn');
  errEl.style.display='none';
  if (!email||!pass){errEl.textContent='Please fill all fields.';errEl.style.display='block';return;}
  btn.textContent='Logging in...';btn.disabled=true;
  const{ok,data}=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password:pass})});
  btn.textContent='Login →';btn.disabled=false;
  if(ok&&data.success){setUser(data.token,data.user);toast(`Welcome back, ${data.user.name.split(' ')[0]}! 🎉`);goPage('home');syncCart();}
  else{errEl.textContent=data.message||'Login failed.';errEl.style.display='block';}
}
async function handleRegister() {
  const name =document.getElementById('regName').value.trim();
  const phone=document.getElementById('regPhone').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass =document.getElementById('regPassword').value;
  const errEl=document.getElementById('registerError');
  const btn  =document.getElementById('registerBtn');
  errEl.style.display='none';
  if(!name||!email||!pass){errEl.textContent='Name, email and password required.';errEl.style.display='block';return;}
  if(pass.length<6){errEl.textContent='Password must be at least 6 characters.';errEl.style.display='block';return;}
  btn.textContent='Creating...';btn.disabled=true;
  const{ok,data}=await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password:pass,phone})});
  btn.textContent='Create Account →';btn.disabled=false;
  if(ok&&data.success){setUser(data.token,data.user);toast(`Welcome, ${data.user.name.split(' ')[0]}! 🎉`);goPage('home');}
  else{errEl.textContent=data.message||'Registration failed.';errEl.style.display='block';}
}

// ── IMAGE HELPERS ─────────────────────────────────────────────
// Get cover image — if DB returns null, fall back to IMGS map by product ID
function getImgSrc(p) {
  if (p.image_url) return p.image_url;
  if (IMGS[p.id])  return IMGS[p.id];   // ← key fix: use fallback image map
  return null;
}

function getAllImgs(p) {
  const a = [];
  const cover = getImgSrc(p);
  if (cover) a.push(cover);
  if (Array.isArray(p.images)) p.images.forEach(u => { if(u&&u!==cover) a.push(u); });
  return a;
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(n) { return `₹${Number(n).toLocaleString('en-IN')}`; }
function pct(price,orig) { return (!orig||orig<=price)?0:Math.round((1-price/orig)*100); }
function stars(r) { const n=Math.round(r||0); return '★'.repeat(n)+'☆'.repeat(5-n); }
function bdgCls(b) { return {sale:'badge-sale',new:'badge-new',hot:'badge-hot'}[b]||''; }

// Build product image HTML with graceful fallback
function imgHtml(p, cls) {
  const src = getImgSrc(p);
  if (src) {
    return `<img src="${src}" alt="${esc(p.name)}" class="${cls}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
            <div class="p-img-fallback" style="display:none;"><span>🖼️</span></div>`;
  }
  return `<div class="p-img-fallback"><span>🖼️</span></div>`;
}

// ── PRODUCT CARD ──────────────────────────────────────────────
function buildCard(p) {
  const disc = pct(p.price, p.original_price);
  return `
    <div class="p-card" onclick="openDetail(${p.id})">
      ${p.badge?`<div class="p-badge ${bdgCls(p.badge)}">${p.badge.toUpperCase()}</div>`:''}
      <div class="p-img-wrap">${imgHtml(p,'p-img-real')}</div>
      <div class="p-body">
        <div class="p-cat">${esc(p.category_name||'')}</div>
        <div class="p-name">${esc(p.name)}</div>
        <div class="p-stars">${stars(p.rating)} ${p.rating||0}</div>
        <div class="p-prices">
          <span class="p-price">${fmt(p.price)}</span>
          ${p.original_price?`<span class="p-was">${fmt(p.original_price)}</span>`:''}
          ${disc?`<span class="p-disc">${disc}% off</span>`:''}
        </div>
        <button class="p-add-btn" onclick="event.stopPropagation();addToCart(${p.id})">+ Add to Cart</button>
      </div>
    </div>`;
}

// ── CATEGORY IMAGES (real photos per category) ───────────────
const CAT_IMGS = {
  1: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834f?w=300&q=75',  // Electronics
  2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=75',  // Fashion
  3: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=75',  // Home & Living
  4: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=75',  // Groceries
  5: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=75', // Books
  6: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&q=75', // Gaming
  7: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=75', // Beauty
  8: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=75', // Sports
  9: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=75',  // Toys -- using placeholder  
  10:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&q=75', // Tools
};
// Better Toys image
CAT_IMGS[9] = 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&q=75';

// ── CATEGORIES ────────────────────────────────────────────────
async function loadCategories() {
  const{ok,data}=await api('/products/categories/all');
  S.categories = ok&&data.success ? data.data : FALLBACK_CATS;

  const grid=document.getElementById('catGrid');
  if(grid) grid.innerHTML=S.categories.map(c=>{
    const imgSrc = CAT_IMGS[c.id] || null;
    return `
    <div class="cat-card" onclick="filterByCategory(${c.id})">
      <div class="cat-img-wrap">
        ${imgSrc
          ? `<img class="cat-img" src="${imgSrc}" alt="${c.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.querySelector('.cat-emoji-fb').style.display='flex'"/>
             <div class="cat-img-overlay"></div>
             <div class="cat-emoji-fb" style="display:none">${c.emoji}</div>`
          : `<div class="cat-emoji-fb">${c.emoji}</div>`
        }
      </div>
      <div class="cat-name">${c.name}</div>
    </div>`;
  }).join('');

  const filters=document.getElementById('categoryFilters');
  if(filters) filters.innerHTML=S.categories.map(c=>`
    <label class="filter-opt">
      <input type="checkbox" class="cat-cb" value="${c.id}" onchange="applyFilters()">
      ${c.emoji} ${c.name}
    </label>`).join('');
}

// Slide the category carousel
function slideCats(dir) {
  const grid = document.getElementById('catGrid');
  if(!grid) return;
  grid.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

function filterByCategory(id) {
  goPage('listing');
  setTimeout(()=>{
    document.querySelectorAll('.cat-cb').forEach(cb=>cb.checked=false);
    const cb=document.querySelector(`.cat-cb[value="${id}"]`);
    if(cb){cb.checked=true;loadProducts();}
  },80);
}

// ── LOAD PRODUCTS ─────────────────────────────────────────────
async function loadProducts() {
  const loader=document.getElementById('listingLoader');
  const empty =document.getElementById('listingEmpty');
  const grid  =document.getElementById('listingGrid');
  if(loader) loader.style.display='flex';
  if(empty)  empty.style.display='none';
  if(grid)   grid.innerHTML='';

  const sort    =document.getElementById('sortSelect')?.value||'';
  const badge   =document.querySelector('input[name="badge"]:checked')?.value||'';
  const cats    =[...document.querySelectorAll('.cat-cb:checked')].map(el=>el.value);
  const maxPrice=document.getElementById('priceRange')?.value||'';
  const search  =document.getElementById('searchInput')?.value.trim()||'';

  const q=new URLSearchParams({limit:'500'});
  if(sort)              q.set('sort',sort);
  if(badge)             q.set('badge',badge);
  if(cats.length===1)   q.set('category',cats[0]);
  if(parseInt(maxPrice)<150000) q.set('max_price',maxPrice);
  if(search)            q.set('search',search);

  const{ok,data}=await api(`/products?${q}`);
  if(loader) loader.style.display='none';

  // Use backend data; if it fails use fallback
  let products = ok&&data.success&&data.data.length ? data.data : FALLBACK;

  // If backend returned products but they have no image_url, patch from IMGS map
  products = products.map(p => ({
    ...p,
    image_url: p.image_url || IMGS[p.id] || null,
  }));

  // Client-side multi-category filter
  if(cats.length>1) products=products.filter(p=>cats.includes(String(p.category_id)));

  S.products=products;

  if(!products.length){
    if(empty) empty.style.display='block';
    if(document.getElementById('productCount')) document.getElementById('productCount').textContent='(0 items)';
    return;
  }

  if(grid){
    grid.innerHTML=products.map(buildCard).join('');
    if(document.getElementById('productCount'))
      document.getElementById('productCount').textContent=`(${products.length} items)`;
  }
}

function applyFilters(){loadProducts();}
function resetFilters(){
  document.querySelectorAll('input[name="badge"]')[0].checked=true;
  document.querySelectorAll('.cat-cb').forEach(cb=>cb.checked=false);
  const pr=document.getElementById('priceRange');
  if(pr){pr.value=pr.max;document.getElementById('priceVal').textContent='Up to ₹1,50,000';}
  document.getElementById('sortSelect').value='';
  loadProducts();
}

// ── HOME ──────────────────────────────────────────────────────
async function loadHome() {
  const{ok,data}=await api('/products?limit=500');
  let all = ok&&data.success&&data.data.length ? data.data : FALLBACK;
  all = all.map(p=>({...p, image_url: p.image_url||IMGS[p.id]||null}));
  if(all.length) S.products=all;

  const hot =[...all.filter(p=>['hot','sale'].includes(p.badge))].slice(0,4);
  const newA=[...all.filter(p=>p.badge==='new')].slice(0,4);

  const hd=document.getElementById('homeDeals');
  if(hd) hd.innerHTML=(hot.length?hot:all.slice(0,4)).map(buildListCard).join('');
  const hn=document.getElementById('homeNew');
  if(hn) hn.innerHTML=(newA.length?newA:all.slice(4,8)).map(buildListCard).join('');
}

// ── LIST-STYLE CARD (reference design) ───────────────────────
function buildListCard(p) {
  const src  = getImgSrc(p);
  const disc = pct(p.price, p.original_price);
  const imgEl = src
    ? `<img src="${src}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'"/>`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:.3">🖼️</div>`;

  // Generate 2–3 color dots based on product id
  const COLORS=[['#1a1a1a','#f5f5f5','#2d5a3d'],['#c0392b','#f5f5f5'],['#1a1a2e','#f5f5f5','#2980b9'],['#2d5a3d','#f5f5f5']];
  const dots = (COLORS[p.id%COLORS.length]).map((c,i)=>`<span class="hli-dot${i===0?' active':''}" style="background:${c}"></span>`).join('');

  return `
    <div class="hli" onclick="openDetail(${p.id})">
      <div class="hli-img">${imgEl}</div>
      <div class="hli-body">
        <div class="hli-name">${esc(p.name)}</div>
        <div class="hli-rating">
          <span class="hli-stars">${'★'.repeat(Math.round(p.rating||0))}</span>
          <span class="hli-score">${p.rating||0}</span>
          <span class="hli-reviews">(${Number(p.review_count||0).toLocaleString('en-IN')}k) reviews</span>
        </div>
        <div class="hli-price-row">
          <span class="hli-price">₹ ${Number(p.price).toLocaleString('en-IN')}</span>
          ${p.original_price?`<span class="hli-was">₹ ${Number(p.original_price).toLocaleString('en-IN')}</span>`:''}
          ${disc?`<span class="hli-disc">${disc}% off</span>`:''}
        </div>
        <div class="hli-colors">${dots}</div>
        <button class="hli-add" onclick="event.stopPropagation();addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`;
}

// ── PRODUCT DETAIL ────────────────────────────────────────────
async function openDetail(id) {
  S.qty=1;
  let p=S.products.find(x=>x.id===id);
  if(!p){
    const{ok,data}=await api(`/products/${id}`);
    p=ok&&data.success?data.data:FALLBACK.find(x=>x.id===id);
  }
  if(!p){toast('Product not found','error');return;}

  // Ensure image_url is set
  p = {...p, image_url: p.image_url||IMGS[p.id]||null};
  S.product=p;

  const mainImg =document.getElementById('detailMainImgReal');
  const fallback=document.getElementById('detailMainImgFallback');
  const src=getImgSrc(p);
  if(src){mainImg.src=src;mainImg.style.display='block';fallback.style.display='none';}
  else   {mainImg.style.display='none';fallback.style.display='flex';}

  // Thumbnails
  const thumbsEl=document.getElementById('detailThumbs');
  const imgs=getAllImgs(p);
  if(imgs.length){
    thumbsEl.innerHTML=imgs.map((s,i)=>`
      <div class="thumb ${i===0?'active':''}" onclick="switchImg(this,'${s}')">
        <img src="${s}" alt="view ${i+1}" onerror="this.parentElement.innerHTML='<div class=thumb-fallback>🖼️</div>'"/>
      </div>`).join('');
  } else {
    thumbsEl.innerHTML='';
  }

  document.getElementById('detailCat').textContent    =p.category_name||'';
  document.getElementById('detailName').textContent   =p.name;
  document.getElementById('detailPrice').textContent  =fmt(p.price);
  document.getElementById('detailScore').textContent  =p.rating||0;
  document.getElementById('detailReviews').textContent=`${Number(p.review_count||0).toLocaleString()} reviews`;
  document.getElementById('detailStars').textContent  =stars(p.rating);
  document.getElementById('qtyNum').textContent       =1;

  const wasEl =document.getElementById('detailWas');
  const discEl=document.getElementById('detailDisc');
  const disc  =pct(p.price,p.original_price);
  if(p.original_price&&disc>0){wasEl.textContent=fmt(p.original_price);discEl.textContent=`${disc}% OFF`;discEl.style.display='inline-block';}
  else{wasEl.textContent='';discEl.style.display='none';}

  const stockEl=document.getElementById('detailStock');
  stockEl.textContent=p.stock>0?`✓ In Stock (${p.stock} left)  🚚 Free delivery`:'✕ Out of Stock';
  stockEl.style.color=p.stock>0?'var(--success)':'var(--danger)';

  goPage('detail');
}

function switchImg(el,src){
  document.querySelectorAll('#detailThumbs .thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const img=document.getElementById('detailMainImgReal');
  const fb =document.getElementById('detailMainImgFallback');
  img.src=src;img.style.display='block';fb.style.display='none';
}
function toggleOpt(el){el.closest('.opts').querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');}
function changeQty(d){S.qty=Math.max(1,S.qty+d);document.getElementById('qtyNum').textContent=S.qty;}

// ── CART ──────────────────────────────────────────────────────
function updateBadge(){
  const n=S.cart.reduce((s,x)=>s+x.quantity,0);
  ['cartBadge','cartBadgeInline'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=n;});
}
async function addToCart(id){
  const p=S.products.find(x=>x.id===id);
  if(!p)return;
  const ex=S.cart.find(x=>x.id===id);
  if(ex)ex.quantity++;else S.cart.push({...p,quantity:1});
  updateBadge();toast(`${p.name} added! 🛒`);
  if(S.token)await api('/cart',{method:'POST',body:JSON.stringify({product_id:id,quantity:1})});
}
async function addToCartFromDetail(){
  if(!S.product)return;
  const p=S.product,ex=S.cart.find(x=>x.id===p.id);
  if(ex)ex.quantity+=S.qty;else S.cart.push({...p,quantity:S.qty});
  updateBadge();toast(`${p.name} added! 🛒`);
  if(S.token)await api('/cart',{method:'POST',body:JSON.stringify({product_id:p.id,quantity:S.qty})});
}
function buyNow(){addToCartFromDetail();if(!S.token){goPage('login');return;}goPage('cart');}
async function removeFromCart(id){
  S.cart=S.cart.filter(x=>x.id!==id);updateBadge();renderCart();
  if(S.token)await api(`/cart/${id}`,{method:'DELETE'});
}
async function changeCartQty(id,d){
  const item=S.cart.find(x=>x.id===id);if(!item)return;
  item.quantity=Math.max(1,item.quantity+d);renderCart();
  if(S.token)await api(`/cart/${id}`,{method:'PUT',body:JSON.stringify({quantity:item.quantity})});
}
async function syncCart(){
  if(!S.token)return;
  const{ok,data}=await api('/cart');if(!ok||!data.success)return;
  data.data.forEach(item=>{
    const local=S.cart.find(x=>x.id===item.product_id);
    if(local){local.quantity=item.quantity;local.image_url=item.image_url||IMGS[item.product_id]||local.image_url;}
    else S.cart.push({id:item.product_id,name:item.name,price:item.price,image_url:item.image_url||IMGS[item.product_id]||null,images:[],category_name:item.category,quantity:item.quantity});
  });
  updateBadge();
}

// ── RENDER CART ───────────────────────────────────────────────
function renderCart(){
  const body=document.getElementById('cartBody');
  const sec =document.getElementById('checkoutSection');
  if(!body)return;

  if(!S.cart.length){
    body.innerHTML=`<div class="cart-empty"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><p>Looks like you haven't added anything!</p><button class="btn-primary" onclick="goPage('listing')">Start Shopping →</button></div>`;
    if(sec)sec.style.display='none';setSummary(0,0,0,0);return;
  }
  if(sec)sec.style.display='block';

  body.innerHTML=S.cart.map(item=>{
    const src=item.image_url||IMGS[item.id]||null;
    const imgEl=src
      ?`<img src="${src}" alt="${esc(item.name)}" class="c-img-real" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="c-img-fallback" style="display:none;">🖼️</div>`
      :`<div class="c-img-fallback">🖼️</div>`;
    return`<div class="c-item">
      <div class="c-img-wrap">${imgEl}</div>
      <div class="c-info">
        <div class="c-name">${esc(item.name)}</div>
        <div class="c-meta">${esc(item.category_name||'')} · ${fmt(item.price)} each</div>
        <div class="c-controls">
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="changeCartQty(${item.id},-1)">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="changeCartQty(${item.id},+1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
        </div>
      </div>
      <div class="c-price">${fmt(Number(item.price)*item.quantity)}</div>
    </div>`; }).join('');

  calcSummary();
}
function calcSummary(){const sub=S.cart.reduce((s,x)=>s+Number(x.price)*x.quantity,0);const gst=Math.round((sub-S.discount)*.18);setSummary(sub,S.discount,gst,sub-S.discount+gst);}
function setSummary(sub,disc,gst,total){
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('sumSubtotal',fmt(Math.round(sub)));set('sumDiscount',`−${fmt(Math.round(disc))}`);
  set('sumGst',fmt(Math.round(gst)));set('sumTotal',fmt(Math.round(total)));
}

// ── COUPON ────────────────────────────────────────────────────
async function applyCoupon(){
  const code=document.getElementById('couponInput').value.trim().toUpperCase();
  const sub=S.cart.reduce((s,x)=>s+Number(x.price)*x.quantity,0);
  if(!code){toast('Please enter a coupon code','warn');return;}
  if(S.token){
    const{ok,data}=await api('/cart/coupon',{method:'POST',body:JSON.stringify({code,subtotal:sub})});
    if(ok&&data.success){S.discount=data.discount;S.coupon=code;toast(data.message);calcSummary();return;}
    else{toast(data.message||'Invalid coupon','error');return;}
  }
  const map={FASTY10:.10,SAVE20:.20,FLAT100:null};
  if(code in map){S.discount=code==='FLAT100'?100:Math.round(sub*map[code]);S.coupon=code;toast(`${code} applied! Saved ${fmt(S.discount)} 🎉`);calcSummary();}
  else toast('Invalid coupon code','error');
}
function selectPayment(el,method){
  document.querySelectorAll('.pay-btn').forEach(b=>b.classList.remove('active'));el.classList.add('active');S.payMethod=method;
  const cf=document.getElementById('cardFields');if(cf)cf.style.display=method==='Credit Card'?'block':'none';
}

// ── PLACE ORDER ───────────────────────────────────────────────
async function placeOrder(){
  if(!S.cart.length){toast('Your cart is empty!','warn');return;}
  if(!S.token){toast('Please login first','warn');goPage('login');return;}
  const g=id=>document.getElementById(id)?.value.trim()||'';
  const fn=g('shipFirstName'),addr=g('shipAddress'),city=g('shipCity'),pin=g('shipPin');
  if(!fn||!addr||!city||!pin){toast('Fill all delivery details','warn');return;}
  if(pin.length!==6||isNaN(pin)){toast('Enter valid 6-digit PIN','warn');return;}
  const btn=document.querySelector('.place-order-btn');
  if(btn){btn.textContent='Placing order...';btn.disabled=true;}
  const{ok,data}=await api('/orders',{method:'POST',body:JSON.stringify({
    shipping_name:`${fn} ${g('shipLastName')}`.trim(),shipping_phone:g('shipPhone'),
    shipping_address:addr,shipping_city:city,shipping_pincode:pin,
    payment_method:S.payMethod,coupon_code:S.coupon||null,discount_amount:S.discount,
  })});
  if(btn){btn.textContent='Place Order →';btn.disabled=false;}
  if(ok&&data.success){
    S.cart=[];S.discount=0;S.coupon='';updateBadge();renderCart();
    document.getElementById('successModal').classList.add('open');
  }else toast(data.message||'Failed to place order.','error');
}
function closeModal(){document.getElementById('successModal').classList.remove('open');goPage('home');}

// ── MY ORDERS ─────────────────────────────────────────────────
async function loadOrders(){
  if(!S.token){goPage('login');return;}
  const body=document.getElementById('ordersBody');if(!body)return;
  body.innerHTML='<div class="loader-wrap"><div class="spinner"></div></div>';
  const{ok,data}=await api('/orders');
  if(!ok||!data.success){body.innerHTML=`<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Could not load orders</h3><p>${data.message}</p></div>`;return;}
  if(!data.data?.length){body.innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><h3>No orders yet</h3><p>Your past orders will appear here.</p></div>`;return;}

  const details=await Promise.all(data.data.map(o=>api(`/orders/${o.id}`)));
  body.innerHTML=data.data.map((o,i)=>{
    const det=details[i];
    const items=det.ok&&det.data.success?det.data.data.items:[];
    const date=new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
    const itemsHtml=items.length?items.map(it=>{
      const iSrc=it.image_url||IMGS[it.product_id]||null;
      const iEl=iSrc?`<img src="${iSrc}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.style.display='none'"/>`:`<div style="width:48px;height:48px;border-radius:8px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">🖼️</div>`;
      return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">${iEl}<div style="flex:1;"><div style="font-weight:600;font-size:13.5px;color:var(--brown);">${esc(it.name)}</div><div style="font-size:12px;color:var(--muted);">Qty ${it.quantity} × ${fmt(it.unit_price)}</div></div><div style="font-family:var(--font-head);font-weight:800;color:var(--green);">${fmt(it.total_price)}</div></div>`;
    }).join(''):'<p style="font-size:13px;color:var(--muted);padding:6px 0;">No product details.</p>';
    const canCancel=['pending','confirmed'].includes(o.status);
    return`<div class="order-card">
      <div class="order-card-top">
        <div><div class="order-id">Order #${o.id}</div><div class="order-date">${date}</div></div>
        <span class="order-status status-${o.status}">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span>
        <div class="order-amount">${fmt(o.final_amount)}</div>
      </div>
      <div style="padding:0 1.25rem 0.5rem;">${itemsHtml}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 1.25rem;border-top:1px solid var(--border);flex-wrap:wrap;gap:6px;">
        <span style="font-size:12px;color:var(--muted);">📍 ${esc(o.shipping_city||'')} &nbsp;·&nbsp; 💳 ${esc(o.payment_method||'')} &nbsp;·&nbsp; 🧾 GST ${fmt(o.gst_amount||0)}</span>
        ${canCancel?`<button onclick="cancelOrder(${o.id})" style="background:none;border:1.5px solid var(--danger);color:var(--danger);font-size:12px;font-weight:600;padding:4px 14px;border-radius:6px;cursor:pointer;">Cancel</button>`:''}
      </div>
    </div>`;
  }).join('');
}
async function cancelOrder(id){
  if(!confirm('Cancel this order?'))return;
  const{ok,data}=await api(`/orders/${id}/cancel`,{method:'PUT'});
  if(ok&&data.success){toast('Order cancelled');loadOrders();}else toast(data.message||'Could not cancel','error');
}

// ── SEARCH ────────────────────────────────────────────────────
function setupSearch(){
  const inp=document.getElementById('searchInput');
  const btn=document.getElementById('searchBtn');
  if(!inp)return;

  // Clear any browser autofill immediately and after short delay
  inp.value='';
  setTimeout(()=>{ inp.value=''; },150);

  const run=()=>{if(inp.value.trim())goPage('listing');};
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')run();});
  if(btn)btn.addEventListener('click',run);
}

// ── DARK MODE ────────────────────────────────────────────────
function toggleDark() {
  const isDark = document.body.classList.toggle('dark');
  // Also toggle on <html> for the anti-flash class
  document.documentElement.classList.toggle('dark-init', isDark);
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('fasty_dark', isDark ? '1' : '0');
  updateDarkIcon(isDark);
}

function updateDarkIcon(isDark) {
  const icon = document.getElementById('dmIcon');
  if (icon) icon.textContent = isDark ? '☀️' : '🌙';
}

function initDarkMode() {
  const saved = localStorage.getItem('fasty_dark');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved !== null ? saved === '1' : prefersDark;
  if (isDark) {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.add('dark-init');
  } else {
    document.body.classList.remove('dark');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('dark-init');
  }
  updateDarkIcon(isDark);
}

// Run immediately to avoid flash of wrong theme
initDarkMode();

// ── HERO SLIDER ──────────────────────────────────────────────
(function(){
  const TOTAL=5;
  let cur=0, timer=null;

  function goTo(idx){
    cur=(idx+TOTAL)%TOTAL;
    const t=document.getElementById('hsTrack');
    if(t){
      t.style.transition='transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)';
      t.style.transform='translateX(-'+cur*100+'%)';
    }
    document.querySelectorAll('.hs-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));
  }

  function startAuto(){ stopAuto(); timer=setInterval(()=>goTo(cur+1),4500); }
  function stopAuto(){ if(timer){clearInterval(timer);timer=null;} }

  window.hsMove=function(dir){ stopAuto(); goTo(cur+dir); startAuto(); };
  window.hsGoTo=function(idx){ stopAuto(); goTo(idx);    startAuto(); };

  function buildDots(){
    const w=document.getElementById('hsDots');
    if(!w)return;
    w.innerHTML=Array.from({length:TOTAL},(_,i)=>
      `<button class="hs-dot${i===0?' active':''}" onclick="hsGoTo(${i})"></button>`
    ).join('');
  }

  function addSwipe(){
    const s=document.getElementById('heroSlider');
    if(!s)return;
    let x=0;
    s.addEventListener('touchstart',e=>{x=e.touches[0].clientX;},{passive:true});
    s.addEventListener('touchend',e=>{
      const d=x-e.changedTouches[0].clientX;
      if(Math.abs(d)>40){stopAuto();goTo(cur+(d>0?1:-1));startAuto();}
    },{passive:true});
    s.addEventListener('mouseenter',stopAuto);
    s.addEventListener('mouseleave',startAuto);
  }

  document.addEventListener('DOMContentLoaded',()=>{ buildDots(); addSwipe(); startAuto(); });
})();

// ── INIT ──────────────────────────────────────────────────────
async function init(){
  refreshNav();
  setupSearch();
  await loadCategories();
  await loadHome();
  updateBadge();
  if(S.token)syncCart();
}

init();
