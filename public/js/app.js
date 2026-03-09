/* ============================================================
   VELVET BEAUTY — Website App JavaScript
   Handles: routing, cart, wishlist, products, auth, checkout
   ============================================================ */

'use strict';

/* ── State ── */
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('vb_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('vb_wishlist') || '[]'),
  shopFilter: 'All',
  shopSort: 'popular',
  currentPage: 'home',
  user: JSON.parse(localStorage.getItem('vb_user') || 'null'),
  discount: 0,
  promoCode: null,
  selectedPayment: 'cod',
  selectedRole: 'customer',
};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScroll();
  loadProducts();
  loadReviews();
  updateBadges();
  renderCart();
  renderWishlist();
});

/* ── Custom Cursor ── */
function initCursor() {
  const c = document.getElementById('cursor');
  const r = document.getElementById('cursorRing');
  if (!c || !r) return;
  document.addEventListener('mousemove', e => {
    c.style.left = e.clientX + 'px';
    c.style.top  = e.clientY + 'px';
    setTimeout(() => {
      r.style.left = e.clientX + 'px';
      r.style.top  = e.clientY + 'px';
    }, 80);
  });
  document.querySelectorAll('a,button,.product-card').forEach(el => {
    el.addEventListener('mouseenter', () => { c.classList.add('expanded'); r.classList.add('expanded'); });
    el.addEventListener('mouseleave', () => { c.classList.remove('expanded'); r.classList.remove('expanded'); });
  });
}

/* ── Scroll Nav ── */
function initScroll() {
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ── Toast ── */
function showToast(msg, type = 'default') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

/* ── Page Routing ── */
function showPage(page) {
  const pages = ['home','shop','cart','wishlist','checkout'];
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.style.display = p === page ? 'block' : 'none';
  });
  state.currentPage = page;
  window.scrollTo(0, 0);

  /* Sync nav active */
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if (page === 'home') document.getElementById('navHome')?.classList.add('active');
  if (page === 'shop') document.getElementById('navShop')?.classList.add('active');

  if (page === 'shop') renderShopGrid();
  if (page === 'cart') renderCart();
  if (page === 'wishlist') renderWishlist();
  if (page === 'checkout') renderCheckout();
}

function scrollToSection(id) {
  if (state.currentPage !== 'home') showPage('home');
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ── Mobile Nav ── */
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

/* ── Fetch Products ── */
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      state.products = data.data;
      renderFeatured();
      renderShopGrid();
    }
  } catch (e) {
    /* Fallback demo data */
    state.products = getDemoProducts();
    renderFeatured();
    renderShopGrid();
  }
}

async function loadReviews() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    if (data.success) renderReviews(data.data.reviews || []);
  } catch (e) {
    renderReviews(getDemoReviews());
  }
}

