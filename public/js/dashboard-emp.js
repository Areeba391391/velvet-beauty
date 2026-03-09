/* ============================================
   VELVET BEAUTY — dashboard-emp.js
   Employee dashboard: orders (update status),
   products (view only), reviews (view only)
   Revenue / customers HIDDEN
   ============================================ */

/* ── State ── */
let empOrders   = [];
let empProducts = [...VB_PRODUCTS];
let empReviews  = [...VB_REVIEWS];
let empEditingOrder = null;

/* ── Toast ── */
function showToast(msg, type = 'default', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { default:'💄', success:'✅', error:'❌', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'💄'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 400); }, duration);
}

/* ── Panel navigation ── */
function showPanel(name, triggerBtn) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.dash-nav-item').forEach(i => i.classList.remove('active'));

  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('active');
  if (triggerBtn) triggerBtn.classList.add('active');

  const titles = {
    'emp-overview': 'My Dashboard',
    'emp-orders':   'Orders',
    'emp-products': 'Products',
    'emp-reviews':  'Reviews'
  };
  const title = document.getElementById('topbar-title');
  if (title) title.textContent = titles[name] || name;

  const loaders = {
    'emp-overview': renderEmpOverview,
    'emp-orders':   renderEmpOrders,
    'emp-products': renderEmpProducts,
    'emp-reviews':  renderEmpReviews
  };
  if (loaders[name]) loaders[name]();
}

/* ── Sidebar toggle ── */
function toggleSidebar() {
  document.getElementById('dash-sidebar')?.classList.toggle('open');
  document.getElementById('dash-sidebar-overlay')?.classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('dash-sidebar')?.classList.remove('open');
  document.getElementById('dash-sidebar-overlay')?.classList.remove('visible');
}

/* ── Load orders ── */
function loadEmpOrders() {
  const saved = JSON.parse(localStorage.getItem('vb_orders') || '[]');
  empOrders = [...saved, ...VB_ORDERS].reduce((acc, o) => {
    if (!acc.find(x => x.orderNumber === o.orderNumber)) acc.push(o);
    return acc;
  }, []);
}

