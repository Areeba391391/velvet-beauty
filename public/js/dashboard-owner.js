/* ============================================================
   VELVET BEAUTY — dashboard-owner.js (MongoDB API version)
   Owner Dashboard: Overview · Orders · Products
   Customers · Reviews · Analytics · Settings
   ============================================================ */

let currentOrderId    = null;
let currentCustomerId = null;
let currentProductId  = null;
let activeSection     = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  const session = VBAuth.guard(['owner']);
  if (!session) return;

  document.getElementById('sb-name').textContent     = session.name;
  document.getElementById('sb-avatar').textContent   = session.name.charAt(0).toUpperCase();
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' });

  showSection('overview', null);
  setPendingBadge();
});

// ── Section switching ─────────────────────────────────────────
async function showSection(name, btn) {
  activeSection = name;
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sectionEl = document.getElementById('section-' + name);
  if (sectionEl) sectionEl.classList.add('active');
  if (btn) btn.classList.add('active');
  else { const linkEl = document.querySelector(`.sidebar-link[data-section="${name}"]`); if (linkEl) linkEl.classList.add('active'); }
  const titles = { overview: 'Overview', orders: 'Orders', products: 'Products', customers: 'Customers', users: 'Staff Users', reviews: 'Reviews', analytics: 'Analytics', settings: 'Settings' };
  document.getElementById('topbar-title').textContent = titles[name] || name;

  if (name === 'overview')  await renderOverview();
  if (name === 'orders')    await renderOrders();
  if (name === 'products')  await renderProducts();
  if (name === 'customers') await renderCustomers();
  if (name === 'reviews')   await renderReviews();
  if (name === 'analytics') await renderAnalytics();
  if (name === 'settings')  await loadPromoForm();
}

async function setPendingBadge() {
  const orders  = await VBOrders.getAll({ status: 'processing' });
  const pending = orders.length;
  const badgeEl = document.getElementById('sb-pending-count');
  if (badgeEl) { badgeEl.textContent = pending; badgeEl.style.display = pending ? '' : 'none'; }
}

