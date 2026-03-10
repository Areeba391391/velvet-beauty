/* ============================================================
   VELVET BEAUTY — dashboard-owner.js
   Owner Dashboard: Overview · Orders · Products
   Customers · Reviews · Analytics · Settings
   ============================================================ */

let currentOrderId    = null;
let currentCustomerId = null;
let currentProductId  = null;
let activeSection     = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  seedIfNeeded();
  const session = VBAuth.guard(['owner']);
  if (!session) return;

  // Set user info
  document.getElementById('sb-name').textContent   = session.name;
  document.getElementById('sb-avatar').textContent = session.name.charAt(0).toUpperCase();
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-PK', { weekday:'short', day:'numeric', month:'short' });

  showSection('overview', null);
  setPendingBadge();
});

// ── Section switching ─────────────────────────────────────────
function showSection(name, btn) {
  activeSection = name;
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sectionEl = document.getElementById('section-' + name);
  if (sectionEl) sectionEl.classList.add('active');
  if (btn) btn.classList.add('active');
  else {
    const linkEl = document.querySelector(`.sidebar-link[data-section="${name}"]`);
    if (linkEl) linkEl.classList.add('active');
  }
  const titles = { overview:'Overview', orders:'Orders', products:'Products', customers:'Customers', users:'Staff Users', reviews:'Reviews', analytics:'Analytics', settings:'Settings' };
  document.getElementById('topbar-title').textContent = titles[name] || name;

  // Render on switch
  if (name === 'overview')   renderOverview();
  if (name === 'orders')     renderOrders();
  if (name === 'products')   renderProducts();
  if (name === 'customers')  renderCustomers();
  if (name === 'users')      renderUsers();
  if (name === 'reviews')    renderReviews();
  if (name === 'analytics')  renderAnalytics();
  if (name === 'settings')   loadPromoForm();
}

function setPendingBadge() {
  const pending = VBOrders.getAll().filter(o => o.status === 'processing').length;
  const badgeEl = document.getElementById('sb-pending-count');
  if (badgeEl) { badgeEl.textContent = pending; badgeEl.style.display = pending ? '' : 'none'; }
}

