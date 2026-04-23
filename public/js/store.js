/* ============================================================
   VELVET BEAUTY — store.js  (Central Brain v2)
   All localStorage, auth, cart, wishlist, orders, reviews,
   customers, analytics, helpers, navbar, toasts, modals
   ============================================================ */

const KEYS = {
  session:   'vb_session',
  products:  'vb_products',
  orders:    'vb_orders',
  customers: 'vb_customers',
  reviews:   'vb_reviews',
  cart:      'vb_cart',
  wishlist:  'vb_wishlist',
  users:     'vb_users',
  analytics: 'vb_analytics',
  settings:  'vb_settings',
  promo:     'vb_promo',
};

const DB = {
  get:    k     => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: k     => localStorage.removeItem(k),
};

function seedIfNeeded() {
  // Initialize empty collections if they don't exist yet
  if (!DB.get(KEYS.products))  DB.set(KEYS.products,  []);
  if (!DB.get(KEYS.customers)) DB.set(KEYS.customers, []);
  if (!DB.get(KEYS.orders))    DB.set(KEYS.orders,    []);
  if (!DB.get(KEYS.reviews))   DB.set(KEYS.reviews,   []);
  if (!DB.get(KEYS.analytics)) DB.set(KEYS.analytics, []);

  // Staff accounts — only set once
  if (!DB.get(KEYS.users)) {
    DB.set(KEYS.users, [
      { id:'u0', email:'owner@velvetbeauty.pk',    password:'owner123', role:'owner',    name:'Velvet Owner', phone:'' },
      { id:'u1', email:'employee@velvetbeauty.pk', password:'emp123',   role:'employee', name:'Staff Member', phone:'' },
    ]);
  }

  // Default settings — only set once
  if (!DB.get(KEYS.settings)) {
    DB.set(KEYS.settings, { empCode:'EMP2025', ownerCode:'OWNER2025', freeDeliveryMin:2000, deliveryFee:200 });
  }

  // Default promo — only set once
  if (!DB.get(KEYS.promo)) {
    DB.set(KEYS.promo, { active:false, eyebrow:'Limited Offer', title:'', desc:'', code:'', codePct:'', ctaText:'Shop Now', ctaLink:'shop.html', countdownHours:8 });
  }
}

