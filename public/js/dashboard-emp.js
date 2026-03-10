/* ============================================================
   VELVET BEAUTY — dashboard-emp.js
   Employee Dashboard: Overview · Orders (status update)
   Products (view) · Reviews (view)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  seedIfNeeded();
  const session = VBAuth.guard(['employee']);
  if (!session) return;

  document.getElementById('sb-name').textContent   = session.name;
  document.getElementById('sb-avatar').textContent = session.name.charAt(0).toUpperCase();
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-PK', { weekday:'short', day:'numeric', month:'short' });

  showSection('overview', null);
  setPendingBadge();
});

function showSection(name, btn) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sectionEl = document.getElementById('section-' + name);
  if (sectionEl) sectionEl.classList.add('active');
  if (btn) btn.classList.add('active');
  else { const l = document.querySelector(`.sidebar-link[data-section="${name}"]`); if (l) l.classList.add('active'); }
  const titles = { overview:'Overview', orders:'Orders', products:'Products', reviews:'Reviews' };
  document.getElementById('topbar-title').textContent = titles[name] || name;

  if (name === 'overview') renderEmpOverview();
  if (name === 'orders')   renderEmpOrders();
  if (name === 'products') renderEmpProducts();
  if (name === 'reviews')  renderEmpReviews();
}

function setPendingBadge() {
  const pending = VBOrders.getAll().filter(o => o.status === 'processing').length;
  const el = document.getElementById('sb-pending-count');
  if (el) { el.textContent = pending; el.style.display = pending ? '' : 'none'; }
}

function openSidebar()  { document.getElementById('dash-sidebar').classList.add('open'); document.getElementById('sidebar-overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('dash-sidebar').classList.remove('open'); document.getElementById('sidebar-overlay').classList.remove('show'); }
function doLogout()     { VBAuth.logout(); window.location.href = 'login.html'; }

// ── OVERVIEW ─────────────────────────────────────────────────
function renderEmpOverview() {
  const orders  = VBOrders.getAll();
  const today   = new Date().toISOString().slice(0,10);
  const todayOrders = orders.filter(o => o.date === today).length;
  const pending  = orders.filter(o => o.status === 'processing').length;
  const shipped  = orders.filter(o => o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  document.getElementById('stat-today-orders').textContent = todayOrders;
  document.getElementById('stat-pending').textContent      = pending;
  document.getElementById('stat-shipped').textContent      = shipped;
  document.getElementById('stat-delivered').textContent    = delivered;

  const tbody = document.getElementById('emp-recent-orders');
  if (tbody) {
    tbody.innerHTML = orders.slice(0,6).map(o => `
      <tr>
        <td><b>${o.id}</b></td>
        <td>${o.customerName}</td>
        <td>${fmtPrice(o.total)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.date)}</td>
        <td><button class="tbl-btn tbl-view" onclick="openEmpOrderStatus('${o.id}')">Update</button></td>
      </tr>`).join('');
  }
}

// ── ORDERS ───────────────────────────────────────────────────
function renderEmpOrders() {
  let orders = VBOrders.getAll();
  const q  = (document.getElementById('emp-orders-search')?.value||'').toLowerCase();
  const st = document.getElementById('emp-orders-filter')?.value || '';
  if (q)  orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  if (st) orders = orders.filter(o => o.status === st);

  const tbody = document.getElementById('emp-orders-body');
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
      <td><button class="tbl-btn tbl-edit" onclick="openEmpOrderStatus('${o.id}')">Update Status</button></td>
    </tr>`).join('');
}

function openEmpOrderStatus(id) {
  document.getElementById('ems-order-id').value = id;
  document.getElementById('ems-order-display').value = id;
  const o = VBOrders.getById(id);
  if (o) document.getElementById('ems-status').value = o.status;
  VBModal.open('order-status-modal');
}

function empUpdateOrderStatus() {
  const id     = document.getElementById('ems-order-id').value;
  const status = document.getElementById('ems-status').value;
  VBOrders.updateStatus(id, status);
  VBToast.show('Order status updated ✅', 'success');
  VBModal.close('order-status-modal');
  renderEmpOrders();
  setPendingBadge();
}

// ── PRODUCTS (view only) ──────────────────────────────────────
function renderEmpProducts() {
  let products = VBProducts.getAll();
  const q   = (document.getElementById('emp-prod-search')?.value||'').toLowerCase();
  const cat = document.getElementById('emp-prod-cat')?.value || '';
  if (q)   products = products.filter(p => p.name.toLowerCase().includes(q));
  if (cat) products = products.filter(p => p.category === cat);

  const tbody = document.getElementById('emp-products-body');
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="tbl-product-cell">
          <div class="tbl-product-img"><img src="${p.image}" onerror="this.src='https://placehold.co/44x44/FDE8F3/E91E8C?text=VB'" alt="${p.name}"/></div>
          <div><div class="tbl-product-name">${p.name}</div><div class="tbl-product-cat">${p.badge||''}</div></div>
        </div>
      </td>
      <td>${p.category}</td>
      <td>${fmtPrice(p.price)}</td>
      <td>${p.stock||0}</td>
      <td>⭐ ${p.rating||0}</td>
      <td><span class="status-badge ${p.active?'s-delivered':'s-cancelled'}">${p.active?'Active':'Hidden'}</span></td>
    </tr>`).join('');
}

// ── REVIEWS (view only) ───────────────────────────────────────
function renderEmpReviews() {
  let reviews = VBReviews.getAll();
  const q = (document.getElementById('emp-reviews-search')?.value||'').toLowerCase();
  if (q) reviews = reviews.filter(r => r.customerName.toLowerCase().includes(q) || r.text.toLowerCase().includes(q));

  const tbody = document.getElementById('emp-reviews-body');
  if (!tbody) return;
  tbody.innerHTML = reviews.map(r => {
    const p = VBProducts.getById(r.productId);
    return `<tr>
      <td>
        <div class="tbl-customer-cell">
          <div class="tbl-cust-avatar" style="background:${avatarBg(r.customerName)}">${r.customerName.charAt(0)}</div>
          <div class="tbl-cust-name">${r.customerName}</div>
        </div>
      </td>
      <td style="font-size:0.82rem;">${p?.name||'—'}</td>
      <td><span style="color:#F5C518;">${'★'.repeat(r.rating)}</span></td>
      <td style="max-width:260px;font-size:0.82rem;color:var(--g600);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.text}</td>
      <td>${fmtDate(r.date)}</td>
    </tr>`;
  }).join('');
}