// ── Mobile sidebar ────────────────────────────────────────────
function openSidebar()  { document.getElementById('dash-sidebar').classList.add('open'); document.getElementById('sidebar-overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('dash-sidebar').classList.remove('open'); document.getElementById('sidebar-overlay').classList.remove('show'); }

// ── Logout ────────────────────────────────────────────────────
function doLogout() { VBAuth.logout(); window.location.href = 'login.html'; }

// ── OVERVIEW ─────────────────────────────────────────────────
function renderOverview() {
  const orders    = VBOrders.getAll();
  const customers = VBCustomers.getAll();
  const products  = VBProducts.getAll();
  const revenue   = orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + o.total, 0);

  document.getElementById('stat-revenue').textContent        = 'Rs. ' + revenue.toLocaleString();
  document.getElementById('stat-orders').textContent         = orders.length;
  document.getElementById('stat-customers').textContent      = customers.length;
  document.getElementById('stat-products-count').textContent = products.filter(p => p.active).length;

  // Bar chart (monthly analytics)
  const analytics = VBAnalytics.get();
  const maxRev    = Math.max(...analytics.map(m => m.revenue));
  const chartEl   = document.getElementById('overview-chart');
  if (chartEl) {
    chartEl.innerHTML = analytics.map(m => {
      const h = maxRev ? Math.round((m.revenue / maxRev) * 160) : 10;
      return `<div class="chart-bar-col">
        <div class="chart-bar" style="height:${h}px;">
          <div class="chart-bar-tooltip">Rs. ${m.revenue.toLocaleString()}</div>
        </div>
        <span class="chart-bar-label">${m.month.split(' ')[0]}</span>
      </div>`;
    }).join('');
  }

  // Category summary
  const catEl = document.getElementById('cat-summary');
  const cats  = ['Lips','Face','Eyes','Cheeks','Skincare'];
  const catColors = { Lips:'#E91E8C', Face:'#C9956C', Eyes:'#6B2D5E', Cheeks:'#C2185B', Skincare:'#2D8A4E' };
  if (catEl) {
    catEl.innerHTML = cats.map(cat => {
      const count = VBProducts.getByCat(cat).length;
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
    tbody.innerHTML = orders.slice(0,5).map(o => `
      <tr>
        <td><b>${o.id}</b></td>
        <td>${o.customerName}</td>
        <td>${fmtPrice(o.total)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.date)}</td>
      </tr>`).join('');
  }
}

// ── ORDERS ───────────────────────────────────────────────────
function renderOrders() {
  let orders = VBOrders.getAll();
  const q = (document.getElementById('orders-search')?.value||'').toLowerCase();
  const st = document.getElementById('orders-status-filter')?.value || '';
  if (q)  orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  if (st) orders = orders.filter(o => o.status === st);

  const tbody = document.getElementById('orders-body');
  if (!tbody) return;
  if (!orders.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--g400);">No orders found</td></tr>`; return; }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><b>${o.id}</b></td>
      <td>${o.customerName}</td>
      <td>${o.items?.length||0} items</td>
      <td>${fmtPrice(o.total)}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${fmtDate(o.date)}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn tbl-view" onclick="openOrderModal('${o.id}')">View</button>
      </div></td>
    </tr>`).join('');
}

function openOrderModal(id) {
  currentOrderId = id;
  const o = VBOrders.getById(id);
  if (!o) return;
  document.getElementById('om-title').textContent = `Order ${o.id}`;
  document.getElementById('om-status-select').value = o.status;

  const items = (o.items||[]).map(i => `
    <div style="display:flex;gap:0.75rem;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--g100);">
      <img src="${i.image}" width="40" height="40" style="border-radius:8px;object-fit:cover;" onerror="this.src='https://placehold.co/40x40/FDE8F3/E91E8C?text=VB'"/>
      <div style="flex:1;"><div style="font-weight:600;font-size:0.85rem;">${i.name}</div><div style="font-size:0.72rem;color:var(--g400);">Qty: ${i.qty}</div></div>
      <div style="font-weight:600;color:var(--pink);">${fmtPrice(i.price * i.qty)}</div>
    </div>`).join('');

  document.getElementById('om-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Customer</div><div style="font-weight:600;">${o.customerName}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Date</div><div>${fmtDate(o.date)}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Phone</div><div>${o.customerPhone||'—'}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Payment</div><div style="text-transform:capitalize;">${o.paymentMethod||'—'}</div></div>
      <div style="grid-column:1/-1;"><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">Address</div><div>${o.address||'—'}</div></div>
    </div>
    <div style="margin-bottom:1rem;">${items}</div>
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;"><span style="color:var(--g500);">Subtotal</span><span>${fmtPrice(o.subtotal)}</span></div>
    ${o.discount ? `<div style="display:flex;justify-content:space-between;padding:.5rem 0;"><span style="color:var(--g500);">Discount</span><span style="color:var(--success);">−${fmtPrice(o.discount)}</span></div>` : ''}
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;"><span style="color:var(--g500);">Delivery</span><span>${fmtPrice(o.deliveryFee)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:.75rem 0;border-top:2px solid var(--g100);margin-top:.5rem;"><span style="font-family:var(--font-display);font-size:1.1rem;color:var(--plum-dark);">Total</span><span style="font-family:var(--font-display);font-size:1.3rem;color:var(--pink);font-weight:500;">${fmtPrice(o.total)}</span></div>`;

  VBModal.open('order-modal');
}

function updateOrderStatus() {
  const status = document.getElementById('om-status-select').value;
  VBOrders.updateStatus(currentOrderId, status);
  VBToast.show('Order status updated', 'success');
  VBModal.close('order-modal');
  renderOrders();
  setPendingBadge();
}

function deleteOrder() {
  VBModal.close('order-modal');
  VBModal.confirm('Delete this order permanently?', () => {
    VBOrders.delete(currentOrderId);
    VBToast.show('Order deleted', 'success');
    renderOrders();
    setPendingBadge();
  });
}

// ── PRODUCTS ─────────────────────────────────────────────────
function renderProducts() {
  let products = VBProducts.getAll();
  const q = (document.getElementById('products-search')?.value||'').toLowerCase();
  const cat = document.getElementById('products-cat-filter')?.value || '';
  if (q)   products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  if (cat) products = products.filter(p => p.category === cat);

  const tbody = document.getElementById('products-body');
  if (!tbody) return;
  if (!products.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--g400);">No products found</td></tr>`; return; }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="tbl-product-cell">
          <div class="tbl-product-img"><img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/44x44/FDE8F3/E91E8C?text=VB'"/></div>
          <div><div class="tbl-product-name">${p.name}</div><div class="tbl-product-cat">${p.badge||''}</div></div>
        </div>
      </td>
      <td>${p.category}</td>
      <td>${fmtPrice(p.price)}</td>
      <td>${p.stock||0}</td>
      <td>⭐ ${p.rating||0}</td>
      <td><span class="status-badge ${p.active?'s-delivered':'s-cancelled'}">${p.active?'Active':'Hidden'}</span></td>
      <td><div class="tbl-actions">
        <button class="tbl-btn tbl-edit"   onclick="openProductModal('${p.id}')">Edit</button>
        <button class="tbl-btn tbl-delete" onclick="deleteProduct('${p.id}')">Delete</button>
      </div></td>
    </tr>`).join('');
}

function openProductModal(id) {
  currentProductId = id;
  const pm = id ? VBProducts.getById(id) : null;
  document.getElementById('pm-title').textContent = pm ? 'Edit Product' : 'Add Product';
  document.getElementById('pm-id').value          = pm?.id || '';
  document.getElementById('pm-name').value        = pm?.name || '';
  document.getElementById('pm-cat').value         = pm?.category || 'Lips';
  document.getElementById('pm-badge').value       = pm?.badge || '';
  document.getElementById('pm-price').value       = pm?.price || '';
  document.getElementById('pm-orig-price').value  = pm?.origPrice || '';
  document.getElementById('pm-stock').value       = pm?.stock || '';
  document.getElementById('pm-rating').value      = pm?.rating || '';
  document.getElementById('pm-active').checked    = pm ? pm.active : true;
  document.getElementById('pm-bestseller').checked = pm?.bestseller || false;
  document.getElementById('pm-image').value       = pm?.image || '';
  document.getElementById('pm-desc').value        = pm?.desc || '';
  document.getElementById('pm-shades').value      = pm?.shades?.join(', ') || '';
  previewProductImg(pm?.image || '');
  VBModal.open('product-modal');
}

function previewProductImg(url) {
  const img         = document.getElementById('pm-img-preview');
  const placeholder = document.getElementById('pm-img-placeholder');
  if (url && img) {
    img.src = url;
    img.classList.remove('hidden');
    if (placeholder) placeholder.style.display = 'none';
    img.onerror = () => { img.classList.add('hidden'); if (placeholder) placeholder.style.display = ''; };
  } else {
    if (img) img.classList.add('hidden');
    if (placeholder) placeholder.style.display = '';
  }
}

function saveProduct() {
  const id         = document.getElementById('pm-id').value;
  const shadesRaw  = document.getElementById('pm-shades').value.trim();
  const data = {
    name:       document.getElementById('pm-name').value.trim(),
    category:   document.getElementById('pm-cat').value,
    badge:      document.getElementById('pm-badge').value,
    price:      parseFloat(document.getElementById('pm-price').value) || 0,
    origPrice:  parseFloat(document.getElementById('pm-orig-price').value) || null,
    stock:      parseInt(document.getElementById('pm-stock').value) || 0,
    rating:     parseFloat(document.getElementById('pm-rating').value) || 0,
    active:     document.getElementById('pm-active').checked,
    bestseller: document.getElementById('pm-bestseller').checked,
    isNew:      document.getElementById('pm-badge').value === 'new',
    image:      document.getElementById('pm-image').value.trim(),
    desc:       document.getElementById('pm-desc').value.trim(),
    shades:     shadesRaw ? shadesRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
  };
  if (!data.name) { VBToast.show('Product name is required', 'warning'); return; }
  if (!data.price) { VBToast.show('Price is required', 'warning'); return; }
  if (id) VBProducts.update(id, data);
  else    VBProducts.add(data);
  VBToast.show(id ? 'Product updated ✅' : 'Product added ✅', 'success');
  VBModal.close('product-modal');
  renderProducts();
}

function deleteProduct(id) {
  VBModal.confirm('Delete this product permanently?', () => {
    VBProducts.delete(id);
    VBToast.show('Product deleted', 'success');
    renderProducts();
  });
}

// ── CUSTOMERS ────────────────────────────────────────────────
function renderCustomers() {
  let customers = VBCustomers.getAll();
  const q  = (document.getElementById('customers-search')?.value||'').toLowerCase();
  const tp = document.getElementById('customers-type-filter')?.value || '';
  if (q)  customers = customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.city||'').toLowerCase().includes(q));
  if (tp) customers = customers.filter(c => c.type === tp);

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
      <td>${c.phone||'—'}</td>
      <td>${c.city||'—'}</td>
      <td>${c.totalOrders||0}</td>
      <td>${fmtPrice(c.totalSpent||0)}</td>
      <td>${typeBadge(c.type)}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn tbl-view" onclick="openCustomerModal('${c.id}')">View</button>
      </div></td>
    </tr>`).join('');
}

function openCustomerModal(id) {
  currentCustomerId = id;
  const c = VBCustomers.getById(id);
  if (!c) return;
  document.getElementById('cm-title').textContent = c.name;
  document.getElementById('cm-type-select').value = c.type;
  const orders = VBOrders.getAll().filter(o => o.customerName === c.name || o.customerId === c.id);
  document.getElementById('cm-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Email</div><div>${c.email}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Phone</div><div>${c.phone||'—'}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">City</div><div>${c.city||'—'}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Joined</div><div>${fmtDate(c.joinDate)}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Total Orders</div><div>${c.totalOrders||0}</div></div>
      <div><div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:4px;">Total Spent</div><div style="color:var(--pink);font-weight:600;">${fmtPrice(c.totalSpent||0)}</div></div>
    </div>
    ${orders.length ? `<div style="font-size:0.7rem;color:var(--g400);text-transform:uppercase;margin-bottom:.5rem;">Recent Orders</div>
      ${orders.slice(0,3).map(o => `<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--g100);font-size:.85rem;"><span>${o.id}</span>${statusBadge(o.status)}<span>${fmtPrice(o.total)}</span></div>`).join('')}` : ''}`;
  VBModal.open('customer-modal');
}

function updateCustomerType() {
  const type = document.getElementById('cm-type-select').value;
  VBCustomers.update(currentCustomerId, { type });
  VBToast.show('Customer type updated ✅', 'success');
  VBModal.close('customer-modal');
  renderCustomers();
}

function deleteCustomer() {
  VBModal.close('customer-modal');
  VBModal.confirm('Delete this customer permanently?', () => {
    VBCustomers.delete(currentCustomerId);
    VBToast.show('Customer deleted', 'success');
    renderCustomers();
  });
}

// ── REVIEWS ──────────────────────────────────────────────────
function renderReviews() {
  let reviews = VBReviews.getAll();
  const q  = (document.getElementById('reviews-search')?.value||'').toLowerCase();
  const rt = document.getElementById('reviews-rating-filter')?.value || '';
  if (q)  reviews = reviews.filter(r => r.customerName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q));
  if (rt) reviews = reviews.filter(r => r.rating === parseInt(rt));

  const tbody = document.getElementById('reviews-body');
  if (!tbody) return;
  if (!reviews.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--g400);">No reviews found</td></tr>`; return; }
  tbody.innerHTML = reviews.map(r => {
    const p = VBProducts.getById(r.productId);
    return `<tr>
      <td>
        <div class="tbl-customer-cell">
          <div class="tbl-cust-avatar" style="background:${avatarBg(r.customerName)}">${r.customerName.charAt(0)}</div>
          <div class="tbl-cust-name">${r.customerName}</div>
        </div>
      </td>
      <td><span style="font-size:0.82rem;">${p?.name||'—'}</span></td>
      <td><span style="color:#F5C518;">${'★'.repeat(r.rating)}</span></td>
      <td style="max-width:260px;"><div style="font-size:0.82rem;color:var(--g600);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.text}</div></td>
      <td>${fmtDate(r.date)}</td>
      <td><button class="tbl-btn tbl-delete" onclick="deleteReview('${r.id}')">Delete</button></td>
    </tr>`;
  }).join('');
}

function deleteReview(id) {
  VBModal.confirm('Delete this review?', () => {
    VBReviews.delete(id);
    VBToast.show('Review deleted', 'success');
    renderReviews();
  });
}

// ── ANALYTICS ────────────────────────────────────────────────
function renderAnalytics() {
  const data    = VBAnalytics.get();
  const summary = VBAnalytics.summary();
  document.getElementById('anal-avg-monthly').textContent = 'Rs. ' + summary.avgMonthly.toLocaleString();
  document.getElementById('anal-total-orders').textContent = summary.totalOrders;
  document.getElementById('anal-avg-rating').textContent  = summary.avgRating + ' ⭐';
  document.getElementById('anal-total-rev').textContent   = 'Rs. ' + summary.totalRev.toLocaleString();

  const tbody = document.getElementById('analytics-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(m => `
    <tr>
      <td><b>${m.month}</b></td>
      <td style="color:var(--pink);font-weight:600;">Rs. ${m.revenue.toLocaleString()}</td>
      <td>${m.orders}</td>
      <td>${m.newCustomers}</td>
      <td>Rs. ${m.avgOrder.toLocaleString()}</td>
    </tr>`).join('');
}

// ── SETTINGS ─────────────────────────────────────────────────
function saveSettings() {
  const settings = {
    empCode:        document.getElementById('set-emp-code').value.trim(),
    ownerCode:      document.getElementById('set-owner-code').value.trim(),
    freeDeliveryMin: parseInt(document.getElementById('set-free-delivery').value) || 2000,
    deliveryFee:    parseInt(document.getElementById('set-delivery-fee').value) || 200,
  };
  if (!settings.empCode || !settings.ownerCode) { VBToast.show('Access codes cannot be empty', 'warning'); return; }
  DB.set(KEYS.settings, settings);
  VBToast.show('Settings saved ✅', 'success');
}

function togglePwOwner(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

// ── STAFF USERS ───────────────────────────────────────────────
function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  const users = VBUsers.getAll();
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--g400);padding:2rem;">No staff users found.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <div style="width:32px;height:32px;border-radius:50%;background:${avatarBg(u.name)};display:flex;align-items:center;justify-content:center;font-weight:600;color:#fff;font-size:0.8rem;flex-shrink:0;">
            ${u.name.charAt(0).toUpperCase()}
          </div>
          <span style="font-weight:500;">${u.name}</span>
        </div>
      </td>
      <td style="color:var(--g500);font-size:0.82rem;">${u.email}</td>
      <td>${u.role === 'owner'
        ? '<span class="status-badge s-vip">👑 Owner</span>'
        : '<span class="status-badge s-processing">🏷️ Employee</span>'}</td>
      <td style="color:var(--g500);">${u.phone || '—'}</td>
      <td style="color:var(--g400);font-size:0.78rem;">${u.createdAt || '—'}</td>
      <td>
        <div style="display:flex;gap:0.4rem;">
          <button class="btn btn-sm btn-outline-pink" onclick="openUserModal('${u.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')">Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

let _editingUserId = null;

function openUserModal(userId) {
  _editingUserId = userId || null;
  const titleEl = document.getElementById('um-title');
  const hintEl  = document.getElementById('um-password-hint');

  // Clear form
  ['um-id','um-name','um-email','um-password','um-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('um-role').value = 'employee';

  if (userId) {
    const user = VBUsers.getById(userId);
    if (!user) return;
    if (titleEl) titleEl.textContent = 'Edit Staff User';
    if (hintEl)  hintEl.textContent  = 'Leave blank to keep existing password.';
    document.getElementById('um-id').value       = user.id;
    document.getElementById('um-name').value     = user.name;
    document.getElementById('um-email').value    = user.email;
    document.getElementById('um-role').value     = user.role;
    document.getElementById('um-phone').value    = user.phone || '';
  } else {
    if (titleEl) titleEl.textContent = 'Add Staff User';
    if (hintEl)  hintEl.textContent  = 'Min 6 characters.';
  }
  VBModal.open('user-modal');
}

function saveUser() {
  const id       = document.getElementById('um-id').value.trim();
  const name     = document.getElementById('um-name').value.trim();
  const email    = document.getElementById('um-email').value.trim().toLowerCase();
  const password = document.getElementById('um-password').value;
  const role     = document.getElementById('um-role').value;
  const phone    = document.getElementById('um-phone').value.trim();

  if (!name || !email) { VBToast.show('Name and email are required.', 'warning'); return; }
  if (!id && password.length < 6) { VBToast.show('Password must be at least 6 characters.', 'warning'); return; }

  if (id) {
    // Editing existing user
    const updateData = { name, email, role, phone };
    if (password.length >= 6) updateData.password = password;
    VBUsers.update(id, updateData);
    VBToast.show('Staff user updated ✅', 'success');
  } else {
    // Adding new user
    const result = VBUsers.add({ name, email, password, role, phone });
    if (!result.ok) { VBToast.show(result.error, 'error'); return; }
    VBToast.show('Staff user added ✅', 'success');
  }

  VBModal.close('user-modal');
  renderUsers();
}

function deleteUser(userId) {
  const session = VBAuth.session();
  if (session && session.id === userId) {
    VBToast.show("You can't delete your own account while logged in.", 'warning');
    return;
  }
  VBModal.confirm('Delete this staff user? They will no longer be able to log in.', () => {
    const result = VBUsers.delete(userId);
    if (result && !result.ok) { VBToast.show(result.error, 'error'); return; }
    VBToast.show('User deleted.', 'info');
    renderUsers();
  });
}

// ── PROMO BANNER ─────────────────────────────────────────────
function loadPromoForm() {
  const promo = VBPromo.get();
  const toggle = document.getElementById('promo-active-toggle');
  const label  = document.getElementById('promo-active-label');
  if (toggle) toggle.checked = !!promo.active;
  if (label)  label.textContent = promo.active ? 'Active' : 'Inactive';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('promo-eyebrow-inp',  promo.eyebrow);
  set('promo-title-inp',    promo.title);
  set('promo-desc-inp',     promo.desc);
  set('promo-code-inp',     promo.code);
  set('promo-codepct-inp',  promo.codePct);
  set('promo-ctatext-inp',  promo.ctaText);
  set('promo-ctalink-inp',  promo.ctaLink);
  set('promo-hours-inp',    promo.countdownHours || 8);
}

function togglePromoActive(checkbox) {
  const label = document.getElementById('promo-active-label');
  if (label) label.textContent = checkbox.checked ? 'Active' : 'Inactive';
  const promo = VBPromo.get();
  VBPromo.save({ ...promo, active: checkbox.checked });
  VBToast.show(checkbox.checked ? 'Promo banner activated ✅' : 'Promo banner hidden', 'info');
}

function savePromo() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const promo = {
    active:         document.getElementById('promo-active-toggle')?.checked ?? true,
    eyebrow:        get('promo-eyebrow-inp') || '⚡ Limited Time Offer',
    title:          get('promo-title-inp')   || 'Up to 40% Off Bestsellers',
    desc:           get('promo-desc-inp'),
    code:           (get('promo-code-inp')   || 'BEAUTY20').toUpperCase(),
    codePct:        get('promo-codepct-inp') || '20',
    ctaText:        get('promo-ctatext-inp') || 'Shop Sale Now',
    ctaLink:        get('promo-ctalink-inp') || 'shop.html?sale=true',
    countdownHours: parseInt(get('promo-hours-inp')) || 8,
  };
  VBPromo.save(promo);
  // Reset countdown timer so new hours take effect
  localStorage.removeItem('vb_countdown_end');
  VBToast.show('Promo banner saved ✅ — visible on homepage!', 'success');
}

function resetPromoCountdown() {
  localStorage.removeItem('vb_countdown_end');
  VBToast.show('Countdown timer reset ✅', 'success');
}
