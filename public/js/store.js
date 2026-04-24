/* ============================================================
   VELVET BEAUTY — store.js  (v3 — MongoDB API Edition)
   Ab sab data MongoDB se aata/jaata hai via REST API.
   localStorage sirf session, cart, wishlist ke liye use hoga.
   ============================================================ */

const API = '/api';

/* ── Local-only keys (session, cart, wishlist remain local) ── */
const KEYS = {
  session:  'vb_session',
  cart:     'vb_cart',
  wishlist: 'vb_wishlist',
};

const DB = {
  get:    k     => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: k     => localStorage.removeItem(k),
};

/* ── API Helper ── */
async function apiFetch(url, options = {}) {
  try {
    const res  = await fetch(API + url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, message: err.message };
  }
}

/* ══════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════ */
const VBAuth = {
  async login(email, password, role, accessCode) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password, role, accessCode },
    });
    if (res.success) {
      DB.set(KEYS.session, res.data);
      return { ok: true, session: res.data };
    }
    return { ok: false, error: res.message };
  },

  async register(data) {
    const fullName = ((data.firstName || '') + ' ' + (data.lastName || '')).trim();
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: {
        name:       fullName,
        email:      data.email,
        phone:      data.phone || '',
        city:       data.city  || '',
        password:   data.password,
        role:       data.role || 'customer',
        accessCode: data.accessCode || '',
      },
    });
    if (res.success) {
      DB.set(KEYS.session, res.data);
      return { ok: true, session: res.data };
    }
    return { ok: false, error: res.message };
  },

  logout()  { DB.remove(KEYS.session); },
  session() { return DB.get(KEYS.session); },

  guard(allowedRoles) {
    const session = DB.get(KEYS.session);
    if (!session) {
      const isStaffOnly = allowedRoles && allowedRoles.every(r => r === 'owner' || r === 'employee');
      window.location.href = isStaffOnly
        ? 'dashboard-login.html'
        : 'login.html?return=' + encodeURIComponent(window.location.href);
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      const isStaffOnly = allowedRoles.every(r => r === 'owner' || r === 'employee');
      window.location.href = isStaffOnly ? 'dashboard-login.html' : 'index.html';
      return null;
    }
    return session;
  },
};

/* ══════════════════════════════════════════════════
   PRODUCTS (DB se)
══════════════════════════════════════════════════ */
const VBProducts = {
  _cache: null,

  async fetchAll(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch('/products' + (qs ? '?' + qs : ''));
    if (res.success) { this._cache = res.data; return res.data; }
    return [];
  },

  async getAll()        { return this._cache || await this.fetchAll(); },
  async getActive()     { return await this.fetchAll(); },
  async get()           { return await this.getActive(); },
  async getBest()       { return await this.fetchAll({ sort: 'bestseller' }); },
  async getNew()        { return await this.fetchAll({ isNew: true }); },
  async getByCat(cat)   { return await this.fetchAll({ category: cat }); },
  async search(q)       { return await this.fetchAll(); /* filter done server-side */ },

  async getById(id) {
    if (this._cache) { const p = this._cache.find(p => p._id === id || p.id === id); if (p) return p; }
    const res = await apiFetch('/products/' + id);
    return res.success ? res.data : null;
  },

  async add(data) {
    const res = await apiFetch('/products', { method: 'POST', body: data });
    if (res.success) { this._cache = null; return res.data; }
    return null;
  },

  async update(id, data) {
    const res = await apiFetch('/products/' + id, { method: 'PUT', body: data });
    if (res.success) { this._cache = null; return res.data; }
    return null;
  },

  async delete(id) {
    const res = await apiFetch('/products/' + id, { method: 'DELETE' });
    this._cache = null;
    return res.success;
  },

  /* Sync wrappers for cart compatibility (product already in memory) */
  getByIdSync(id) {
    if (!this._cache) return null;
    return this._cache.find(p => p._id === id || p.id === id) || null;
  },
};