/* AUTH */
const VBAuth = {
  login(email, password, role, accessCode) {
    const settings = DB.get(KEYS.settings) || { empCode:'EMP2025', ownerCode:'OWNER2025' };
    const users    = DB.get(KEYS.users) || [];
    if (role === 'employee' && accessCode !== settings.empCode)   return { ok:false, error:'Invalid employee access code.' };
    if (role === 'owner'    && accessCode !== settings.ownerCode) return { ok:false, error:'Invalid owner access code.' };
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!user) return { ok:false, error:'Invalid email or password.' };
    const session = { id:user.id, email:user.email, name:user.name, role:user.role };
    DB.set(KEYS.session, session);
    return { ok:true, session };
  },
  register(data) {
    const { firstName, lastName, email, phone, password } = data;
    const users = DB.get(KEYS.users) || [];
    if (users.find(u => u.email === email)) return { ok:false, error:'An account with this email already exists.' };
    const fullName = (firstName + ' ' + lastName).trim();
    const id = 'u' + Date.now();
    users.push({ id, email, password, role:'customer', name:fullName, phone:phone||'' });
    DB.set(KEYS.users, users);
    const customers = DB.get(KEYS.customers) || [];
    customers.push({ id:'c'+Date.now(), name:fullName, email, phone:phone||'', city:'', type:'new', totalOrders:0, totalSpent:0, joinDate:new Date().toISOString().slice(0,10) });
    DB.set(KEYS.customers, customers);
    const session = { id, email, name:fullName, role:'customer' };
    DB.set(KEYS.session, session);
    return { ok:true, session };
  },
  logout()  { DB.remove(KEYS.session); },
  session() { return DB.get(KEYS.session); },
  guard(allowedRoles) {
    const session = DB.get(KEYS.session);
    if (!session) {
      const isStaffOnly = allowedRoles && allowedRoles.every(r => r === 'owner' || r === 'employee');
      window.location.href = isStaffOnly ? 'dashboard-login.html' : 'login.html?return=' + encodeURIComponent(window.location.href);
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

/* PRODUCTS */
const VBProducts = {
  getAll()       { return DB.get(KEYS.products) || []; },
  getActive()    { return this.getAll().filter(p => p.active); },
  get()          { return this.getActive(); },
  getById(id)    { return this.getAll().find(p => p.id === id); },
  getByCat(cat)  { return this.getActive().filter(p => p.category.toLowerCase() === cat.toLowerCase()); },
  getBest()      { return this.getActive().filter(p => p.bestseller); },
  getNew()       { return this.getActive().filter(p => p.isNew); },
  search(q)      { const s = q.toLowerCase(); return this.getActive().filter(p => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)); },
  save(products) { DB.set(KEYS.products, products); },
  add(data)      { const products = this.getAll(); const newP = { id:'p'+Date.now(), ...data, reviews:0, active:true }; products.push(newP); this.save(products); return newP; },
  update(id, data) {
    const products = this.getAll(), i = products.findIndex(p => p.id === id);
    if (i < 0) return null;
    products[i] = { ...products[i], ...data };
    this.save(products);
    return products[i];
  },
  delete(id)       { this.save(this.getAll().filter(p => p.id !== id)); },
  toggleActive(id) { const p = this.getById(id); if (p) this.update(id, { active:!p.active }); },
};

/* CART */
const VBCart = {
  get()          { return DB.get(KEYS.cart) || []; },
  save(cart)     { DB.set(KEYS.cart, cart); this.updateBadge(); },
  count()        { return this.get().reduce((s,i) => s + i.qty, 0); },
  total()        { return this.get().reduce((s,i) => s + i.price * i.qty, 0); },
  add(product, qty=1) {
    const cart = this.get(), existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty += qty;
    else cart.push({ id:product.id, name:product.name, price:product.price, image:product.image, category:product.category, qty });
    this.save(cart);
  },
  remove(id)         { this.save(this.get().filter(i => i.id !== id)); },
  updateQty(id, qty) { if (qty < 1) { this.remove(id); return; } const cart = this.get(); const item = cart.find(i => i.id === id); if (item) { item.qty = qty; this.save(cart); } },
  clear()            { this.save([]); },
  totals(couponCode) {
    const subtotal = this.total();
    const settings = DB.get(KEYS.settings) || { freeDeliveryMin:2000, deliveryFee:200 };
    const coupons  = { VELVET10:0.10, BEAUTY20:0.20, VIP30:0.30, FIRST15:0.15 };
    const discRate = couponCode ? (coupons[couponCode.toUpperCase()] || 0) : 0;
    const discount = Math.round(subtotal * discRate);
    const afterDisc = subtotal - discount;
    const deliveryFee = afterDisc >= settings.freeDeliveryMin ? 0 : settings.deliveryFee;
    return { subtotal, discount, deliveryFee, total:afterDisc + deliveryFee, discRate };
  },
  updateBadge() {
    const count = this.count();
    document.querySelectorAll('#cart-count').forEach(el => { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; });
  },
};

/* WISHLIST */
const VBWish = {
  get()       { return DB.get(KEYS.wishlist) || []; },
  save(list)  { DB.set(KEYS.wishlist, list); this.updateBadge(); },
  has(id)     { return this.get().includes(id); },
  count()     { return this.get().length; },
  toggle(id)  { const list = this.get(), i = list.indexOf(id); if (i >= 0) list.splice(i,1); else list.push(id); this.save(list); return i < 0; },
  remove(id)  { this.save(this.get().filter(i => i !== id)); },
  moveAll()   { this.get().forEach(id => { const p = VBProducts.getById(id); if (p) VBCart.add(p,1); }); this.save([]); },
  updateBadge() {
    const count = this.count();
    document.querySelectorAll('#wishlist-count').forEach(el => { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; });
  },
};

/* ORDERS */
const VBOrders = {
  getAll()     { return DB.get(KEYS.orders) || []; },
  getById(id)  { return this.getAll().find(o => o.id === id); },
  save(orders) { DB.set(KEYS.orders, orders); },
  place(orderData) {
    const orders = this.getAll();
    const id = 'VB-' + (10000 + orders.length + 1);
    const order = { id, date:new Date().toISOString().slice(0,10), status:'processing', ...orderData };
    orders.unshift(order); this.save(orders);
    const session = VBAuth.session();
    if (session && session.role === 'customer') {
      const customers = DB.get(KEYS.customers) || [];
      const c = customers.find(c => c.email === session.email);
      if (c) { c.totalOrders = (c.totalOrders||0)+1; c.totalSpent = (c.totalSpent||0)+order.total; if (c.totalSpent > 8000) c.type='vip'; else if (c.totalOrders > 1) c.type='regular'; DB.set(KEYS.customers, customers); }
    }
    return order;
  },
  updateStatus(id, status) { const orders = this.getAll(); const o = orders.find(o => o.id === id); if (o) { o.status = status; this.save(orders); } },
  delete(id) { this.save(this.getAll().filter(o => o.id !== id)); },
};

/* REVIEWS */
const VBReviews = {
  getAll()          { return DB.get(KEYS.reviews) || []; },
  getByProduct(pid) { return this.getAll().filter(r => r.productId === pid); },
  save(reviews)     { DB.set(KEYS.reviews, reviews); },
  add(data) {
    const reviews = this.getAll();
    const review  = { id:'r'+Date.now(), date:new Date().toISOString().slice(0,10), helpful:0, ...data };
    reviews.unshift(review); this.save(reviews);
    const prodRevs = this.getByProduct(data.productId);
    if (prodRevs.length) { const avg = prodRevs.reduce((s,r) => s+r.rating, 0)/prodRevs.length; VBProducts.update(data.productId, { rating:Math.round(avg*10)/10, reviews:prodRevs.length }); }
    return review;
  },
  delete(id)  { this.save(this.getAll().filter(r => r.id !== id)); },
  helpful(id) { const reviews = this.getAll(); const r = reviews.find(r => r.id === id); if (r) { r.helpful=(r.helpful||0)+1; this.save(reviews); } },
};

/* CUSTOMERS */
const VBCustomers = {
  getAll()         { return DB.get(KEYS.customers) || []; },
  getById(id)      { return this.getAll().find(c => c.id === id); },
  save(customers)  { DB.set(KEYS.customers, customers); },
  add(data)        { const list = this.getAll(); list.push({ id:'c'+Date.now(), ...data }); this.save(list); },
  update(id, data) { const list = this.getAll(), i = list.findIndex(c => c.id === id); if (i >= 0) { list[i] = { ...list[i], ...data }; this.save(list); } },
  delete(id)       { this.save(this.getAll().filter(c => c.id !== id)); },
};

/* STAFF USERS */
const VBUsers = {
  getAll()             { return (DB.get(KEYS.users)||[]).filter(u => u.role !== 'customer'); },
  getAllWithCustomers() { return DB.get(KEYS.users) || []; },
  getById(id)          { return (DB.get(KEYS.users)||[]).find(u => u.id === id); },
  save(users)          { DB.set(KEYS.users, users); },
  add(data) {
    const all = DB.get(KEYS.users) || [];
    if (all.find(u => u.email === data.email)) return { ok:false, error:'Email already exists.' };
    const user = { id:'u'+Date.now(), createdAt:new Date().toISOString().slice(0,10), ...data };
    all.push(user); this.save(all); return { ok:true, user };
  },
  update(id, data) {
    const all = DB.get(KEYS.users) || [], i = all.findIndex(u => u.id === id);
    if (i < 0) return;
    if (data.email && all.find(u => u.email === data.email && u.id !== id)) return;
    all[i] = { ...all[i], ...data }; this.save(all);
    const session = DB.get(KEYS.session);
    if (session && session.id === id) DB.set(KEYS.session, { ...session, name:all[i].name, email:all[i].email });
  },
  delete(id) {
    const all = DB.get(KEYS.users) || [], owners = all.filter(u => u.role === 'owner'), target = all.find(u => u.id === id);
    if (target && target.role === 'owner' && owners.length <= 1) return { ok:false, error:'Cannot delete the only owner.' };
    this.save(all.filter(u => u.id !== id)); return { ok:true };
  },
};

/* PROMO */
const VBPromo = {
  defaults: { active:true, eyebrow:'Lightning Limited Offer', title:'Up to 40% Off', desc:"Our biggest beauty sale.", code:'BEAUTY20', codePct:'20', ctaText:'Shop Sale Now', ctaLink:'shop.html?sale=true', countdownHours:8 },
  get()       { return DB.get(KEYS.promo) || this.defaults; },
  save(promo) { DB.set(KEYS.promo, promo); },
};

/* ANALYTICS */
const VBAnalytics = {
  get() {
    const orders = VBOrders.getAll().filter(o => o.status !== 'cancelled');
    const customers = VBCustomers.getAll();
    const monthMap = {};
    orders.forEach(o => {
      if (!o.date) return;
      const d = new Date(o.date);
      const key = d.toLocaleString('en-PK', { month:'short', year:'numeric' });
      if (!monthMap[key]) monthMap[key] = { month:key, revenue:0, orders:0, newCustomers:0, avgOrder:0, _ts:d.getTime() };
      monthMap[key].revenue += (o.total||0);
      monthMap[key].orders  += 1;
    });
    customers.forEach(c => {
      if (!c.joinDate) return;
      const d = new Date(c.joinDate);
      const key = d.toLocaleString('en-PK', { month:'short', year:'numeric' });
      if (monthMap[key]) monthMap[key].newCustomers += 1;
    });
    const result = Object.values(monthMap).sort((a,b) => a._ts - b._ts).map(m => ({ ...m, avgOrder:m.orders ? Math.round(m.revenue/m.orders) : 0 }));
    if (!result.length) return DB.get(KEYS.analytics) || [];
    return result;
  },
  summary() {
    const orders = VBOrders.getAll().filter(o => o.status !== 'cancelled');
    const totalRev = orders.reduce((s,o) => s+(o.total||0), 0);
    const reviews = VBReviews.getAll();
    const avgRating = reviews.length ? (reviews.reduce((s,r) => s+r.rating, 0)/reviews.length).toFixed(1) : '0.0';
    const data = this.get();
    return { totalRev, totalOrders:orders.length, avgMonthly:data.length ? Math.round(totalRev/data.length) : 0, avgRating };
  },
};

/* TOAST */
const VBToast = {
  show(msg, type='info', duration=3000) {
    const icons = { success:'checkmark', error:'error', warning:'warning', info:'info' };
    const emojis = { success:'✅', error:'❌', warning:'⚠️', info:'💜' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (emojis[type]||'💬') + '</span><span>' + msg + '</span>';
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('hiding'); toast.addEventListener('animationend', () => toast.remove()); }, duration);
  },
};

