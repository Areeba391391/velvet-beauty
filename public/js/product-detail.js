/* ============================================================
   VELVET BEAUTY — PRODUCT DETAIL LOGIC (MongoDB API version)
   ============================================================ */

let pdProduct  = null;
let currentQty = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { window.location.href = 'shop.html'; return; }

  pdProduct = await VBProducts.getById(id);
  if (!pdProduct) { window.location.href = 'shop.html'; return; }

  renderProduct();
  await renderReviews();
  await renderRelated();

  const cc = document.getElementById('cart-count');
  if (cc) cc.textContent = VBCart.count();
});

/* ── Main Render ── */
function renderProduct() {
  const p   = pdProduct;
  const pid = p._id || p.id;

  document.title = `${p.name} — Velvet Beauty`;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setTxt('pd-breadcrumb-name', p.name);
  setTxt('pd-name-v2',         p.name);
  setTxt('pd-cat-v2',          p.category);
  setTxt('pd-desc-v2',         p.description || p.desc || 'Our handcrafted formula ensures long-lasting results and premium comfort for the modern woman.');

  // Pricing
  const origPrice = p.originalPrice || p.origPrice;
  setTxt('pd-price-now', `Rs. ${p.price.toLocaleString()}`);
  if (origPrice) {
    setTxt('pd-price-was', `Rs. ${origPrice.toLocaleString()}`);
    const discount    = Math.round(((origPrice - p.price) / origPrice) * 100);
    const discEl      = document.getElementById('pd-discount');
    if (discEl) { discEl.textContent = `Save ${discount}%`; discEl.style.display = 'inline-block'; }
  } else {
    setTxt('pd-price-was', '');
    const discEl = document.getElementById('pd-discount'); if (discEl) discEl.style.display = 'none';
  }

  // Gallery
  const mainImg = document.getElementById('pd-main-img');
  if (mainImg) mainImg.src = p.image || '';
  const thumbs  = document.getElementById('pd-thumbnails');
  if (thumbs) {
    thumbs.innerHTML = `
      <img src="${p.image || ''}" class="active" onclick="changeThumb('${p.image || ''}', this)"
           onerror="this.src='https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200'">
      <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200" onclick="changeThumb(this.src, this)">
      <img src="https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=200" onclick="changeThumb(this.src, this)">
    `;
  }

  // Stars
  const rating     = p.rating || 0;
  const fullStars  = '★'.repeat(Math.round(rating));
  const emptyStars = '☆'.repeat(5 - Math.round(rating));
  setTxt('pd-stars-v2',        fullStars + emptyStars);
  setTxt('pd-review-count-v2', `(${p.reviews || 0} reviews)`);

  // Shades
  const shadesWrap = document.getElementById('pd-shades-wrap');
  if (shadesWrap) {
    if (p.shades && p.shades.length > 0) {
      shadesWrap.style.display = 'block';
      const swEl = document.getElementById('pd-swatches');
      if (swEl) swEl.innerHTML = p.shades.map(s => `<div class="shade-dot" style="background:${s}" onclick="selectShade('${s}', this)"></div>`).join('');
    } else if (p.shade) {
      shadesWrap.style.display = 'block';
      const swEl = document.getElementById('pd-swatches');
      if (swEl) swEl.innerHTML = `<div class="shade-dot" style="background:${p.color || p.shade}" onclick="selectShade('${p.shade}', this)"></div>`;
    } else {
      shadesWrap.style.display = 'none';
    }
  }

  // Wishlist button state
  const wishBtn = document.getElementById('pd-wish-btn-v2');
  if (wishBtn && VBWish.has(pid)) wishBtn.classList.add('active');

  // Add to Cart
  const addCartBtn = document.getElementById('pd-add-cart-btn');
  if (addCartBtn) {
    addCartBtn.onclick = () => {
      const session = VBAuth.session();
      if (!session) {
        VBToast.show('Please login to add items to cart', 'warning');
        setTimeout(() => window.location.href = 'login.html?return=' + encodeURIComponent(window.location.href), 700);
        return;
      }
      VBCart.add(pdProduct, currentQty);
      VBToast.show(`${currentQty} × ${p.name} added to cart ✨`, 'success');
      const cc = document.getElementById('cart-count'); if (cc) cc.textContent = VBCart.count();
    };
  }

  // Wishlist toggle
  if (wishBtn) {
    wishBtn.onclick = () => {
      const session = VBAuth.session();
      if (!session) { VBToast.show('Please login to use wishlist', 'warning'); return; }
      const added = VBWish.toggle(pid);
      wishBtn.classList.toggle('active', added);
      VBToast.show(added ? 'Added to wishlist 💝' : 'Removed from wishlist', added ? 'success' : 'info');
    };
  }
}

function updateQty(val) {
  currentQty = Math.max(1, currentQty + val);
  const qtyEl = document.getElementById('pd-qty'); if (qtyEl) qtyEl.textContent = currentQty;
}

function changeThumb(src, el) {
  const mainImg = document.getElementById('pd-main-img'); if (mainImg) mainImg.src = src;
  document.querySelectorAll('.thumb-list img').forEach(img => img.classList.remove('active'));
  el.classList.add('active');
}

function selectShade(color, el) {
  const nameEl = document.getElementById('pd-shade-name'); if (nameEl) nameEl.textContent = color;
  document.querySelectorAll('.shade-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}

/* ── Reviews from MongoDB ── */
async function renderReviews() {
  const list = document.getElementById('reviews-list');
  if (!list) return;

  const pid     = pdProduct._id || pdProduct.id;
  const reviews = await VBReviews.getByProduct(pid);

  if (!reviews.length) {
    list.innerHTML = '<div style="padding:20px; background:white; border-radius:20px; font-size:14px; color:#999;">No reviews yet. Be the first to review!</div>';
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div style="padding:20px; background:white; border-radius:20px; font-size:14px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <strong>${r.customerName}</strong>
        <span style="color:#E91E8C;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p style="margin:0; color:#555;">${r.text}</p>
      <small style="color:#aaa;">${fmtDate(r.createdAt)}</small>
    </div>
  `).join('');
}

/* ── Related Products from MongoDB ── */
async function renderRelated() {
  const grid = document.getElementById('related-grid');
  if (!grid) return;

  const related = await VBProducts.fetchAll({ category: pdProduct.category, limit: 4 });
  const pid     = pdProduct._id || pdProduct.id;
  const filtered = related.filter(p => (p._id || p.id) !== pid).slice(0, 3);

  grid.innerHTML = filtered.map(p => vbCard(p, 0)).join('');
}