/* ── Product Card HTML ── */
function productCardHTML(p) {
  const isWishlisted = state.wishlist.some(w => w._id === p._id || w.id === p._id);
  const pct = p.originalPrice && p.originalPrice > p.price
    ? Math.round((1 - p.price/p.originalPrice)*100) : 0;
  return `
    <div class="product-card">
      <div class="product-image">
        ${productSVG(p)}
        ${p.badge ? `<div class="product-badge ${p.badge==='Bestseller'?'bestseller':p.badge==='New'?'new':''}">${p.badge}</div>` : ''}
        ${pct > 0 ? `<div class="product-badge sale" style="top:14px;right:60px">-${pct}%</div>` : ''}
        <div class="product-actions">
          <button class="product-action-btn ${isWishlisted?'wishlisted':''}" onclick="toggleWishlist('${p._id}',this)" title="Wishlist">♡</button>
          <button class="product-action-btn" onclick="openProductDetail('${p._id}')" title="Quick View">👁</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-shade">${p.shade}</div>
        <div class="product-rating">
          <div class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</div>
          <div class="rating-count">(${p.reviews?.toLocaleString() || 0})</div>
        </div>
        <div class="product-price">
          <span class="price-current">Rs. ${p.price?.toLocaleString()}</span>
          ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-original">Rs. ${p.originalPrice?.toLocaleString()}</span>` : ''}
        </div>
        <button class="product-add-btn" onclick="addToCart('${p._id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add to Bag
        </button>
      </div>
    </div>`;
}

/* ── Product SVG Placeholder ── */
function productSVG(p) {
  const bg = p.color || '#C4826A';
  const cat = p.category || 'Face';
  const svgs = {
    Lips: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;object-fit:cover">
      <rect width="200" height="200" fill="${lighten(bg)}"/>
      <rect x="85" y="60" width="30" height="80" rx="6" fill="${bg}" opacity="0.85"/>
      <rect x="88" y="50" width="24" height="20" rx="3" fill="${darken(bg)}"/>
      <ellipse cx="100" cy="50" rx="12" ry="5" fill="${bg}"/>
      <text x="100" y="165" text-anchor="middle" font-size="11" font-family="Montserrat,sans-serif" font-weight="600" fill="${bg}" opacity="0.4" letter-spacing="2">VELVET</text>
    </svg>`,
    Eyes: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;object-fit:cover">
      <rect width="200" height="200" fill="#F0EDF8"/>
      <rect x="30" y="80" width="140" height="60" rx="10" fill="#2C2C3E" opacity="0.8"/>
      <rect x="38" y="88" width="28" height="28" rx="5" fill="${bg}" opacity="0.9"/>
      <rect x="74" y="88" width="28" height="28" rx="5" fill="#7B68EE" opacity="0.9"/>
      <rect x="110" y="88" width="28" height="28" rx="5" fill="#8B1A1A" opacity="0.9"/>
      <rect x="38" y="122" width="28" height="10" rx="3" fill="${bg}" opacity="0.5"/>
      <rect x="74" y="122" width="28" height="10" rx="3" fill="#C9A96E" opacity="0.5"/>
      <rect x="110" y="122" width="28" height="10" rx="3" fill="#1A1A2E" opacity="0.6"/>
      <text x="100" y="170" text-anchor="middle" font-size="11" font-family="Montserrat,sans-serif" fill="#2C2C3E" opacity="0.3" letter-spacing="2">VELVET</text>
    </svg>`,
    Cheeks: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;object-fit:cover">
      <rect width="200" height="200" fill="#FFF0EC"/>
      <circle cx="100" cy="95" r="55" fill="#F2EDE4"/>
      <circle cx="100" cy="95" r="42" fill="${bg}" opacity="0.25"/>
      <circle cx="100" cy="95" r="28" fill="${bg}" opacity="0.4"/>
      <circle cx="100" cy="95" r="14" fill="${bg}" opacity="0.6"/>
      <text x="100" y="170" text-anchor="middle" font-size="11" font-family="Montserrat,sans-serif" fill="${bg}" opacity="0.5" letter-spacing="2">VELVET</text>
    </svg>`,
    Face: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;object-fit:cover">
      <rect width="200" height="200" fill="#FBF5F0"/>
      <rect x="55" y="55" width="90" height="90" rx="45" fill="${bg}" opacity="0.18"/>
      <rect x="65" y="65" width="70" height="70" rx="35" fill="${bg}" opacity="0.22"/>
      <text x="100" y="107" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="28" font-weight="300" fill="${darken(bg)}" opacity="0.7">VB</text>
      <text x="100" y="165" text-anchor="middle" font-size="11" font-family="Montserrat,sans-serif" fill="${bg}" opacity="0.4" letter-spacing="2">VELVET</text>
    </svg>`,
  };
  return (svgs[cat] || svgs['Face']).replace(/\s+/g,' ');
}

function lighten(hex) {
  return hex + '22';
}
function darken(hex) {
  /* Simple darkening via opacity overlay */
  return hex;
}

/* ── Featured Grid ── */
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = state.products.slice(0, 4);
  grid.innerHTML = featured.map(productCardHTML).join('');
}

/* ── Shop Grid ── */
function renderShopGrid() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  let filtered = [...state.products];
  if (state.shopFilter !== 'All') {
    filtered = filtered.filter(p => p.category === state.shopFilter);
  }

  /* Sorting */
  switch (state.shopSort) {
    case 'price-low':  filtered.sort((a,b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a,b) => b.price - a.price); break;
    case 'rating':     filtered.sort((a,b) => (b.rating||0) - (a.rating||0)); break;
    case 'new':        filtered.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0)); break;
    default:           filtered.sort((a,b) => (b.sold||0) - (a.sold||0));
  }

  const countEl = document.getElementById('shopCount');
  if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;

  grid.innerHTML = filtered.length
    ? filtered.map(productCardHTML).join('')
    : `<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No products found</h3><p>Try a different category filter</p></div></div>`;
}

function setShopFilter(cat, btn) {
  state.shopFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn && btn.classList.add('active');
  renderShopGrid();
}

function sortProducts() {
  state.shopSort = document.getElementById('sortSelect').value;
  renderShopGrid();
}

function filterShopBy(cat) {
  state.shopFilter = cat;
  showPage('shop');
  setTimeout(() => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.textContent === cat);
    });
    renderShopGrid();
  }, 50);
}

/* ── Reviews ── */
function renderReviews(reviews) {
  const grid = document.getElementById('reviewGrid');
  if (!grid) return;
  const avatarColors = ['#E91E8C','#9C27B0','#FF5722','#2196F3','#4CAF50','#FF9800'];
  grid.innerHTML = reviews.map((r, i) => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar" style="background:${avatarColors[i%avatarColors.length]}">${(r.customerName||'A').charAt(0)}</div>
        <div>
          <div class="review-name">${r.customerName || 'Valued Customer'}</div>
          <div class="review-product" style="display:flex;align-items:center;gap:6px">
            <span class="review-stars">${'★'.repeat(Math.round(r.rating||5))}</span>
          </div>
        </div>
      </div>
      <p class="review-text">"${r.text || 'Amazing product!'}"</p>
    </div>`).join('');
}