/* ══════════════════════════════════════════════════
   CART (localStorage — stays local)
══════════════════════════════════════════════════ */
const VBCart = {
  get()      { return DB.get(KEYS.cart) || []; },
  save(cart) { DB.set(KEYS.cart, cart); this.updateBadge(); },
  count()    { return this.get().reduce((s, i) => s + i.qty, 0); },
  total()    { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },

  add(product, qty = 1) {
    const cart     = this.get();
    const id       = product._id || product.id;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({
      id:       id,
      name:     product.name,
      price:    product.price,
      image:    product.image || '',
      category: product.category,
      qty,
    });
    this.save(cart);
  },

  remove(id)         { this.save(this.get().filter(i => i.id !== id)); },
  updateQty(id, qty) { if (qty < 1) { this.remove(id); return; } const cart = this.get(); const item = cart.find(i => i.id === id); if (item) { item.qty = qty; this.save(cart); } },
  clear()            { this.save([]); },

  async totals(couponCode) {
    const subtotal = this.total();
    const res      = await apiFetch('/settings');
    const settings = res.success ? res.data : { freeDeliveryMin: 2000, deliveryFee: 200 };
    const coupons  = { VELVET10: 0.10, BEAUTY20: 0.20, VIP30: 0.30, FIRST15: 0.15 };
    const discRate = couponCode ? (coupons[couponCode.toUpperCase()] || 0) : 0;
    const discount = Math.round(subtotal * discRate);
    const afterDisc    = subtotal - discount;
    const deliveryFee  = afterDisc >= settings.freeDeliveryMin ? 0 : settings.deliveryFee;
    return { subtotal, discount, deliveryFee, total: afterDisc + deliveryFee, discRate };
  },

  updateBadge() {
    const count = this.count();
    document.querySelectorAll('#cart-count').forEach(el => {
      el.textContent     = count;
      el.style.display   = count > 0 ? 'flex' : 'none';
    });
  },
};