/* MODAL */
const VBModal = {
  open(id)  { const el = document.getElementById(id); if(el){ el.classList.add('open'); document.body.style.overflow='hidden'; } },
  close(id) { const el = document.getElementById(id); if(el){ el.classList.remove('open'); document.body.style.overflow=''; } },
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

/* NAVBAR */
function initNav() {
  seedIfNeeded();
  updateNavUser();
  VBCart.updateBadge();
  VBWish.updateBadge();
  const navbar = document.getElementById('navbar');
  if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));
  const ham = document.getElementById('nav-hamburger'), mob = document.getElementById('mobile-menu');
  if (ham && mob) ham.addEventListener('click', () => { ham.classList.toggle('open'); mob.classList.toggle('open'); });
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .navbar-links a').forEach(a => {
    const href = (a.getAttribute('href')||'').split('?')[0].split('/').pop();
    if (href === path) a.classList.add('active');
  });
}

function updateNavUser() {
  const session = VBAuth.session();
  const accountBtn = document.getElementById('account-btn');
  const dropdown   = document.getElementById('user-dropdown');

  if (!session) {
    if (accountBtn) {
      accountBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      accountBtn.onclick = () => window.location.href = 'login.html';
      accountBtn.title = 'Login';
    }
    if (dropdown) dropdown.innerHTML = '';
    return;
  }

  if (accountBtn) {
    const pill = document.createElement('div');
    pill.className = 'nav-user-pill';
    pill.id = 'nav-user-pill';
    pill.innerHTML = '<div class="nav-avatar" style="background:' + avatarBg(session.name) + '">' + session.name.charAt(0).toUpperCase() + '</div><span class="nav-user-name">' + session.name.split(' ')[0] + '</span>';
    pill.onclick = toggleUserDropdown;
    accountBtn.parentNode.replaceChild(pill, accountBtn);
  }

  if (dropdown) {
    let dashLink = '';
    if (session.role === 'owner') {
      dashLink = '<a class="nav-dropdown-item" href="dashboard-owner.html">📊 Owner Dashboard</a>';
    } else if (session.role === 'employee') {
      dashLink = '<a class="nav-dropdown-item" href="dashboard-emp.html">📋 Employee Dashboard</a>';
    } else {
      // customer links
      dashLink = '<a class="nav-dropdown-item" href="wishlist.html">💝 My Wishlist</a><a class="nav-dropdown-item" href="cart.html">🛍️ My Cart</a>';
    }

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

/* PRODUCT CARD */
const ICONS = {
  heart:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartFill: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  eye:       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  plus:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
  cart:      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
};

function vbCard(product, animDelay) {
  animDelay = animDelay || 0;
  const inWish   = VBWish.has(product.id);
  const stars    = '&#9733;'.repeat(Math.round(product.rating)) + '&#9734;'.repeat(5 - Math.round(product.rating));
  const origHtml = product.origPrice ? '<s class="pc-orig">Rs. ' + product.origPrice.toLocaleString() + '</s>' : '';
  const badgeMap = { bestseller:'badge-bestseller', sale:'badge-sale', hot:'badge-hot', new:'badge-new' };
  const badge    = product.badge ? '<span class="pc-badge ' + (badgeMap[product.badge]||'') + '">' + product.badge + '</span>' : '';
  return '<div class="product-card" style="animation-delay:' + animDelay + 's" data-id="' + product.id + '">' +
    '<div class="pc-img-wrap">' + badge +
    '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600\'"/>' +
    '<div class="pc-hover-overlay">' +
    '<button class="pc-icon-btn' + (inWish?' wished':'') + '" title="' + (inWish?'Remove from Wishlist':'Add to Wishlist') + '" onclick="vbToggleWish(\'' + product.id + '\',this)">' + (inWish?ICONS.heartFill:ICONS.heart) + '</button>' +
    '<button class="pc-quick-add-btn" onclick="vbAddToCart(\'' + product.id + '\')">' + ICONS.cart + ' Add to Cart</button>' +
    '<a class="pc-icon-btn" title="View Details" href="product-detail.html?id=' + product.id + '">' + ICONS.eye + '</a>' +
    '</div></div>' +
    '<div class="pc-body">' +
    '<span class="pc-cat">' + product.category + '</span>' +
    '<a class="pc-name" href="product-detail.html?id=' + product.id + '">' + product.name + '</a>' +
    '<div class="pc-stars"><span>' + stars + '</span><span class="pc-rev">(' + (product.reviews||0) + ')</span></div>' +
    '<div class="pc-footer"><div class="pc-price"><span class="pc-now">Rs. ' + product.price.toLocaleString() + '</span>' + origHtml + '</div>' +
    '<button class="pc-add-btn" onclick="vbAddToCart(\'' + product.id + '\')" title="Add to Cart">' + ICONS.plus + '</button>' +
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
      b.title = VBWish.has(id) ? 'Remove from Wishlist' : 'Add to Wishlist';
    }
  });
  VBToast.show(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
}