/* ── Cart ── */
function addToCart(productId) {
  const product = state.products.find(p => p._id === productId || p.id === productId);
  if (!product) return;
  const existing = state.cart.find(i => i._id === productId || i.id === productId);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateBadges();
  showToast(`${product.name} added to bag 🛍️`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i._id !== productId && i.id !== productId);
  saveCart();
  updateBadges();
  renderCart();
}

function updateCartQty(productId, delta) {
  const item = state.cart.find(i => i._id === productId || i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart();
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart();
  updateBadges();
  renderCart();
}

function saveCart() {
  localStorage.setItem('vb_cart', JSON.stringify(state.cart));
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (!state.cart.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:80px 20px">
        <div class="empty-state-icon">🛍️</div>
        <h3>Your bag is empty</h3>
        <p>Add some beautiful products to get started</p>
        <button class="btn btn-primary" style="margin-top:20px" onclick="showPage('shop')">Shop Now →</button>
      </div>`;
    document.getElementById('clearCartBtn') && (document.getElementById('clearCartBtn').style.display='none');
  } else {
    container.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${productSVG(item)}</div>
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.category}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-shade">${item.shade}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateCartQty('${item._id||item.id}', -1)">−</button>
            <span class="qty-num">${item.qty || 1}</span>
            <button class="qty-btn" onclick="updateCartQty('${item._id||item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <div class="cart-item-price">Rs. ${((item.price||0) * (item.qty||1)).toLocaleString()}</div>
          <button class="cart-remove" onclick="removeFromCart('${item._id||item.id}')">Remove</button>
        </div>
      </div>`).join('');
    document.getElementById('clearCartBtn') && (document.getElementById('clearCartBtn').style.display='inline-flex');
  }

  /* Update totals */
  const subtotal = state.cart.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0);
  const shipping = subtotal > 3000 ? 0 : 200;
  const discount = state.discount || 0;
  const total = subtotal + shipping - discount;

  const fmt = n => 'Rs. ' + n.toLocaleString();
  document.getElementById('cartSubtotal') && (document.getElementById('cartSubtotal').textContent = fmt(subtotal));
  document.getElementById('cartShipping') && (document.getElementById('cartShipping').textContent = shipping === 0 ? 'FREE 🎉' : fmt(shipping));
  document.getElementById('cartDiscount') && (document.getElementById('cartDiscount').textContent = discount > 0 ? '-' + fmt(discount) : '-Rs. 0');
  document.getElementById('cartTotal') && (document.getElementById('cartTotal').textContent = fmt(Math.max(0,total)));
}