/* ══════════════════════════════════════════════════
   WISHLIST (localStorage — stays local)
══════════════════════════════════════════════════ */
const VBWish = {
  get()      { return DB.get(KEYS.wishlist) || []; },
  save(list) { DB.set(KEYS.wishlist, list); this.updateBadge(); },
  has(id)    { return this.get().includes(id); },
  count()    { return this.get().length; },

  toggle(id) {
    const list = this.get(), i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    this.save(list);
    return i < 0;
  },

  remove(id)  { this.save(this.get().filter(i => i !== id)); },

  async moveAll() {
    const ids = this.get();
    for (const id of ids) {
      const p = await VBProducts.getById(id);
      if (p) VBCart.add(p, 1);
    }
    this.save([]);
  },

  updateBadge() {
    const count = this.count();
    document.querySelectorAll('#wishlist-count').forEach(el => {
      el.textContent   = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
};

/* ══════════════════════════════════════════════════
   ORDERS (DB se)
══════════════════════════════════════════════════ */
const VBOrders = {
  async getAll(params = {}) {
    const qs  = new URLSearchParams(params).toString();
    const res = await apiFetch('/orders' + (qs ? '?' + qs : ''));
    return res.success ? res.data : [];
  },

  async getById(id) {
    const res = await apiFetch('/orders/' + id);
    return res.success ? res.data : null;
  },

  async place(orderData) {
    const session  = VBAuth.session();
    const payload  = { ...orderData };
    if (session && session.customerId) payload.customer = session.customerId;

    const res = await apiFetch('/orders', { method: 'POST', body: payload });
    if (res.success) {
      VBCart.clear();
      return res.data;
    }
    return null;
  },

  async updateStatus(id, status) {
    const res = await apiFetch('/orders/' + id, { method: 'PUT', body: { status } });
    return res.success ? res.data : null;
  },

  async delete(id) {
    const res = await apiFetch('/orders/' + id, { method: 'DELETE' });
    return res.success;
  },
};

/* ══════════════════════════════════════════════════
   REVIEWS (DB se)
══════════════════════════════════════════════════ */
const VBReviews = {
  async getAll(params = {}) {
    const qs  = new URLSearchParams(params).toString();
    const res = await apiFetch('/reviews' + (qs ? '?' + qs : ''));
    return res.success ? res.data : [];
  },

  async getByProduct(productId) {
    return await this.getAll({ product: productId });
  },

  async add(data) {
    const res = await apiFetch('/reviews', { method: 'POST', body: data });
    return res.success ? res.data : null;
  },

  async delete(id) {
    const res = await apiFetch('/reviews/' + id, { method: 'DELETE' });
    return res.success;
  },
};

/* ══════════════════════════════════════════════════
   CUSTOMERS (DB se)
══════════════════════════════════════════════════ */
const VBCustomers = {
  async getAll(params = {}) {
    const qs  = new URLSearchParams(params).toString();
    const res = await apiFetch('/customers' + (qs ? '?' + qs : ''));
    return res.success ? res.data : [];
  },

  async getById(id) {
    const res = await apiFetch('/customers/' + id);
    return res.success ? res.data : null;
  },

  async add(data) {
    const res = await apiFetch('/customers', { method: 'POST', body: data });
    return res.success ? res.data : null;
  },
};

/* ══════════════════════════════════════════════════
   ANALYTICS (DB se)
══════════════════════════════════════════════════ */
const VBAnalytics = {
  async get() {
    const res = await apiFetch('/analytics');
    return res.success ? res.data : [];
  },

  async summary() {
    const res = await apiFetch('/analytics/summary');
    return res.success ? res.data : { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, delivered: 0, pending: 0 };
  },
};

/* ══════════════════════════════════════════════════
   SETTINGS + PROMO (DB se)
══════════════════════════════════════════════════ */
const VBSettings = {
  async get() {
    const res = await apiFetch('/settings');
    return res.success ? res.data : { empCode: 'EMP2025', ownerCode: 'OWNER2025', freeDeliveryMin: 2000, deliveryFee: 200 };
  },
  async save(data) {
    const res = await apiFetch('/settings', { method: 'PUT', body: data });
    return res.success ? res.data : null;
  },
};

const VBPromo = {
  defaults: { active: false, eyebrow: 'Limited Offer', title: '', desc: '', code: '', codePct: '', ctaText: 'Shop Now', ctaLink: 'shop.html', countdownHours: 8 },
  async get() {
    const res = await apiFetch('/promo');
    return res.success ? res.data : this.defaults;
  },
  async save(promo) {
    const res = await apiFetch('/promo', { method: 'PUT', body: promo });
    return res.success ? res.data : null;
  },
};

/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
const VBToast = {
  show(msg, type = 'info', duration = 3000) {
    const emojis    = { success: '✅', error: '❌', warning: '⚠️', info: '💜' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast         = document.createElement('div');
    toast.className     = 'toast toast-' + type;
    toast.innerHTML     = '<span class="toast-icon">' + (emojis[type] || '💬') + '</span><span>' + msg + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },
};

/* ══════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════ */
const VBModal = {
  open(id)  { const el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; } },
  close(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } },
  confirm(msg, onYes) {
    const msgEl = document.getElementById('confirm-msg'), btn = document.getElementById('confirm-yes');
    if (msgEl) msgEl.textContent = msg;
    if (btn)   btn.onclick = () => { this.close('confirm-modal'); onYes(); };
    this.open('confirm-modal');
  },
};

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) { e.target.classList.remove('open'); document.body.style.overflow = ''; }
});

/* ══════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════ */
function initNav() {
  updateNavUser();
  VBCart.updateBadge();
  VBWish.updateBadge();
  const navbar = document.getElementById('navbar');
  if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));
  const ham = document.getElementById('nav-hamburger'), mob = document.getElementById('mobile-menu');
  if (ham && mob) ham.addEventListener('click', () => { ham.classList.toggle('open'); mob.classList.toggle('open'); });
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .navbar-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0].split('/').pop();
    if (href === path) a.classList.add('active');
  });
}