function openSidebar()  { document.getElementById('dash-sidebar').classList.add('open'); document.getElementById('sidebar-overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('dash-sidebar').classList.remove('open'); document.getElementById('sidebar-overlay').classList.remove('show'); }
function doLogout()     { VBAuth.logout(); window.location.href = 'login.html'; }

// ── OVERVIEW ─────────────────────────────────────────────────
async function renderOverview() {
  const [orders, customers, products, summary] = await Promise.all([
    VBOrders.getAll(),
    VBCustomers.getAll(),
    VBProducts.fetchAll(),
    VBAnalytics.summary(),
  ]);
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('stat-revenue',        'Rs. ' + revenue.toLocaleString());
  setTxt('stat-orders',         orders.length);
  setTxt('stat-customers',      customers.length);
  setTxt('stat-products-count', products.filter(p => p.isActive !== false).length);

  // Bar chart
  const analytics = await VBAnalytics.get();
  const maxRev    = Math.max(...analytics.map(m => m.revenue || 0), 1);
  const chartEl   = document.getElementById('overview-chart');
  if (chartEl) {
    chartEl.innerHTML = analytics.map(m => {
      const h = Math.round(((m.revenue || 0) / maxRev) * 160);
      return `<div class="chart-bar-col">
        <div class="chart-bar" style="height:${h}px;">
          <div class="chart-bar-tooltip">Rs. ${(m.revenue || 0).toLocaleString()}</div>
        </div>
        <span class="chart-bar-label">${(m.month || '').split(' ')[0]}</span>
      </div>`;
    }).join('');
  }

  // Category summary
  const catEl    = document.getElementById('cat-summary');
  const cats     = ['Lips', 'Face', 'Eyes', 'Cheeks', 'Skincare'];
  const catColors = { Lips: '#E91E8C', Face: '#C9956C', Eyes: '#6B2D5E', Cheeks: '#C2185B', Skincare: '#2D8A4E' };
  if (catEl) {
    catEl.innerHTML = cats.map(cat => {
      const count = products.filter(p => p.category === cat).length;
      return `<div class="anal-row">
        <div class="anal-dot" style="background:${catColors[cat]}"></div>
        <span class="anal-label">${cat}</span>
        <span class="anal-val">${count} products</span>
      </div>`;
    }).join('');
  }

  // Recent orders (last 5)
  const tbody = document.getElementById('recent-orders-body');
  if (tbody) {
    tbody.innerHTML = orders.slice(0, 5).map(o => `
      <tr>
        <td><b>${o.orderNumber || o._id}</b></td>
        <td>${o.customerName}</td>
        <td>${fmtPrice(o.total)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.createdAt)}</td>
      </tr>`).join('');
  }
}

// ── ORDERS ───────────────────────────────────────────────────
async function renderOrders() {
  const q  = (document.getElementById('orders-search')?.value || '').toLowerCase();
  const st = document.getElementById('orders-status-filter')?.value || '';
  const params = {};
  if (st) params.status = st;
  let orders = await VBOrders.getAll(params);
  if (q) orders = orders.filter(o => (o.orderNumber || o._id).toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));

  const tbody = document.getElementById('orders-body');
  if (!tbody) return;
  if (!orders.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--g400);">No orders found</td></tr>`; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><b>${o.orderNumber || o._id}</b></td>
      <td>${o.customerName}</td>
      <td>${o.items?.length || 0} items</td>
      <td>${fmtPrice(o.total)}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${fmtDate(o.createdAt)}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn tbl-view" onclick="openOrderModal('${o._id}')">View</button>
      </div></td>
    </tr>`).join('');
}

async function openOrderModal(id) {
  currentOrderId = id;
  const o = await VBOrders.getById(id);
  if (!o) return;
  document.getElementById('om-title').textContent      = `Order ${o.orderNumber || o._id}`;
  document.getElementById('om-status-select').value   = o.status;

  const items = (o.items || []).map(i => `
    <div style="display:flex;gap:0.75rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--g100);">
      <div style="flex:1;"><div style="font-weight:600;font-size:0.85rem;">${i.productName || i.name || ''}</div><div style="font-size:0.72rem;color:var(--g400);">Qty: ${i.quantity || i.qty || 1}</div></div>
      <div style="font-weight:600;color:var(--pink);">${fmtPrice((i.price || 0) * (i.quantity || i.qty || 1))}</div>
    </div>`).join('');

  document.getElementById('om-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Customer</div><div style="font-weight:600;">${o.customerName}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Date</div><div>${fmtDate(o.createdAt)}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">City</div><div>${o.city || '—'}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Payment</div><div style="text-transform:capitalize;">${o.paymentMethod || '—'}</div></div>
      <div style="grid-column:1/-1;"><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Address</div><div>${o.address || '—'}</div></div>
    </div>
    <div style="margin-bottom:1rem;">${items}</div>
    <div style="display:flex;justify-content:space-between;padding:.75rem 0;border-top:2px solid var(--g100);margin-top:.5rem;">
      <span style="font-family:var(--font-display);font-size:1.1rem;color:var(--plum-dark);">Total</span>
      <span style="font-family:var(--font-display);font-size:1.3rem;color:var(--pink);font-weight:500;">${fmtPrice(o.total)}</span>
    </div>`;

  VBModal.open('order-modal');
}

async function updateOrderStatus() {
  const status = document.getElementById('om-status-select').value;
  await VBOrders.updateStatus(currentOrderId, status);
  VBToast.show('Order status updated', 'success');
  VBModal.close('order-modal');
  await renderOrders();
  await setPendingBadge();
}

async function deleteOrder() {
  VBModal.close('order-modal');
  VBModal.confirm('Delete this order permanently?', async () => {
    await VBOrders.delete(currentOrderId);
    VBToast.show('Order deleted', 'success');
    await renderOrders();
    await setPendingBadge();
  });
}

// ── PRODUCTS ─────────────────────────────────────────────────
async function renderProducts() {
  const q   = (document.getElementById('products-search')?.value || '').toLowerCase();
  const cat = document.getElementById('products-cat-filter')?.value || '';
  const params = {};
  if (cat) params.category = cat;
  let products = await VBProducts.fetchAll(params);
  /* Deduplicate by _id to prevent double rendering */
  const _seen = new Set();
  products = products.filter(p => { const pid = p._id || p.id; if (_seen.has(pid)) return false; _seen.add(pid); return true; });
  if (q) products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

  const tbody = document.getElementById('products-body');
  if (!tbody) return;
  if (!products.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--g400);">No products found</td></tr>`; return; }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="tbl-product-cell">
          <div class="tbl-product-img"><img src="${p.image || ''}" alt="${p.name}" onerror="this.src='https://placehold.co/44x44/FDE8F3/E91E8C?text=VB'"/></div>
          <div><div class="tbl-product-name">${p.name}</div><div class="tbl-product-cat">${p.badge || ''}</div></div>
        </div>
      </td>
      <td>${p.category}</td>
      <td>${fmtPrice(p.price)}</td>
      <td>${p.stock || 0}</td>
      <td>⭐ ${p.rating || 0}</td>
      <td><span class="status-badge ${p.isActive !== false ? 's-delivered' : 's-cancelled'}">${p.isActive !== false ? 'Active' : 'Hidden'}</span></td>
      <td><div class="tbl-actions">
        <button class="tbl-btn tbl-edit"   onclick="openProductModal('${p._id}')">Edit</button>
        <button class="tbl-btn tbl-delete" onclick="deleteProduct('${p._id}')">Delete</button>
      </div></td>
    </tr>`).join('');
}

async function openProductModal(id) {
  currentProductId = id;
  const pm = id ? await VBProducts.getById(id) : null;
  document.getElementById('pm-title').textContent       = pm ? 'Edit Product' : 'Add Product';
  document.getElementById('pm-id').value                = pm?._id || '';
  document.getElementById('pm-name').value              = pm?.name || '';
  document.getElementById('pm-cat').value               = pm?.category || 'Lips';
  document.getElementById('pm-badge').value             = pm?.badge || '';
  document.getElementById('pm-price').value             = pm?.price || '';
  document.getElementById('pm-orig-price').value        = pm?.originalPrice || pm?.origPrice || '';
  document.getElementById('pm-stock').value             = pm?.stock || '';
  document.getElementById('pm-rating').value            = pm?.rating || '';
  document.getElementById('pm-active').checked          = pm ? pm.isActive !== false : true;
  document.getElementById('pm-bestseller').checked      = !!(pm?.badge === 'bestseller' || pm?.sold > 0);
  document.getElementById('pm-image').value             = pm?.image || '';
  document.getElementById('pm-desc').value              = pm?.description || pm?.desc || '';
  document.getElementById('pm-shades').value            = pm?.shades?.join(', ') || (pm?.shade ? pm.shade : '');
  previewProductImg(pm?.image || '');
  VBModal.open('product-modal');
}

function previewProductImg(url) {
  const img         = document.getElementById('pm-img-preview');
  const placeholder = document.getElementById('pm-img-placeholder');
  if (url && img) {
    img.src = url; img.classList.remove('hidden');
    if (placeholder) placeholder.style.display = 'none';
    img.onerror = () => { img.classList.add('hidden'); if (placeholder) placeholder.style.display = ''; };
  } else {
    if (img) img.classList.add('hidden');
    if (placeholder) placeholder.style.display = '';
  }
}

async function saveProduct() {
  const id        = document.getElementById('pm-id').value;
  const shadesRaw = document.getElementById('pm-shades').value.trim();
  const data = {
    name:          document.getElementById('pm-name').value.trim(),
    category:      document.getElementById('pm-cat').value,
    badge:         document.getElementById('pm-badge').value,
    price:         parseFloat(document.getElementById('pm-price').value) || 0,
    originalPrice: parseFloat(document.getElementById('pm-orig-price').value) || null,
    stock:         parseInt(document.getElementById('pm-stock').value) || 0,
    rating:        parseFloat(document.getElementById('pm-rating').value) || 0,
    isActive:      document.getElementById('pm-active').checked,
    isNew:         document.getElementById('pm-badge').value === 'new',
    image:         document.getElementById('pm-image').value.trim(),
    description:   document.getElementById('pm-desc').value.trim(),
    shades:        shadesRaw ? shadesRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
  };
  if (!data.name)  { VBToast.show('Product name is required', 'warning'); return; }
  if (!data.price) { VBToast.show('Price is required', 'warning'); return; }

  /* ── Duplicate name check (only for NEW products) ── */
  if (!id) {
    const existing = await VBProducts.fetchAll();
    const isDuplicate = existing.some(p => p.name.trim().toLowerCase() === data.name.toLowerCase());
    if (isDuplicate) {
      VBToast.show('❌ Product "' + data.name + '" already exists! Please use a different name.', 'error', 4000);
      return;
    }
  }

  if (id) await VBProducts.update(id, data);
  else    await VBProducts.add(data);

  VBToast.show(id ? 'Product updated ✅' : 'Product added ✅', 'success');
  VBModal.close('product-modal');
  await renderProducts();
}

async function deleteProduct(id) {
  VBModal.confirm('Delete this product permanently?', async () => {
    await VBProducts.delete(id);
    VBToast.show('Product deleted', 'success');
    await renderProducts();
  });
}

// ── CUSTOMERS ────────────────────────────────────────────────
async function renderCustomers() {
  const q  = (document.getElementById('customers-search')?.value || '').toLowerCase();
  const tp = document.getElementById('customers-type-filter')?.value || '';
  const params = {};
  if (tp) params.status = tp;
  let customers = await VBCustomers.getAll(params);
  if (q) customers = customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q));

  const tbody = document.getElementById('customers-body');
  if (!tbody) return;
  if (!customers.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--g400);">No customers found</td></tr>`; return; }
  tbody.innerHTML = customers.map(c => `
    <tr>
      <td>
        <div class="tbl-customer-cell">
          <div class="tbl-cust-avatar" style="background:${avatarBg(c.name)}">${c.name.charAt(0)}</div>
          <div><div class="tbl-cust-name">${c.name}</div><div class="tbl-cust-email">${c.email}</div></div>
        </div>
      </td>
      <td>${c.phone || '—'}</td>
      <td>${c.city || '—'}</td>
      <td>${c.totalOrders || 0}</td>
      <td>${fmtPrice(c.totalSpent || 0)}</td>
      <td>${typeBadge(c.status || 'New')}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn tbl-view" onclick="openCustomerModal('${c._id}')">View</button>
      </div></td>
    </tr>`).join('');
}