/* ── Promo Code ── */
function applyPromo() {
  const code = document.getElementById('promoInput')?.value?.trim().toUpperCase();
  const promos = { 'VELVET10': 0.10, 'BEAUTY20': 0.20, 'VB50': 0.50 };
  if (promos[code]) {
    const subtotal = state.cart.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0);
    state.discount = Math.round(subtotal * promos[code]);
    showToast(`Promo applied! ${code} — ${promos[code]*100}% off 🎉`, 'success');
    renderCart();
  } else {
    showToast('Invalid promo code', 'error');
    state.discount = 0;
  }
}

/* ── Wishlist ── */
function toggleWishlist(productId, btn) {
  const product = state.products.find(p => p._id === productId || p.id === productId);
  if (!product) return;
  const idx = state.wishlist.findIndex(w => w._id === productId || w.id === productId);
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
    btn && btn.classList.remove('wishlisted');
    showToast(`${product.name} removed from wishlist`);
  } else {
    state.wishlist.push(product);
    btn && btn.classList.add('wishlisted');
    showToast(`${product.name} added to wishlist ♡`);
  }
  localStorage.setItem('vb_wishlist', JSON.stringify(state.wishlist));
  updateBadges();
  if (state.currentPage === 'wishlist') renderWishlist();
}

function renderWishlist() {
  const grid = document.getElementById('wishlistGrid');
  const countEl = document.getElementById('wishlistCount');
  if (!grid) return;
  if (countEl) countEl.textContent = `${state.wishlist.length} item${state.wishlist.length !== 1 ? 's' : ''} saved`;

  if (!state.wishlist.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1">
        <div class="empty-state" style="padding:80px 20px">
          <div class="empty-state-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love to buy later</p>
          <button class="btn btn-primary" style="margin-top:20px" onclick="showPage('shop')">Discover Products →</button>
        </div>
      </div>`;
  } else {
    grid.innerHTML = state.wishlist.map(p => productCardHTML(p)).join('');
  }
}

function addAllToCart() {
  if (!state.wishlist.length) return;
  state.wishlist.forEach(p => addToCart(p._id || p.id));
  showToast(`${state.wishlist.length} items added to bag 🛍️`, 'success');
}

/* ── Checkout ── */
function renderCheckout() {
  const itemsEl = document.getElementById('checkoutItems');
  const subtotalEl = document.getElementById('coSubtotal');
  const totalEl = document.getElementById('coTotal');
  if (!itemsEl) return;

  if (!state.cart.length) {
    document.getElementById('checkoutContent').innerHTML = `
      <div class="empty-state" style="padding:80px 40px">
        <div class="empty-state-icon">🛍️</div>
        <h3>Your cart is empty</h3>
        <p>Add products before checking out</p>
        <button class="btn btn-primary" style="margin-top:20px" onclick="showPage('shop')">Shop Now →</button>
      </div>`;
    return;
  }

  itemsEl.innerHTML = state.cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-img">${productSVG({...item, color: item.color})}</div>
      <div>
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-shade">${item.shade} × ${item.qty||1}</div>
      </div>
      <div class="checkout-item-price">Rs. ${((item.price||0)*(item.qty||1)).toLocaleString()}</div>
    </div>`).join('');

  const subtotal = state.cart.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0);
  const total = subtotal + (subtotal > 3000 ? 0 : 200) - (state.discount||0);
  if (subtotalEl) subtotalEl.textContent = 'Rs. ' + subtotal.toLocaleString();
  if (totalEl) totalEl.textContent = 'Rs. ' + Math.max(0,total).toLocaleString();
}

