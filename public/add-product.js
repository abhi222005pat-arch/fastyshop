/* ============================================================
   Fasty Shop — add-product.js  v2
   ============================================================ */
'use strict';

const API_BASE = 'http://localhost:5000/api';

const CATEGORIES = {
  '1':'Electronics','2':'Fashion','3':'Home & Living','4':'Groceries',
  '5':'Books','6':'Gaming','7':'Beauty','8':'Sports','9':'Toys','10':'Tools',
};

// ── IMAGE STATE ───────────────────────────────────────────────
const img = {
  mode:       'upload',   // 'upload' | 'url'
  files:      [],         // [{file, dataUrl, name}]
  coverIdx:   0,
  urlValue:   '',
  urlValid:   false,
};

// ── TOAST ─────────────────────────────────────────────────────
let _tt;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.className = `toast show${type !== 'success' ? ' ' + type : ''}`;
  document.getElementById('toastIcon').textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
  document.getElementById('toastMsg').textContent  = msg;
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 3500);
}

// ── IMAGE TAB ─────────────────────────────────────────────────
function switchImgTab(tab) {
  img.mode = tab;
  document.getElementById('panel-upload').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('panel-url').style.display    = tab === 'url'    ? 'block' : 'none';
  document.getElementById('tab-upload').classList.toggle('active', tab === 'upload');
  document.getElementById('tab-url').classList.toggle('active',    tab === 'url');
  document.getElementById('err-image').textContent = '';
  updatePreview();
}

// ── DRAG & DROP ───────────────────────────────────────────────
function handleDragOver(e)  { e.preventDefault(); document.getElementById('dropZone').classList.add('drag-over'); }
function handleDragLeave(e) { document.getElementById('dropZone').classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length) processFiles(files);
  else showToast('Please drop image files only', 'warn');
}

// ── FILE SELECT ───────────────────────────────────────────────
function handleFileSelect(fileList) {
  const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
  if (files.length) processFiles(files);
  // Reset the input so the same file can be selected again
  document.getElementById('fileInput').value = '';
}

function processFiles(files) {
  const MAX = 5 * 1024 * 1024;
  let pending = 0;

  files.forEach(file => {
    if (file.size > MAX) { showToast(`"${file.name}" is over 5 MB`, 'warn'); return; }
    pending++;
    const reader = new FileReader();
    reader.onload = e => {
      img.files.push({ file, dataUrl: e.target.result, name: file.name });
      pending--;
      if (pending === 0) { renderThumbs(); updatePreview(); document.getElementById('err-image').textContent = ''; }
    };
    reader.readAsDataURL(file);
  });
}

// ── THUMBNAILS ────────────────────────────────────────────────
function renderThumbs() {
  const wrap  = document.getElementById('imageThumbs');
  const panel = document.getElementById('uploadedImages');
  const count = document.getElementById('uploadCount');
  if (!img.files.length) { panel.style.display = 'none'; return; }

  panel.style.display = 'block';
  if (count) count.textContent = img.files.length;

  wrap.innerHTML = img.files.map((f, i) => `
    <div class="img-thumb${i === img.coverIdx ? ' active' : ''}" onclick="setCover(${i})" title="${f.name}">
      <img src="${f.dataUrl}" alt="${f.name}"/>
      <button class="thumb-del" onclick="event.stopPropagation();removeThumb(${i})">✕</button>
      <span class="thumb-cover">COVER</span>
    </div>`).join('');
}

function setCover(i) { img.coverIdx = i; renderThumbs(); updatePreview(); }

function removeThumb(i) {
  img.files.splice(i, 1);
  img.coverIdx = Math.max(0, Math.min(img.coverIdx, img.files.length - 1));
  renderThumbs(); updatePreview();
  if (!img.files.length) document.getElementById('uploadedImages').style.display = 'none';
}

// ── URL IMAGE ─────────────────────────────────────────────────
function loadImageUrl() {
  const url = document.getElementById('imageUrl').value.trim();
  if (!url) { showToast('Please enter a URL', 'warn'); return; }

  img.urlValue = url; img.urlValid = false;
  const wrap = document.getElementById('urlPreviewWrap');
  const el   = document.getElementById('urlPreviewImg');
  const meta = document.getElementById('urlPreviewMeta');

  wrap.style.display = 'block';
  el.src = url;
  meta.textContent = '⏳ Loading...';
  document.getElementById('err-imageUrl').textContent = '';
}