function updateNavUser() {
  const session    = VBAuth.session();
  const accountBtn = document.getElementById('account-btn');
  const dropdown   = document.getElementById('user-dropdown');

  if (!session) {
    if (accountBtn) {
      accountBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      accountBtn.onclick   = () => window.location.href = 'login.html';
      accountBtn.title     = 'Login';
    }
    if (dropdown) dropdown.innerHTML = '';
    return;
  }

  if (accountBtn) {
    const pill       = document.createElement('div');
    pill.className   = 'nav-user-pill';
    pill.id          = 'nav-user-pill';
    pill.innerHTML   = '<div class="nav-avatar" style="background:' + avatarBg(session.name) + '">' + session.name.charAt(0).toUpperCase() + '</div><span class="nav-user-name">' + session.name.split(' ')[0] + '</span>';
    pill.onclick     = toggleUserDropdown;
    accountBtn.parentNode.replaceChild(pill, accountBtn);
  }

  if (dropdown) {
    let dashLink = '';
    if (session.role === 'owner')         dashLink = '<a class="nav-dropdown-item" href="dashboard-owner.html">📊 Owner Dashboard</a>';
    else if (session.role === 'employee') dashLink = '<a class="nav-dropdown-item" href="dashboard-emp.html">📋 Employee Dashboard</a>';
    else                                  dashLink = '<a class="nav-dropdown-item" href="wishlist.html">💝 My Wishlist</a><a class="nav-dropdown-item" href="cart.html">🛍️ My Cart</a>';

    dropdown.innerHTML = '<div class="nav-dropdown-head"><div class="nav-dropdown-name">' + session.name + '</div><div class="nav-dropdown-email">' + session.email + '</div><div class="nav-dropdown-role">' + session.role + '</div></div>' + dashLink + '<div class="nav-dropdown-sep"></div><button class="nav-dropdown-item danger" onclick="logoutUser()">Logout</button>';
  }
}

function toggleUserDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('open');
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!e.target.closest('#user-dropdown') && !e.target.closest('#nav-user-pill') && !e.target.closest('#account-btn')) {
        if (dd) dd.classList.remove('open');
        document.removeEventListener('click', handler);
      }
    });
  }, 10);
}

function logoutUser() {
  VBAuth.logout();
  VBToast.show('Logged out. Goodbye!', 'info');
  setTimeout(() => window.location.href = 'index.html', 700);
}

/* ══════════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════════ */
const ICONS = {
  heart:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartFill: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  eye:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  plus:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
  cart:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
};

function vbCard(product, animDelay) {
  animDelay      = animDelay || 0;
  const id       = product._id || product.id;
  const inWish   = VBWish.has(id);
  const stars    = '&#9733;'.repeat(Math.round(product.rating || 0)) + '&#9734;'.repeat(5 - Math.round(product.rating || 0));
  const origHtml = product.originalPrice ? '<s class="pc-orig">Rs. ' + product.originalPrice.toLocaleString() + '</s>' : (product.origPrice ? '<s class="pc-orig">Rs. ' + product.origPrice.toLocaleString() + '</s>' : '');
  const badgeMap = { bestseller: 'badge-bestseller', sale: 'badge-sale', hot: 'badge-hot', new: 'badge-new' };
  const badge    = product.badge ? '<span class="pc-badge ' + (badgeMap[product.badge] || '') + '">' + product.badge + '</span>' : '';
  const imgSrc   = product.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600';

  return '<div class="product-card" style="animation-delay:' + animDelay + 's" data-id="' + id + '">' +
    '<div class="pc-img-wrap">' + badge +
    '<img src="' + imgSrc + '" alt="' + product.name + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600\'"/>' +
    '<div class="pc-hover-overlay">' +
    '<button class="pc-icon-btn' + (inWish ? ' wished' : '') + '" title="' + (inWish ? 'Remove from Wishlist' : 'Add to Wishlist') + '" onclick="vbToggleWish(\'' + id + '\',this)">' + (inWish ? ICONS.heartFill : ICONS.heart) + '</button>' +
    '<button class="pc-quick-add-btn" onclick="vbAddToCart(\'' + id + '\')">' + ICONS.cart + ' Add to Cart</button>' +
    '<a class="pc-icon-btn" title="View Details" href="product-detail.html?id=' + id + '">' + ICONS.eye + '</a>' +
    '</div></div>' +
    '<div class="pc-body">' +
    '<span class="pc-cat">' + product.category + '</span>' +
    '<a class="pc-name" href="product-detail.html?id=' + id + '">' + product.name + '</a>' +
    '<div class="pc-stars"><span>' + stars + '</span><span class="pc-rev">(' + (product.reviews || 0) + ')</span></div>' +
    '<div class="pc-footer"><div class="pc-price"><span class="pc-now">Rs. ' + product.price.toLocaleString() + '</span>' + origHtml + '</div>' +
    '<button class="pc-add-btn" onclick="vbAddToCart(\'' + id + '\')" title="Add to Cart">' + ICONS.plus + '</button>' +
    '</div></div></div>';
}