function selectPayment(el, type) {
  state.selectedPayment = type;
  document.querySelectorAll('.payment-option').forEach(p => {
    p.classList.remove('selected');
    p.querySelector('input[type=radio]').checked = false;
  });
  el.classList.add('selected');
  el.querySelector('input[type=radio]').checked = true;
}

async function placeOrder() {
  /* Validate fields */
  const fname = document.getElementById('co-fname')?.value?.trim();
  const lname = document.getElementById('co-lname')?.value?.trim();
  const phone = document.getElementById('co-phone')?.value?.trim();
  const address = document.getElementById('co-address')?.value?.trim();
  const city = document.getElementById('co-city')?.value?.trim();
  if (!fname || !lname || !phone || !address || !city) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  if (!state.cart.length) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const subtotal = state.cart.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0);
  const total = subtotal + (subtotal > 3000 ? 0 : 200) - (state.discount||0);

  /* Try API */
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: 'VB-' + Date.now(),
        customerName: fname + ' ' + lname,
        city,
        items: state.cart.map(i => ({ productName: i.name, quantity: i.qty||1, price: i.price })),
        total: Math.max(0, total),
        status: 'processing',
      })
    });
  } catch (e) { /* offline - that's fine */ }

  /* Show success */
  document.getElementById('checkoutContent').innerHTML = `
    <div class="checkout-layout" style="grid-template-columns:1fr">
      <div class="order-placed-screen">
        <div class="order-placed-icon">✓</div>
        <h2 class="section-title" style="margin-bottom:12px">Order Placed!</h2>
        <p style="font-size:15px;color:var(--text2);margin-bottom:8px">Thank you, <strong>${fname}</strong>! Your order has been placed successfully.</p>
        <p style="font-size:13px;color:var(--text3);margin-bottom:32px">Your order total was <strong>Rs. ${Math.max(0,total).toLocaleString()}</strong>. We'll contact you at <strong>${phone}</strong> to confirm delivery.</p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="goShopping()">Continue Shopping</button>
          <button class="btn btn-outline" onclick="showPage('home')">Back to Home</button>
        </div>
      </div>
    </div>`;

  /* Clear cart */
  state.cart = [];
  state.discount = 0;
  saveCart();
  updateBadges();
}

function goShopping() {
  showPage('shop');
}

/* ── Badges ── */
function updateBadges() {
  const cartCount = state.cart.reduce((s,i) => s + (i.qty||1), 0);
  const wishCount = state.wishlist.length;

  const cb = document.getElementById('cartBadge');
  const wb = document.getElementById('wishlistBadge');
  if (cb) cb.textContent = cartCount || '';
  if (wb) wb.textContent = wishCount || '';
}