function handleUrlLoad() {
  img.urlValid = true;
  document.getElementById('urlPreviewMeta').textContent = '✓ Image loaded!';
  updatePreview(); showToast('Image loaded!');
}
function handleUrlError() {
  img.urlValid = false;
  document.getElementById('urlPreviewMeta').textContent = '✕ Cannot load image. Check the URL.';
  document.getElementById('err-imageUrl').textContent   = 'Invalid URL or cross-origin blocked.';
  updatePreview();
}

function hasImage() {
  return (img.mode === 'upload' && img.files.length > 0)
      || (img.mode === 'url'    && img.urlValid);
}

function getCurrentImgSrc() {
  if (img.mode === 'upload' && img.files.length) return img.files[img.coverIdx]?.dataUrl || null;
  if (img.mode === 'url'    && img.urlValid)      return img.urlValue;
  return null;
}

// ── LIVE PREVIEW ──────────────────────────────────────────────
function updatePreview() {
  const name     = document.getElementById('prodName').value.trim()  || 'Product Name';
  const price    = parseFloat(document.getElementById('prodPrice').value)    || 0;
  const original = parseFloat(document.getElementById('prodOriginal').value) || 0;
  const catId    = document.getElementById('prodCategory').value;
  const badge    = document.getElementById('prodBadge').value;
  const stock    = parseInt(document.getElementById('prodStock').value)   || 0;
  const src      = getCurrentImgSrc();

  // Preview card image
  const prevImg   = document.getElementById('prevImg');
  const prevPh    = document.getElementById('prevPlaceholder');
  if (src) {
    prevImg.src = src; prevImg.style.display = 'block';
    if (prevPh) prevPh.style.display = 'none';
  } else {
    prevImg.style.display = 'none';
    if (prevPh) prevPh.style.display = 'flex';
  }

  document.getElementById('prevName').textContent  = name.length > 36 ? name.slice(0,36)+'…' : name;
  document.getElementById('prevCat').textContent   = CATEGORIES[catId] || 'Category';
  document.getElementById('prevPrice').textContent = price ? `₹${price.toLocaleString()}` : '₹0';

  const wasEl  = document.getElementById('prevWas');
  const discEl = document.getElementById('prevDisc');
  if (original > price && price > 0) {
    const p = Math.round((1-price/original)*100);
    wasEl.textContent  = `₹${original.toLocaleString()}`; wasEl.style.display  = 'inline';
    discEl.textContent = `${p}% off`;                      discEl.style.display = 'inline';
  } else { wasEl.style.display='none'; discEl.style.display='none'; }

  const badgeEl = document.getElementById('prevBadge');
  if (badge) { badgeEl.textContent=badge.toUpperCase(); badgeEl.className=`preview-badge badge-${badge}`; badgeEl.style.display='block'; }
  else badgeEl.style.display='none';

  // Summary table
  const s = id => { const e=document.getElementById(id); if(e) return e; return {textContent:''}; };
  s('ps-name').textContent  = name !== 'Product Name' ? name.slice(0,28) : '—';
  s('ps-cat').textContent   = CATEGORIES[catId] || '—';
  s('ps-price').textContent = price ? `₹${price.toLocaleString()}` : '—';
  s('ps-mrp').textContent   = original ? `₹${original.toLocaleString()}` : '—';
  s('ps-stock').textContent = stock || '—';
  s('ps-badge').textContent = badge || 'None';
  s('ps-image').textContent = img.mode==='upload' && img.files.length
    ? `${img.files.length} file(s)` : img.mode==='url' && img.urlValid ? 'URL ✓' : '—';

  updateStockStatus(stock);
}

// ── STOCK ─────────────────────────────────────────────────────
function updateDiscount() { updatePreview(); }