/* ── OVERVIEW ── */
function renderEmpOverview() {
  loadEmpOrders();

  /* Shift stats */
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = empOrders.filter(o => o.createdAt?.startsWith(today)).length;

  document.getElementById('emp-orders-today').textContent = todayOrders || empOrders.length;
  document.getElementById('emp-processing').textContent   = empOrders.filter(o => o.status === 'processing').length;
  document.getElementById('emp-shipped').textContent      = empOrders.filter(o => o.status === 'shipped').length;
  document.getElementById('emp-delivered').textContent    = empOrders.filter(o => o.status === 'delivered').length;
  document.getElementById('emp-total-products').textContent = empProducts.filter(p => p.isActive).length;
  document.getElementById('emp-pending-badge').textContent  = empOrders.filter(o => o.status === 'processing').length;

  /* Date */
  const dateEl = document.getElementById('emp-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  /* Recent pending orders */
  const tbody = document.getElementById('emp-recent-orders-tbody');
  if (!tbody) return;
  const pending = empOrders.filter(o => o.status === 'processing').slice(0, 5);
  tbody.innerHTML = pending.map(o => `
    <tr>
      <td class="td-primary">${o.orderNumber}</td>
      <td>${o.customerName}</td>
      <td>${o.items?.length || 0} item(s)</td>
      <td>${o.city || '—'}</td>
      <td><span class="status-badge status-${o.status}"><span class="status-dot"></span>${o.status}</span></td>
      <td>${o.createdAt?.slice(0,10) || ''}</td>
      <td>
        <button class="table-action-btn" onclick="openEmpOrderModal('${o.id || o.orderNumber}')" title="Update Status">
          ✏️ Update
        </button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--gray-400);padding:1.5rem;">No pending orders</td></tr>`;
}

/* ── ORDERS ── */
let empOrdersFilter = 'all';
let empOrdersSearch = '';

function renderEmpOrders() {
  loadEmpOrders();
  const tbody = document.getElementById('emp-orders-tbody');
  if (!tbody) return;

  let list = empOrders;
  if (empOrdersFilter !== 'all') list = list.filter(o => o.status === empOrdersFilter);
  if (empOrdersSearch) {
    const q = empOrdersSearch.toLowerCase();
    list = list.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  }

  tbody.innerHTML = list.map(o => `
    <tr>
      <td class="td-primary">${o.orderNumber}</td>
      <td>${o.customerName}</td>
      <td>${o.city || '—'}</td>
      <td>${o.items?.map(i => `${i.quantity}× ${i.productName}`).join(', ') || '—'}</td>
      <td><span class="status-badge status-${o.status}"><span class="status-dot"></span>${o.status}</span></td>
      <td>${o.createdAt?.slice(0,10) || ''}</td>
      <td>
        <button class="table-action-btn" onclick="openEmpOrderModal('${o.id || o.orderNumber}')" title="Update">✏️ Update</button>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--gray-400);padding:2rem;">No orders found</td></tr>`;
}

function filterEmpOrders(val)  { empOrdersFilter = val; renderEmpOrders(); }
function searchEmpOrders(val)  { empOrdersSearch = val; renderEmpOrders(); }

/* ── PRODUCTS (view only) ── */
let empProductsFilter = 'all';
let empProductsSearch = '';

function renderEmpProducts() {
  const tbody = document.getElementById('emp-products-tbody');
  if (!tbody) return;

  let list = empProducts;
  if (empProductsFilter !== 'all') list = list.filter(p => p.category === empProductsFilter);
  if (empProductsSearch) {
    const q = empProductsSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${p.image}" alt="${p.name}"
            style="width:38px;height:38px;border-radius:8px;object-fit:cover;"
            onerror="this.style.display='none'"
          />
          <span class="td-primary">${p.name}</span>
        </div>
      </td>
      <td><span class="tag tag-pink">${p.category}</span></td>
      <td>${formatPrice(p.price)}</td>
      <td>
        <span style="color:${p.stock < 10 ? 'var(--error)' : 'var(--success)'}; font-weight:600;">
          ${p.stock} ${p.stock < 10 ? '⚠️' : ''}
        </span>
      </td>
      <td>${p.sold}</td>
      <td><span style="color:#F5C518;">★</span> ${p.rating}</td>
      <td>
        <span class="status-badge ${p.isActive ? 'status-delivered' : 'status-cancelled'}">
          ${p.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--gray-400);padding:2rem;">No products found</td></tr>`;
}

function filterEmpProducts(val) { empProductsFilter = val; renderEmpProducts(); }
function searchEmpProducts(val) { empProductsSearch = val; renderEmpProducts(); }

/* ── REVIEWS (view only) ── */
function renderEmpReviews() {
  const tbody = document.getElementById('emp-reviews-tbody');
  if (!tbody) return;
  tbody.innerHTML = empReviews.map(r => `
    <tr>
      <td class="td-primary">${r.customerName}</td>
      <td>${r.productName}</td>
      <td><span style="color:#F5C518;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></td>
      <td style="max-width:300px; font-size:0.8rem; color:var(--gray-500);">${r.text}</td>
      <td>${r.createdAt}</td>
    </tr>
  `).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--gray-400);padding:2rem;">No reviews</td></tr>`;
}

/* ── ORDER STATUS MODAL ── */
function openEmpOrderModal(idOrNum) {
  const order = empOrders.find(o => o.id === idOrNum || o.orderNumber === idOrNum);
  if (!order) return;
  empEditingOrder = order;

  document.getElementById('emp-order-modal-info').innerHTML = `
    <strong>${order.orderNumber}</strong> — ${order.customerName}<br/>
    City: ${order.city || '—'} | Items: ${order.items?.length || 0}
  `;
  document.getElementById('emp-order-status-select').value = order.status;
  document.getElementById('emp-order-modal')?.classList.add('active');
}

function closeEmpOrderModal() {
  document.getElementById('emp-order-modal')?.classList.remove('active');
  empEditingOrder = null;
}

function updateEmpOrderStatus() {
  if (!empEditingOrder) return;
  const newStatus = document.getElementById('emp-order-status-select')?.value;
  empEditingOrder.status = newStatus;

  /* Persist to localStorage */
  const saved = JSON.parse(localStorage.getItem('vb_orders') || '[]');
  const idx   = saved.findIndex(o => o.orderNumber === empEditingOrder.orderNumber);
  if (idx !== -1) {
    saved[idx].status = newStatus;
    localStorage.setItem('vb_orders', JSON.stringify(saved));
  }

  closeEmpOrderModal();
  showToast(`Order status updated to "${newStatus}" ✅`, 'success');

  const active = document.querySelector('.dash-panel.active')?.id?.replace('panel-', '');
  if (active === 'emp-orders')   renderEmpOrders();
  if (active === 'emp-overview') renderEmpOverview();
}

/* ── Logout ── */
function logoutUser() {
  localStorage.removeItem('vb_session');
  window.location.href = 'login.html';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Auth check */
  const session = JSON.parse(localStorage.getItem('vb_session') || 'null');
  if (!session || session.role !== 'employee') {
    /* Uncomment in production: */
    /* window.location.href = 'login.html'; return; */
  }

  /* Set user name */
  const name    = session?.name || 'Employee';
  const initial = name[0].toUpperCase();
  const sidebarName   = document.getElementById('emp-sidebar-name');
  const sidebarAvatar = document.getElementById('emp-sidebar-avatar');
  const topbarAvatar  = document.getElementById('emp-topbar-avatar');
  const welcomeName   = document.getElementById('emp-welcome-name');

  if (sidebarName)   sidebarName.textContent   = name;
  if (sidebarAvatar) sidebarAvatar.textContent  = initial;
  if (topbarAvatar)  topbarAvatar.textContent   = initial;
  if (welcomeName)   welcomeName.textContent    = name.split(' ')[0];

  /* Load initial panel */
  renderEmpOverview();

  /* Close modal on outside click */
  document.getElementById('emp-order-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEmpOrderModal();
  });
});