/* ── Product Detail Modal ── */
function openProductDetail(productId) {
  const p = state.products.find(pr => pr._id === productId || pr.id === productId);
  if (!p) return;
  const pct = p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price/p.originalPrice)*100) : 0;
  const isWishlisted = state.wishlist.some(w => w._id === p._id || w.id === p._id);

  document.getElementById('productDetailContent').innerHTML = `
    <div class="product-detail-img">${productSVG(p)}</div>
    <div style="padding:28px 28px 28px 8px">
      <div class="product-category" style="margin-bottom:6px">${p.category}</div>
      <div class="product-detail-name">${p.name}</div>
      <div class="product-shade">${p.shade}</div>
      <div class="product-rating" style="margin:12px 0">
        <div class="stars">${'★'.repeat(Math.round(p.rating||5))}</div>
        <div class="rating-count">${p.rating} (${p.reviews?.toLocaleString() || 0} reviews)</div>
      </div>
      <div class="product-price" style="margin-bottom:16px">
        <span class="price-current" style="font-size:32px">Rs. ${p.price?.toLocaleString()}</span>
        ${pct > 0 ? `<span class="price-original">Rs. ${p.originalPrice?.toLocaleString()}</span><span style="background:var(--rose);color:white;font-size:12px;font-weight:700;padding:3px 8px;border-radius:4px">-${pct}%</span>` : ''}
      </div>
      <p class="product-detail-desc">${p.description || 'Premium quality makeup crafted for the modern woman.'}</p>
      <div class="product-detail-actions">
        <button class="btn btn-primary btn-lg" onclick="addToCart('${p._id}');closeModal('productModal')">Add to Bag 🛍️</button>
        <button class="btn btn-outline" onclick="toggleWishlist('${p._id}',null);closeModal('productModal')">
          ${isWishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
        </button>
      </div>
      <div style="margin-top:20px;display:flex;gap:16px;font-size:12px;color:var(--text3)">
        <span>📦 Free shipping over Rs. 3000</span>
        <span>↩ Easy returns</span>
      </div>
    </div>`;
  openModal('productModal');
}

/* ── Modals ── */
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
  document.body.style.overflow = '';
}
/* Close on backdrop click */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

function openAuthModal() {
  openModal('authModal');
}

/* ── Auth ── */
function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('auth-' + tab)?.classList.add('active');
}

function selectRole(el, role) {
  state.selectedRole = role;
  document.querySelectorAll('.auth-role-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function doLogin() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  const pass  = document.getElementById('loginPassword')?.value;
  if (!email || !pass) { showToast('Please fill in all fields', 'error'); return; }
  /* Demo login - just simulate */
  const user = { name: email.split('@')[0], email, role: 'customer' };
  state.user = user;
  localStorage.setItem('vb_user', JSON.stringify(user));
  closeModal('authModal');
  showToast(`Welcome back, ${user.name}! 👋`, 'success');
}

function doRegister() {
  const name  = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const pass  = document.getElementById('regPassword')?.value;
  if (!name || !email || !pass) { showToast('Please fill in all fields', 'error'); return; }

  /* Try to create customer in DB */
  fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, status: 'New', totalOrders: 0, totalSpent: 0 })
  }).catch(() => {});

  const user = { name, email, role: state.selectedRole };
  state.user = user;
  localStorage.setItem('vb_user', JSON.stringify(user));
  closeModal('authModal');
  showToast(`Account created! Welcome, ${name} 🌸`, 'success');
}

/* ── Newsletter ── */
function subscribeNewsletter() {
  const email = document.getElementById('newsletterEmail')?.value?.trim();
  if (!email || !email.includes('@')) { showToast('Please enter a valid email', 'error'); return; }
  showToast(`You're subscribed! Welcome to the Velvet Circle ✦`, 'success');
  document.getElementById('newsletterEmail').value = '';
}