function syncStockSlider(v) {
  document.getElementById('prodStock').value = v;
  updateStockStatus(parseInt(v)); updatePreview();
}
function onStockInput(v) {
  const slider = document.getElementById('stockSlider');
  if (slider) slider.value = Math.min(parseInt(v)||0, 500);
  updateStockStatus(parseInt(v)||0); updatePreview();
}
function updateStockStatus(qty) {
  const el = document.getElementById('stockStatus');
  if (!el) return;
  if      (qty <= 0)  { el.className='stock-status stock-out'; el.textContent='✕ Out of Stock'; }
  else if (qty < 10)  { el.className='stock-status stock-low'; el.textContent=`⚠ Low Stock (${qty})`; }
  else                { el.className='stock-status stock-ok';  el.textContent=`✓ In Stock (${qty})`; }
}

// ── VALIDATION ────────────────────────────────────────────────
function setErr(id, msg) {
  const e = document.getElementById(`err-${id}`);
  const i = document.getElementById(id);
  if (e) e.textContent = msg;
  if (i) i.classList.toggle('error', !!msg);
}
function clearErr(id) { setErr(id,''); }

function validateForm() {
  let ok = true;

  if (!hasImage()) {
    document.getElementById('err-image').textContent = 'Please upload an image or enter a valid image URL.';
    ok = false;
  } else document.getElementById('err-image').textContent = '';

  const name = document.getElementById('prodName').value.trim();
  if (!name || name.length < 3) { setErr('prodName','At least 3 characters.'); ok=false; } else clearErr('prodName');

  if (!document.getElementById('prodCategory').value) { setErr('prodCategory','Please select a category.'); ok=false; } else clearErr('prodCategory');

  const price = parseFloat(document.getElementById('prodPrice').value);
  if (!price || price <= 0) { setErr('prodPrice','Enter a valid selling price.'); ok=false; } else clearErr('prodPrice');

  const orig = parseFloat(document.getElementById('prodOriginal').value);
  if (orig && orig <= price) { setErr('prodPrice','Selling price must be less than MRP.'); ok=false; }

  const stock = parseInt(document.getElementById('prodStock').value);
  if (isNaN(stock) || stock < 0) { setErr('prodStock','Stock must be 0 or more.'); ok=false; } else clearErr('prodStock');

  const token = document.getElementById('adminToken').value.trim();
  if (!token) { setErr('adminToken','Admin JWT token is required.'); ok=false; } else clearErr('adminToken');

  return ok;
}

// ── VERIFY TOKEN ──────────────────────────────────────────────
async function verifyToken() {
  const token  = document.getElementById('adminToken').value.trim();
  const status = document.getElementById('tokenStatus');
  if (!token) { showToast('Paste your admin token first','warn'); return; }
  status.style.display = 'none';
  try {
    const res  = await fetch(`${API_BASE}/auth/profile`, { headers:{ Authorization:`Bearer ${token}` } });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user.role === 'admin') {
        status.className = 'token-status token-valid';
        status.innerHTML = `✓ Valid admin — <strong>${data.user.name}</strong>`;
        showToast(`Verified — ${data.user.name}`);
      } else {
        status.className = 'token-status token-invalid';
        status.innerHTML = '✕ This account is not admin.';
        showToast('Not an admin account','error');
      }
    } else {
      status.className = 'token-status token-invalid';
      status.innerHTML = '✕ Invalid or expired token.';
      showToast('Invalid token','error');
    }
  } catch {
    status.className = 'token-status token-invalid';
    status.innerHTML = '⚠ Cannot reach backend on port 5000. Is the server running?';
    showToast('Backend offline','warn');
  }
  status.style.display = 'flex';
}