function vbToggleWish(id, btn) {
  const session = VBAuth.session();
  if (!session) {
    VBToast.show('Please login to save items to wishlist', 'warning');
    setTimeout(() => {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = 'login.html?return=' + encodeURIComponent(currentPage);
    }, 700);
    return;
  }
  const added = VBWish.toggle(id);
  document.querySelectorAll('[data-id="' + id + '"] .pc-icon-btn').forEach(b => {
    if (b.title && b.title.toLowerCase().includes('ishlist')) {
      b.innerHTML = VBWish.has(id) ? ICONS.heartFill : ICONS.heart;
      b.classList.toggle('wished', VBWish.has(id));
      b.title     = VBWish.has(id) ? 'Remove from Wishlist' : 'Add to Wishlist';
    }
  });
  VBToast.show(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
}

async function vbAddToCart(id) {
  const session = VBAuth.session();
  if (!session) {
    VBToast.show('Please login to add items to cart', 'warning');
    setTimeout(() => {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = 'login.html?return=' + encodeURIComponent(currentPage);
    }, 700);
    return;
  }
  /* Try cache first, then fetch from API */
  let p = VBProducts.getByIdSync(id);
  if (!p) p = await VBProducts.getById(id);
  if (!p) return;
  VBCart.add(p);
  VBToast.show(p.name + ' added to cart', 'success');
}

async function vbQuickView(id) {
  let p = VBProducts.getByIdSync(id);
  if (!p) p = await VBProducts.getById(id);
  if (!p) return;
  const pid   = p._id || p.id;
  const stars = '★'.repeat(Math.round(p.rating || 0)) + '☆'.repeat(5 - Math.round(p.rating || 0));
  const setEl = (elId, val) => { const e = document.getElementById(elId); if (e) e.textContent = val; };
  ['qv-name', 'qv-name2'].forEach(el => setEl(el, p.name));
  setEl('qv-cat',       p.category);
  setEl('qv-stars',     stars + ' (' + (p.reviews || 0) + ' reviews)');
  setEl('qv-desc',      p.description || p.desc || '');
  setEl('qv-price-now', 'Rs. ' + p.price.toLocaleString());
  setEl('qv-price-was', (p.originalPrice || p.origPrice) ? 'Rs. ' + (p.originalPrice || p.origPrice).toLocaleString() : '');
  const img    = document.getElementById('qv-img');    if (img)    { img.src = p.image || ''; img.alt = p.name; }
  const addBtn = document.getElementById('qv-add-btn'); if (addBtn) addBtn.onclick = () => { vbAddToCart(pid); VBModal.close('quickview-modal'); };
  const detBtn = document.getElementById('qv-detail-btn'); if (detBtn) detBtn.href = 'product-detail.html?id=' + pid;
  VBModal.open('quickview-modal');
}

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function fmtPrice(n)  { return 'Rs. ' + Number(n).toLocaleString(); }
function fmtDate(d)   { return new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }); }
function avatarBg(name) {
  const colors = ['#E91E8C', '#6B2D5E', '#C9956C', '#2D8A4E', '#2E6DA4', '#C9880A', '#C0392B'];
  let h = 0;
  for (let i = 0; i < (name || '?').length; i++) h = (h + (name || '?').charCodeAt(i)) % colors.length;
  return colors[h];
}
function starsHtml(rating)  { const r = Math.round(rating); return '★'.repeat(r) + '☆'.repeat(5 - r); }
function statusBadge(status) {
  const map = { processing: 's-processing', shipped: 's-shipped', delivered: 's-delivered', cancelled: 's-cancelled' };
  return '<span class="status-badge ' + (map[status] || '') + '"><span class="status-dot"></span>' + status + '</span>';
}
function typeBadge(type) {
  const map = { vip: 's-vip', regular: 's-regular', New: 's-new', new: 's-new' };
  return '<span class="status-badge ' + (map[type] || '') + '">' + type + '</span>';
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () { initNav(); });