async function openCustomerModal(id) {
  currentCustomerId = id;
  const c = await VBCustomers.getById(id);
  if (!c) return;
  document.getElementById('cm-title').textContent      = c.name;
  document.getElementById('cm-type-select').value      = c.status || 'New';
  const orders = await VBOrders.getAll();
  const custOrders = orders.filter(o => o.customerName === c.name || String(o.customer) === String(c._id));
  document.getElementById('cm-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Email</div><div>${c.email}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Phone</div><div>${c.phone || '—'}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">City</div><div>${c.city || '—'}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Joined</div><div>${fmtDate(c.joinDate)}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Total Orders</div><div>${c.totalOrders || 0}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Total Spent</div><div style="color:var(--pink);font-weight:600;">${fmtPrice(c.totalSpent || 0)}</div></div>
    </div>
    ${custOrders.length ? `<div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:.5rem;">Recent Orders</div>
      ${custOrders.slice(0, 3).map(o => `<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--g100);font-size:.85rem;"><span>${o.orderNumber || o._id}</span>${statusBadge(o.status)}<span>${fmtPrice(o.total)}</span></div>`).join('')}` : ''}`;
  VBModal.open('customer-modal');
}

// ── REVIEWS ──────────────────────────────────────────────────
async function renderReviews() {
  const q  = (document.getElementById('reviews-search')?.value || '').toLowerCase();
  const rt = document.getElementById('reviews-rating-filter')?.value || '';
  let reviews = await VBReviews.getAll();
  if (q)  reviews = reviews.filter(r => r.customerName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q));
  if (rt) reviews = reviews.filter(r => r.rating === parseInt(rt));

  const tbody = document.getElementById('reviews-body');
  if (!tbody) return;
  if (!reviews.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--g400);">No reviews found</td></tr>`; return; }
  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td>
        <div class="tbl-customer-cell">
          <div class="tbl-cust-avatar" style="background:${avatarBg(r.customerName)}">${r.customerName.charAt(0)}</div>
          <div class="tbl-cust-name">${r.customerName}</div>
        </div>
      </td>
      <td><span style="font-size:0.82rem;">${r.productName || '—'}</span></td>
      <td><span style="color:#F5C518;">${'★'.repeat(r.rating)}</span></td>
      <td style="max-width:260px;"><div style="font-size:0.82rem;color:var(--g600);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.text}</div></td>
      <td>${fmtDate(r.createdAt)}</td>
      <td><button class="tbl-btn tbl-delete" onclick="deleteReview('${r._id}')">Delete</button></td>
    </tr>`).join('');
}

async function deleteReview(id) {
  VBModal.confirm('Delete this review?', async () => {
    await VBReviews.delete(id);
    VBToast.show('Review deleted', 'success');
    await renderReviews();
  });
}

// ── ANALYTICS ────────────────────────────────────────────────
async function renderAnalytics() {
  const [data, summary] = await Promise.all([VBAnalytics.get(), VBAnalytics.summary()]);

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('anal-total-rev',    'Rs. ' + (summary.totalRevenue || 0).toLocaleString());
  setTxt('anal-total-orders', summary.totalOrders || 0);
  setTxt('anal-avg-monthly',  'Rs. ' + (summary.avgOrderValue || 0).toLocaleString());

  const tbody = document.getElementById('analytics-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(m => `
    <tr>
      <td><b>${m.month}</b></td>
      <td style="color:var(--pink);font-weight:600;">Rs. ${(m.revenue || 0).toLocaleString()}</td>
      <td>${m.orders || 0}</td>
      <td>${m.newCustomers || 0}</td>
      <td>Rs. ${(m.avgOrderValue || 0).toLocaleString()}</td>
    </tr>`).join('');
}

// ── SETTINGS + PROMO ─────────────────────────────────────────
async function loadPromoForm() {
  const [settings, promo] = await Promise.all([VBSettings.get(), VBPromo.get()]);

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('set-emp-code',      settings.empCode);
  setVal('set-owner-code',    settings.ownerCode);
  setVal('set-free-delivery', settings.freeDeliveryMin);
  setVal('set-delivery-fee',  settings.deliveryFee);

  const toggle = document.getElementById('promo-active-toggle');
  const label  = document.getElementById('promo-active-label');
  if (toggle) toggle.checked = !!promo.active;
  if (label)  label.textContent = promo.active ? 'Active' : 'Inactive';

  setVal('promo-eyebrow-inp', promo.eyebrow);
  setVal('promo-title-inp',   promo.title);
  setVal('promo-desc-inp',    promo.desc);
  setVal('promo-code-inp',    promo.code);
  setVal('promo-codepct-inp', promo.codePct);
  setVal('promo-ctatext-inp', promo.ctaText);
  setVal('promo-ctalink-inp', promo.ctaLink);
  setVal('promo-hours-inp',   promo.countdownHours || 8);
}

async function saveSettings() {
  const settings = {
    empCode:         document.getElementById('set-emp-code').value.trim(),
    ownerCode:       document.getElementById('set-owner-code').value.trim(),
    freeDeliveryMin: parseInt(document.getElementById('set-free-delivery').value) || 2000,
    deliveryFee:     parseInt(document.getElementById('set-delivery-fee').value) || 200,
  };
  if (!settings.empCode || !settings.ownerCode) { VBToast.show('Access codes cannot be empty', 'warning'); return; }
  await VBSettings.save(settings);
  VBToast.show('Settings saved ✅', 'success');
}

function togglePwOwner(inputId, btn) {
  const input = document.getElementById(inputId); if (!input) return;
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

async function togglePromoActive(checkbox) {
  const label = document.getElementById('promo-active-label');
  if (label) label.textContent = checkbox.checked ? 'Active' : 'Inactive';
  const promo = await VBPromo.get();
  await VBPromo.save({ ...promo, active: checkbox.checked });
  VBToast.show(checkbox.checked ? 'Promo banner activated ✅' : 'Promo banner hidden', 'info');
}

async function savePromo() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const promo = {
    active:         document.getElementById('promo-active-toggle')?.checked ?? true,
    eyebrow:        get('promo-eyebrow-inp') || '⚡ Limited Time Offer',
    title:          get('promo-title-inp')   || 'Up to 40% Off Bestsellers',
    desc:           get('promo-desc-inp'),
    code:           (get('promo-code-inp') || 'BEAUTY20').toUpperCase(),
    codePct:        get('promo-codepct-inp') || '20',
    ctaText:        get('promo-ctatext-inp') || 'Shop Sale Now',
    ctaLink:        get('promo-ctalink-inp') || 'shop.html?sale=true',
    countdownHours: parseInt(get('promo-hours-inp')) || 8,
  };
  await VBPromo.save(promo);
  VBToast.show('Promo banner saved ✅', 'success');
}

function resetPromoCountdown() {
  VBToast.show('Countdown timer reset ✅', 'success');
}