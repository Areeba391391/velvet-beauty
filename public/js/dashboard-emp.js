/* ============================================================
   VELVET BEAUTY — dashboard-emp.js (MongoDB API version)
   Employee Dashboard: Overview · Orders · Products · Reviews
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const session = VBAuth.guard(['employee']);
  if (!session) return;

  document.getElementById('sb-name').textContent     = session.name;
  document.getElementById('sb-avatar').textContent   = session.name.charAt(0).toUpperCase();
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' });

  showSection('overview', null);
  setPendingBadge();
});

async function showSection(name, btn) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sectionEl = document.getElementById('section-' + name);
  if (sectionEl) sectionEl.classList.add('active');
  if (btn) btn.classList.add('active');
  else { const l = document.querySelector(`.sidebar-link[data-section="${name}"]`); if (l) l.classList.add('active'); }
  const titles = { overview: 'Overview', orders: 'Orders', products: 'Products', reviews: 'Reviews' };
  document.getElementById('topbar-title').textContent = titles[name] || name;

  if (name === 'overview') await renderEmpOverview();
  if (name === 'orders')   await renderEmpOrders();
  if (name === 'products') await renderEmpProducts();
  if (name === 'reviews')  await renderEmpReviews();
}

async function setPendingBadge() {
  const orders  = await VBOrders.getAll({ status: 'processing' });
  const pending = orders.length;
  const el      = document.getElementById('sb-pending-count');
  if (el) { el.textContent = pending; el.style.display = pending ? '' : 'none'; }
}

function openSidebar()  { document.getElementById('dash-sidebar').classList.add('open'); document.getElementById('sidebar-overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('dash-sidebar').classList.remove('open'); document.getElementById('sidebar-overlay').classList.remove('show'); }
function doLogout()     { VBAuth.logout(); window.location.href = 'login.html'; }

// ── OVERVIEW ─────────────────────────────────────────────────
async function renderEmpOverview() {
  const orders    = await VBOrders.getAll();
  const today     = new Date().toISOString().slice(0, 10);
  const todayOrds = orders.filter(o => (o.createdAt || '').slice(0, 10) === today).length;
  const pending   = orders.filter(o => o.status === 'processing').length;
  const shipped   = orders.filter(o => o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('stat-today-orders', todayOrds);
  setTxt('stat-pending',      pending);
  setTxt('stat-shipped',      shipped);
  setTxt('stat-delivered',    delivered);

  const tbody = document.getElementById('emp-recent-orders');
  if (tbody) {
    tbody.innerHTML = orders.slice(0, 6).map(o => `
      <tr>
        <td><b>${o.orderNumber || o._id}</b></td>
        <td>${o.customerName}</td>
        <td>${fmtPrice(o.total)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.createdAt)}</td>
        <td><button class="tbl-btn tbl-view" onclick="openEmpOrderStatus('${o._id}', '${o.status}')">Update</button></td>
      </tr>`).join('');
  }
}

// ── ORDERS ───────────────────────────────────────────────────
async function renderEmpOrders() {
  const q  = (document.getElementById('emp-orders-search')?.value || '').toLowerCase();
  const st = document.getElementById('emp-orders-filter')?.value || '';
  const params = {};
  if (st) params.status = st;
  let orders = await VBOrders.getAll(params);
  if (q) orders = orders.filter(o => (o.orderNumber || o._id).toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));

  const tbody = document.getElementById('emp-orders-body');
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
      <td><button class="tbl-btn tbl-edit" onclick="openEmpOrderStatus('${o._id}', '${o.status}')">Update Status</button></td>
    </tr>`).join('');
}

function openEmpOrderStatus(id, currentStatus) {
  document.getElementById('ems-order-id').value      = id;
  document.getElementById('ems-order-display').value = id;
  if (currentStatus) document.getElementById('ems-status').value = currentStatus;
  VBModal.open('order-status-modal');
}

async function empUpdateOrderStatus() {
  const id     = document.getElementById('ems-order-id').value;
  const status = document.getElementById('ems-status').value;
  await VBOrders.updateStatus(id, status);
  VBToast.show('Order status updated ✅', 'success');
  VBModal.close('order-status-modal');
  await renderEmpOrders();
  await setPendingBadge();
}

// ── PRODUCTS (view only) ──────────────────────────────────────
async function renderEmpProducts() {
  const q   = (document.getElementById('emp-prod-search')?.value || '').toLowerCase();
  const cat = document.getElementById('emp-prod-cat')?.value || '';
  const params = {};
  if (cat) params.category = cat;
  let products = await VBProducts.fetchAll(params);
  if (q) products = products.filter(p => p.name.toLowerCase().includes(q));

  const tbody = document.getElementById('emp-products-body');
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="tbl-product-cell">
          <div class="tbl-product-img"><img src="${p.image || ''}" onerror="this.src='https://placehold.co/44x44/FDE8F3/E91E8C?text=VB'" alt="${p.name}"/></div>
          <div><div class="tbl-product-name">${p.name}</div><div class="tbl-product-cat">${p.badge || ''}</div></div>
        </div>
      </td>
      <td>${p.category}</td>
      <td>${fmtPrice(p.price)}</td>
      <td>${p.stock || 0}</td>
      <td>⭐ ${p.rating || 0}</td>
      <td><span class="status-badge ${p.isActive !== false ? 's-delivered' : 's-cancelled'}">${p.isActive !== false ? 'Active' : 'Hidden'}</span></td>
    </tr>`).join('');
}

// ── REVIEWS (view only) ───────────────────────────────────────
async function renderEmpReviews() {
  const q       = (document.getElementById('emp-reviews-search')?.value || '').toLowerCase();
  let reviews   = await VBReviews.getAll();
  if (q) reviews = reviews.filter(r => r.customerName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q));

  const tbody = document.getElementById('emp-reviews-body');
  if (!tbody) return;
  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td>
        <div class="tbl-customer-cell">
          <div class="tbl-cust-avatar" style="background:${avatarBg(r.customerName)}">${r.customerName.charAt(0)}</div>
          <div class="tbl-cust-name">${r.customerName}</div>
        </div>
      </td>
      <td style="font-size:0.82rem;">${r.productName || '—'}</td>
      <td><span style="color:#F5C518;">${'★'.repeat(r.rating)}</span></td>
      <td style="max-width:260px;font-size:0.82rem;color:var(--g600);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.text}</td>
      <td>${fmtDate(r.createdAt)}</td>
    </tr>`).join('');
}