// ── SUBMIT PRODUCT ────────────────────────────────────────────
async function submitProduct() {
  if (!validateForm()) {
    showToast('Please fix the errors above','error');
    window.scrollTo({ top:0, behavior:'smooth' });
    return;
  }

  const token = document.getElementById('adminToken').value.trim();

  // Use FormData so files upload correctly
  // IMPORTANT: do NOT set Content-Type header — browser sets it with the multipart boundary
  const fd = new FormData();
  fd.append('name',           document.getElementById('prodName').value.trim());
  fd.append('description',    document.getElementById('prodDesc').value.trim());
  fd.append('price',          document.getElementById('prodPrice').value);
  fd.append('original_price', document.getElementById('prodOriginal').value || '');
  fd.append('stock',          document.getElementById('prodStock').value || '0');
  fd.append('category_id',    document.getElementById('prodCategory').value);
  fd.append('badge',          document.getElementById('prodBadge').value || '');

  if (img.mode === 'upload' && img.files.length) {
    // Reorder so cover comes first
    const ordered = [...img.files];
    const [cover] = ordered.splice(img.coverIdx, 1);
    const all = [cover, ...ordered];
    all.forEach((f, i) => fd.append(i === 0 ? 'image' : `image_extra_${i}`, f.file, f.name));
  } else if (img.mode === 'url' && img.urlValid) {
    fd.append('image_url', img.urlValue);
  }

  const [btn1, btn2] = [document.getElementById('submitBtn'), document.getElementById('submitBtn2')];
  [btn1,btn2].forEach(b => { if(b){b.textContent='⏳ Adding...';b.disabled=true;} });

  let success = false, responseMsg = '', newId = null;

  try {
    // IMPORTANT: fetch without Content-Type header for multipart FormData
    const res = await fetch(`${API_BASE}/products`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },  // NO Content-Type!
      body:    fd,
    });

    const data = await res.json();

    if (res.ok && data.success) {
      success     = true;
      newId       = data.id;
      responseMsg = `"${document.getElementById('prodName').value.trim()}" added with ID #${newId}! It will now appear on the website.`;
    } else {
      responseMsg = data.message || `Server returned ${res.status}`;
    }
  } catch (err) {
    responseMsg = `Network error: ${err.message}. Make sure the backend server is running on port 5000.`;
  }

  [btn1,btn2].forEach(b => {
    if (!b) return;
    b.textContent = b.id === 'submitBtn' ? '✓ Add Product' : '✓ Add Product to Fasty Shop';
    b.disabled    = false;
  });

  if (success) {
    document.getElementById('alertError').style.display    = 'none';
    document.getElementById('alertSuccessMsg').textContent = responseMsg;
    document.getElementById('alertSuccess').style.display  = 'flex';
    showToast('Product added! ✓ It is now live on the website.');
    window.scrollTo({ top:0, behavior:'smooth' });
    // Optional: auto-reset after 3 seconds
    // setTimeout(resetForm, 3000);
  } else {
    document.getElementById('alertSuccess').style.display  = 'none';
    document.getElementById('alertErrorMsg').textContent   = responseMsg;
    document.getElementById('alertError').style.display    = 'flex';
    showToast(responseMsg, 'error');
    window.scrollTo({ top:0, behavior:'smooth' });
  }
}

// ── RESET ─────────────────────────────────────────────────────
function resetForm() {
  ['prodName','prodDesc','prodPrice','prodOriginal','prodStock','adminToken','imageUrl']
    .forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
  const selects = ['prodCategory','prodBadge'];
  selects.forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });

  const slider = document.getElementById('stockSlider');
  if (slider) slider.value = 100;

  // Reset image state
  img.files=[]; img.coverIdx=0; img.urlValue=''; img.urlValid=false;
  const it=document.getElementById('imageThumbs'); if(it) it.innerHTML='';
  const ui=document.getElementById('uploadedImages'); if(ui) ui.style.display='none';
  const uw=document.getElementById('urlPreviewWrap'); if(uw) uw.style.display='none';

  // Reset alerts
  ['alertSuccess','alertError','tokenStatus','discountPreview'].forEach(id => {
    const e=document.getElementById(id); if(e) e.style.display='none';
  });
  document.querySelectorAll('.field-error').forEach(e => e.textContent='');
  document.querySelectorAll('.field-input').forEach(e => e.classList.remove('error'));

  updateStockStatus(100);
  updatePreview();
  showToast('Form reset','warn');
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Auto-fill token from localStorage if admin is already logged in on main site
  const savedToken = localStorage.getItem('fasty_token');
  if (savedToken) {
    document.getElementById('adminToken').value = savedToken;
    showToast('Admin token auto-filled from your session 🔑');
    // Auto-verify
    setTimeout(verifyToken, 500);
  }

  // Attach live-update listeners
  ['prodName','prodPrice','prodOriginal','prodCategory','prodBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });
  ['prodName','prodPrice','prodStock','prodCategory','adminToken'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      const e = document.getElementById(`err-${id}`);
      if (e) e.textContent = '';
      const i = document.getElementById(id);
      if (i) i.classList.remove('error');
    });
  });

  updatePreview();
});