/* ── Demo Data (fallback when no MongoDB) ── */
function getDemoProducts() {
  return [
    { _id: '1', name: 'Velvet Matte Lip', category: 'Lips', price: 2800, originalPrice: 3500, stock: 142, sold: 1284, rating: 4.9, reviews: 847, shade: 'Ruby Obsession', color: '#8B1A1A', description: 'Ultra-pigmented matte formula that lasts 24 hours.', badge: 'Bestseller', isNew: false },
    { _id: '2', name: 'Glow Serum Foundation', category: 'Face', price: 4200, originalPrice: 5000, stock: 89, sold: 932, rating: 4.8, reviews: 623, shade: 'Sand Dune 03', color: '#C8956C', description: 'Buildable coverage with skin-care benefits. SPF 30 protection.', badge: 'New', isNew: true },
    { _id: '3', name: 'Smoky Eye Palette', category: 'Eyes', price: 3600, originalPrice: 4200, stock: 67, sold: 756, rating: 4.7, reviews: 512, shade: '12 Shades', color: '#2C2C3E', description: 'Curated neutrals to deep smokies.', badge: 'Top Rated', isNew: false },
    { _id: '4', name: 'Cloud Blush', category: 'Cheeks', price: 1900, originalPrice: 2400, stock: 203, sold: 1876, rating: 4.9, reviews: 1203, shade: 'Peach Crush', color: '#FFB6A3', description: 'Weightless powder blush with a natural flush effect.', badge: 'Bestseller', isNew: false },
    { _id: '5', name: 'Lash Amplify Mascara', category: 'Eyes', price: 1600, originalPrice: 2000, stock: 315, sold: 2341, rating: 4.8, reviews: 1876, shade: 'Blackest Black', color: '#1A1A2E', description: 'Volumizing and lengthening formula.', badge: 'Cult Fave', isNew: false },
    { _id: '6', name: 'Skin Tint SPF40', category: 'Face', price: 3100, originalPrice: 3100, stock: 178, sold: 644, rating: 4.6, reviews: 389, shade: 'Porcelain 01', color: '#F5E6D3', description: 'Breathable sheer tint with SPF 40 sun protection.', badge: 'New', isNew: true },
    { _id: '7', name: 'Velvet Lip Liner', category: 'Lips', price: 1200, originalPrice: 1500, stock: 256, sold: 1102, rating: 4.7, reviews: 734, shade: 'Nude Perfection', color: '#C4826A', description: 'Precision lip liner that stays put all day.', badge: null, isNew: false },
    { _id: '8', name: 'Highlighter Duo', category: 'Cheeks', price: 2400, originalPrice: 3000, stock: 134, sold: 891, rating: 4.9, reviews: 567, shade: 'Champagne & Rose', color: '#E8C5A0', description: 'Two complementary highlighters for a dimensional glow.', badge: 'Top Rated', isNew: false },
    { _id: '9', name: 'Brow Definer Pen', category: 'Eyes', price: 1400, originalPrice: 1800, stock: 189, sold: 1456, rating: 4.8, reviews: 923, shade: 'Soft Brunette', color: '#4A3728', description: 'Micro-precision tip for hair-like strokes.', badge: null, isNew: false },
    { _id: '10', name: 'Setting Spray Mist', category: 'Face', price: 1800, originalPrice: 2200, stock: 421, sold: 3201, rating: 4.7, reviews: 2134, shade: 'Universal', color: '#D4F1F4', description: 'Lock makeup in place for 16 hours.', badge: 'Bestseller', isNew: false },
    { _id: '11', name: 'Glitter Liner', category: 'Eyes', price: 1500, originalPrice: 1900, stock: 112, sold: 678, rating: 4.6, reviews: 423, shade: 'Galaxy Gold', color: '#FFD700', description: 'Intensely pigmented glitter liner.', badge: 'New', isNew: true },
    { _id: '12', name: 'Lip Plumper Gloss', category: 'Lips', price: 2200, originalPrice: 2700, stock: 167, sold: 1089, rating: 4.5, reviews: 678, shade: 'Cherry Bomb', color: '#C41E3A', description: 'Plumping gloss with peptide complex.', badge: null, isNew: false },
  ];
}

function getDemoReviews() {
  return [
    { customerName: 'Ayesha Khan', rating: 5, text: 'Absolutely love this! The pigmentation is incredible and it lasts all day. Will definitely repurchase.' },
    { customerName: 'Fatima Malik', rating: 5, text: 'Best makeup I have ever tried. The shade is exactly as shown and the packaging is gorgeous.' },
    { customerName: 'Zara Hussain', rating: 5, text: 'Smooth application, beautiful finish. My new holy grail! Fast shipping and beautifully packaged.' },
  ];
}