function vbAddToCart(id) {
  const session = VBAuth.session();
  if (!session) {
    VBToast.show('Please login to add items to cart', 'warning');
    setTimeout(() => {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = 'login.html?return=' + encodeURIComponent(currentPage);
    }, 700);
    return;
  }
  const p = VBProducts.getById(id);
  if (!p) return;
  VBCart.add(p);
  VBToast.show(p.name + ' added to cart', 'success');
}

function vbQuickView(id) {
  const p = VBProducts.getById(id);
  if (!p) return;
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  const setEl = (elId, val) => { const e = document.getElementById(elId); if(e) e.textContent = val; };
  ['qv-name','qv-name2'].forEach(el => setEl(el, p.name));
  setEl('qv-cat', p.category);
  setEl('qv-stars', stars + ' (' + (p.reviews||0) + ' reviews)');
  setEl('qv-desc', p.desc || '');
  setEl('qv-price-now', 'Rs. ' + p.price.toLocaleString());
  setEl('qv-price-was', p.origPrice ? 'Rs. ' + p.origPrice.toLocaleString() : '');
  const img = document.getElementById('qv-img'); if(img){ img.src=p.image; img.alt=p.name; }
  const addBtn = document.getElementById('qv-add-btn'); if(addBtn) addBtn.onclick = () => { vbAddToCart(id); VBModal.close('quickview-modal'); };
  const detBtn = document.getElementById('qv-detail-btn'); if(detBtn) detBtn.href = 'product-detail.html?id=' + id;
  VBModal.open('quickview-modal');
}

/* HELPERS */
function fmtPrice(n)  { return 'Rs. ' + Number(n).toLocaleString(); }
function fmtDate(d)   { return new Date(d).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' }); }
function avatarBg(name) {
  const colors = ['#E91E8C','#6B2D5E','#C9956C','#2D8A4E','#2E6DA4','#C9880A','#C0392B'];
  let h = 0;
  for (let i = 0; i < (name||'?').length; i++) h = (h + (name||'?').charCodeAt(i)) % colors.length;
  return colors[h];
}
function starsHtml(rating) { const r = Math.round(rating); return '★'.repeat(r) + '☆'.repeat(5-r); }
function statusBadge(status) {
  const map = { processing:'s-processing', shipped:'s-shipped', delivered:'s-delivered', cancelled:'s-cancelled' };
  return '<span class="status-badge ' + (map[status]||'') + '"><span class="status-dot"></span>' + status + '</span>';
}
function typeBadge(type) {
  const map = { vip:'s-vip', regular:'s-regular', new:'s-new' };
  return '<span class="status-badge ' + (map[type]||'') + '">' + type + '</span>';
}

/* INIT */
seedIfNeeded();
document.addEventListener('DOMContentLoaded', function() { initNav(); });
