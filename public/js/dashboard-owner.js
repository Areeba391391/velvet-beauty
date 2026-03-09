/* ============================================
   VELVET BEAUTY — dashboard-owner.js
   Owner dashboard: CRUD products, orders,
   customers, analytics, charts
   ============================================ */

/* ── State ── */
let dashOrders    = [];
let dashProducts  = [...VB_PRODUCTS];
let dashCustomers = [...VB_CUSTOMERS];
let dashReviews   = [...VB_REVIEWS];
let dashAnalytics = [...VB_ANALYTICS];
let editingOrder  = null;
let deletingItem  = null;
let deleteType    = '';

/* ── Toast (reuse from cart.js or define locally) ── */
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
  /* Hide all panels */
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  /* Deactivate all nav items */
  document.querySelectorAll('.dash-nav-item').forEach(i => i.classList.remove('active'));

  /* Show target panel */
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('active');

  /* Activate nav item */
  if (triggerBtn) triggerBtn.classList.add('active');

  /* Update topbar title */
  const titles = {
    overview:    'Dashboard',
    orders:      'Orders',
    analytics:   'Analytics',
    products:    'Products',
    'add-product': 'Add Product',
    reviews:     'Reviews',
    customers:   'Customers',
    settings:    'Settings'
  };
  const title = document.getElementById('topbar-title');
  if (title) title.textContent = titles[name] || name;

  /* Load data for the panel */
  const loaders = {
    overview:     renderOverview,
    orders:       renderOrders,
    analytics:    renderAnalytics,
    products:     renderProducts,
    'add-product': resetProductForm,
    reviews:      renderReviews,
    customers:    renderCustomers
  };
  if (loaders[name]) loaders[name]();
}

/* ── Sidebar toggle (mobile) ── */
function toggleSidebar() {
  document.getElementById('dash-sidebar')?.classList.toggle('open');
  document.getElementById('dash-sidebar-overlay')?.classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('dash-sidebar')?.classList.remove('open');
  document.getElementById('dash-sidebar-overlay')?.classList.remove('visible');
}

/* ── Load orders (localStorage + dummy) ── */
function loadOrders() {
  const saved = JSON.parse(localStorage.getItem('vb_orders') || '[]');
  dashOrders = [...saved, ...VB_ORDERS].reduce((acc, o) => {
    if (!acc.find(x => x.orderNumber === o.orderNumber)) acc.push(o);
    return acc;
  }, []);
}

/* ── OVERVIEW ── */
function renderOverview() {
  loadOrders();

  /* Stats */
  const totalRevenue = dashOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pending = dashOrders.filter(o => o.status === 'processing').length;

  document.getElementById('stat-revenue').textContent   = formatPrice(totalRevenue);
  document.getElementById('stat-orders').textContent    = dashOrders.length;
  document.getElementById('stat-products').textContent  = dashProducts.filter(p => p.isActive).length;
  document.getElementById('stat-customers').textContent = dashCustomers.length;
  document.getElementById('stat-pending-label').textContent = `${pending} pending`;
  document.getElementById('pending-badge').textContent = pending;

  /* Revenue bar chart */
  const chartEl  = document.getElementById('revenue-chart');
  const labelsEl = document.getElementById('chart-labels');
  if (chartEl) {
    const maxRev = Math.max(...dashAnalytics.map(a => a.revenue));
    chartEl.innerHTML = dashAnalytics.map(a => {
      const h = Math.round((a.revenue / maxRev) * 100);
      return `
        <div class="bar-group">
          <div class="bar" style="height:${h}%;" title="Rs.${a.revenue.toLocaleString()}"></div>
        </div>`;
    }).join('');
    labelsEl.innerHTML = dashAnalytics.map(a =>
      `<span style="flex:1; text-align:center; font-size:10px; color:var(--gray-400); white-space:nowrap;">
        ${a.month.slice(0,3)}
      </span>`
    ).join('');
  }

  /* Category donut */
  const catCounts = {};
  dashOrders.forEach(o => o.items?.forEach(item => {
    const prod = dashProducts.find(p => p.name === item.productName);
    const cat  = prod?.category || 'Other';
    catCounts[cat] = (catCounts[cat] || 0) + item.quantity;
  }));
  renderDonut(catCounts);

  /* Recent orders */
  renderRecentOrders();
  renderActivity();
}

/* ── Donut chart ── */
function renderDonut(catCounts) {
  const svg    = document.getElementById('donut-svg');
  const legend = document.getElementById('donut-legend');
  const total  = Object.values(catCounts).reduce((s, v) => s + v, 0);
  document.getElementById('donut-total').textContent = total;

  const COLORS = { Lips:'#E91E8C', Face:'#C9956C', Eyes:'#6B2D5E', Cheeks:'#C2185B', Skincare:'#2D8A4E', Other:'#B8A49A' };
  const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;

  let offset = 0;
  let svgHTML = '';
  let legendHTML = '';

  Object.entries(catCounts).forEach(([cat, count]) => {
    const pct  = total ? count / total : 0;
    const dash = pct * circ;
    const gap  = circ - dash;
    const col  = COLORS[cat] || '#ccc';

    svgHTML += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="16"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      stroke-dashoffset="-${offset.toFixed(2)}"
      opacity="0.85"/>`;
    offset += dash;

    legendHTML += `
      <div class="donut-legend-item">
        <span class="donut-legend-dot" style="background:${col};"></span>
        <span>${cat}</span>
        <span class="donut-legend-pct">${Math.round(pct*100)}%</span>
      </div>`;
  });

  if (svg)    svg.innerHTML    = svgHTML;
  if (legend) legend.innerHTML = legendHTML;
}

/* ── Recent orders table (overview) ── */
function renderRecentOrders() {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;
  const recent = dashOrders.slice(0, 6);
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td class="td-primary">${o.orderNumber}</td>
      <td>${o.customerName}</td>
      <td>${o.items?.length || 0} item(s)</td>
      <td>${formatPrice(o.total)}</td>
      <td><span class="status-badge status-${o.status}"><span class="status-dot"></span>${o.status}</span></td>
      <td>${o.createdAt?.slice(0,10) || ''}</td>
      <td>
        <div class="table-action-btns">
          <button class="table-action-btn" onclick="openOrderModal('${o.id || o.orderNumber}')" title="Edit">✏️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── Activity feed ── */
function renderActivity() {
  const list = document.getElementById('activity-list');
  if (!list) return;
  const activities = [
    { icon:'📦', bg:'var(--pink-pale)',     title:'New order received',       desc:`Order #${dashOrders[0]?.orderNumber || 'VB-100001'}`, time:'2 min ago' },
    { icon:'👤', bg:'rgba(107,45,94,0.10)', title:'New customer registered',   desc:'Sana Butt joined',           time:'1 hr ago' },
    { icon:'⭐', bg:'rgba(201,149,108,0.15)',title:'New review posted',          desc:'5-star review on Velvet Red', time:'3 hr ago' },
    { icon:'💄', bg:'var(--pink-pale)',     title:'Product stock low',          desc:'Berry Gloss Lip — 22 left',  time:'5 hr ago' },
    { icon:'✅', bg:'var(--success-light)', title:'Order delivered',            desc:`Order ${dashOrders[0]?.orderNumber || 'VB-100001'}`, time:'Yesterday' }
  ];
  list.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-icon" style="background:${a.bg};">${a.icon}</div>
      <div class="activity-info">
        <div class="activity-title">${a.title}</div>
        <div class="activity-desc">${a.desc}</div>
      </div>
      <div class="activity-time">${a.time}</div>
    </div>
  `).join('');
}

/* ── ALL ORDERS ── */
let ordersFilter = 'all';
let ordersSearch = '';

function renderOrders() {
  loadOrders();
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  let list = dashOrders;
  if (ordersFilter !== 'all') list = list.filter(o => o.status === ordersFilter);
  if (ordersSearch) {
    const q = ordersSearch.toLowerCase();
    list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
  }
  tbody.innerHTML = list.map(o => `
    <tr>
      <td class="td-primary">${o.orderNumber}</td>
      <td>${o.customerName}</td>
      <td>${o.city || '—'}</td>
      <td>${o.items?.map(i=>`${i.quantity}× ${i.productName}`).join(', ') || '—'}</td>
      <td>${formatPrice(o.total)}</td>
      <td><span class="status-badge status-${o.status}"><span class="status-dot"></span>${o.status}</span></td>
      <td>${o.createdAt?.slice(0,10) || ''}</td>
      <td>
        <div class="table-action-btns">
          <button class="table-action-btn" onclick="openOrderModal('${o.id || o.orderNumber}')" title="Update Status">✏️</button>
          <button class="table-action-btn btn-delete" onclick="confirmDeleteItem('${o.id || o.orderNumber}', 'order', '${o.orderNumber}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--gray-400);padding:2rem;">No orders found</td></tr>`;
}

function filterOrders(val)  { ordersFilter = val; renderOrders(); }
function searchOrders(val)  { ordersSearch = val; renderOrders(); }

/* ── ANALYTICS ── */
function renderAnalytics() {
  const totalRev    = dashAnalytics.reduce((s,a) => s+a.revenue, 0);
  const totalOrds   = dashAnalytics.reduce((s,a) => s+a.orders, 0);
  const avgOrd      = totalOrds ? Math.round(totalRev / totalOrds) : 0;
  const delivered   = dashOrders.filter(o => o.status === 'delivered').length;
  const fulfillRate = dashOrders.length ? Math.round(delivered / dashOrders.length * 100) : 0;

  document.getElementById('a-total-rev').textContent    = formatPrice(totalRev);
  document.getElementById('a-total-orders').textContent = totalOrds;
  document.getElementById('a-avg-order').textContent    = formatPrice(avgOrd);
  document.getElementById('a-conversion').textContent   = fulfillRate + '%';

  const tbody = document.getElementById('analytics-tbody');
  if (!tbody) return;
  tbody.innerHTML = dashAnalytics.map(a => `
    <tr>
      <td class="td-primary">${a.month} ${a.year}</td>
      <td>${formatPrice(a.revenue)}</td>
      <td>${a.orders}</td>
      <td>${a.newCustomers}</td>
      <td>${formatPrice(a.avgOrderValue)}</td>
    </tr>
  `).join('');
}

/* ── PRODUCTS ── */
let productsFilter = 'all';
let productsSearch = '';

function renderProducts() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  let list = dashProducts;
  if (productsFilter !== 'all') list = list.filter(p => p.category === productsFilter);
  if (productsSearch) {
    const q = productsSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${p.image}" alt="${p.name}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" onerror="this.style.display='none'"/>
          <span class="td-primary">${p.name}</span>
        </div>
      </td>
      <td><span class="tag tag-pink">${p.category}</span></td>
      <td>${formatPrice(p.price)}</td>
      <td>
        <span style="color:${p.stock < 10 ? 'var(--error)' : 'var(--success)'}; font-weight:600;">${p.stock}</span>
      </td>
      <td>${p.sold}</td>
      <td><span style="color:#F5C518;">★</span> ${p.rating}</td>
      <td>
        <span class="status-badge ${p.isActive ? 'status-delivered' : 'status-cancelled'}">
          ${p.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div class="table-action-btns">
          <button class="table-action-btn btn-edit" onclick="editProduct('${p.id}')" title="Edit">✏️</button>
          <button class="table-action-btn btn-delete" onclick="confirmDeleteItem('${p.id}', 'product', '${p.name.replace(/'/g,'')}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--gray-400);padding:2rem;">No products found</td></tr>`;
}

function filterProducts(val) { productsFilter = val; renderProducts(); }
function searchProducts(val) { productsSearch = val; renderProducts(); }

/* ── SAVE PRODUCT (Add + Edit) ── */
function saveProduct() {
  const id     = document.getElementById('pf-edit-id')?.value;
  const name   = document.getElementById('pf-name')?.value.trim();
  const cat    = document.getElementById('pf-category')?.value;
  const price  = Number(document.getElementById('pf-price')?.value);
  const origP  = Number(document.getElementById('pf-original-price')?.value) || null;
  const stock  = Number(document.getElementById('pf-stock')?.value);
  const shade  = document.getElementById('pf-shade')?.value.trim();
  const badge  = document.getElementById('pf-badge')?.value || null;
  const desc   = document.getElementById('pf-description')?.value.trim();
  const isNew  = document.getElementById('pf-is-new')?.checked;
  const active = document.getElementById('pf-is-active')?.checked;

  if (!name || !cat || !price || stock === undefined) {
    showToast('Fill all required fields', 'error');
    return;
  }

  if (id) {
    /* Edit existing */
    const idx = dashProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      dashProducts[idx] = { ...dashProducts[idx], name, category:cat, price, originalPrice:origP, stock, shade, badge, description:desc, isNew, isActive:active };
      showToast('Product updated! ✅', 'success');
    }
  } else {
    /* Add new */
    const newProd = {
      id: 'p' + Date.now(), name, category:cat, price, originalPrice:origP,
      stock, sold:0, rating:4.5, reviews:0, shade, badge, description:desc,
      isNew, isActive:active, color:'#E91E8C',
      image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=400&q=80'
    };
    dashProducts.unshift(newProd);
    showToast('Product added! 💄', 'success');
  }

  showPanel('products', null);
}

/* ── EDIT PRODUCT ── */
function editProduct(id) {
  const p = dashProducts.find(prod => prod.id === id);
  if (!p) return;

  resetProductForm();
  document.getElementById('pf-edit-id').value          = p.id;
  document.getElementById('pf-name').value             = p.name;
  document.getElementById('pf-category').value         = p.category;
  document.getElementById('pf-price').value            = p.price;
  document.getElementById('pf-original-price').value   = p.originalPrice || '';
  document.getElementById('pf-stock').value            = p.stock;
  document.getElementById('pf-shade').value            = p.shade || '';
  document.getElementById('pf-badge').value            = p.badge || '';
  document.getElementById('pf-description').value      = p.description || '';
  document.getElementById('pf-is-new').checked         = p.isNew;
  document.getElementById('pf-is-active').checked      = p.isActive;

  document.getElementById('product-form-title').textContent = 'Edit Product';
  showPanel('add-product', null);
}

function resetProductForm() {
  document.getElementById('pf-edit-id').value    = '';
  document.getElementById('pf-name').value       = '';
  document.getElementById('pf-category').value   = '';
  document.getElementById('pf-price').value      = '';
  document.getElementById('pf-original-price').value = '';
  document.getElementById('pf-stock').value      = '';
  document.getElementById('pf-shade').value      = '';
  document.getElementById('pf-badge').value      = '';
  document.getElementById('pf-description').value = '';
  document.getElementById('pf-is-new').checked   = false;
  document.getElementById('pf-is-active').checked = true;
  document.getElementById('product-form-title').textContent = 'Add New Product';
}

/* ── REVIEWS ── */
let reviewsFilter = 'all';

function renderReviews() {
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;
  let list = dashReviews;
  if (reviewsFilter !== 'all') {
    const minR = Number(reviewsFilter);
    list = reviewsFilter === '3' ? list.filter(r => r.rating <= 3) : list.filter(r => r.rating === minR);
  }
  tbody.innerHTML = list.map(r => `
    <tr>
      <td class="td-primary">${r.customerName}</td>
      <td>${r.productName}</td>
      <td><span style="color:#F5C518;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></td>
      <td style="max-width:300px; font-size:0.8rem; color:var(--gray-500);">${r.text.slice(0,100)}...</td>
      <td>${r.createdAt}</td>
      <td>
        <div class="table-action-btns">
          <button class="table-action-btn btn-delete" onclick="confirmDeleteItem('${r.id}', 'review', 'this review')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--gray-400);padding:2rem;">No reviews</td></tr>`;
}

function filterReviews(val) { reviewsFilter = val; renderReviews(); }

/* ── CUSTOMERS ── */
let customersSearch = '';

function renderCustomers() {
  const tbody = document.getElementById('customers-tbody');
  if (!tbody) return;
  let list = dashCustomers;
  if (customersSearch) {
    const q = customersSearch.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
  }
  tbody.innerHTML = list.map(c => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#E91E8C,#C2185B);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;flex-shrink:0;">${c.name[0]}</div>
          <span class="td-primary">${c.name}</span>
        </div>
      </td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.city}</td>
      <td>${c.totalOrders}</td>
      <td>${formatPrice(c.totalSpent)}</td>
      <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
      <td style="font-size:0.8rem;color:var(--gray-400);">${c.joinDate}</td>
    </tr>
  `).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--gray-400);padding:2rem;">No customers found</td></tr>`;
}

function searchCustomers(val) { customersSearch = val; renderCustomers(); }

/* ── ORDER STATUS MODAL ── */
function openOrderModal(idOrNum) {
  const order = dashOrders.find(o => o.id === idOrNum || o.orderNumber === idOrNum);
  if (!order) return;
  editingOrder = order;

  document.getElementById('order-modal-info').innerHTML = `
    <strong>${order.orderNumber}</strong> — ${order.customerName}<br/>
    Total: ${formatPrice(order.total)} | Items: ${order.items?.length || 0}
  `;
  document.getElementById('order-status-select').value = order.status;
  document.getElementById('order-modal')?.classList.add('active');
}

function closeOrderModal() {
  document.getElementById('order-modal')?.classList.remove('active');
  editingOrder = null;
}

function updateOrderStatus() {
  if (!editingOrder) return;
  const newStatus = document.getElementById('order-status-select')?.value;
  editingOrder.status = newStatus;

  /* Update in localStorage if it's a user order */
  const saved = JSON.parse(localStorage.getItem('vb_orders') || '[]');
  const idx   = saved.findIndex(o => o.orderNumber === editingOrder.orderNumber);
  if (idx !== -1) {
    saved[idx].status = newStatus;
    localStorage.setItem('vb_orders', JSON.stringify(saved));
  }

  closeOrderModal();
  showToast(`Order status updated to "${newStatus}" ✅`, 'success');

  /* Re-render current panel */
  const active = document.querySelector('.dash-panel.active')?.id?.replace('panel-', '');
  if (active === 'orders')   renderOrders();
  if (active === 'overview') renderOverview();
}

/* ── DELETE CONFIRM ── */
function confirmDeleteItem(id, type, label) {
  deletingItem = id;
  deleteType   = type;
  document.getElementById('delete-modal-msg').textContent = `Are you sure you want to delete "${label}"? This cannot be undone.`;
  document.getElementById('delete-modal')?.classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('delete-modal')?.classList.remove('active');
  deletingItem = null;
  deleteType   = '';
}

function confirmDelete() {
  if (!deletingItem) return;

  if (deleteType === 'product') {
    dashProducts = dashProducts.filter(p => p.id !== deletingItem);
    showToast('Product deleted', 'success');
    renderProducts();
  } else if (deleteType === 'order') {
    dashOrders = dashOrders.filter(o => o.id !== deletingItem && o.orderNumber !== deletingItem);
    const saved = JSON.parse(localStorage.getItem('vb_orders') || '[]');
    localStorage.setItem('vb_orders', JSON.stringify(saved.filter(o => o.orderNumber !== deletingItem)));
    showToast('Order deleted', 'success');
    renderOrders();
  } else if (deleteType === 'review') {
    dashReviews = dashReviews.filter(r => r.id !== deletingItem);
    showToast('Review deleted', 'success');
    renderReviews();
  }

  closeDeleteModal();
}

/* ── SEARCH ── */
function dashSearch(val) {
  if (!val) return;
  const q = val.toLowerCase();
  /* Search products */
  const found = dashProducts.filter(p => p.name.toLowerCase().includes(q));
  if (found.length > 0) {
    showPanel('products', null);
    productsSearch = val;
    renderProducts();
  }
}

/* ── SETTINGS ── */
function saveSettings() {
  const empCode   = document.getElementById('emp-code-setting')?.value.trim();
  if (empCode) localStorage.setItem('vb_emp_code', empCode);
  showToast('Settings saved ✅', 'success');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Auth check */
  const session = JSON.parse(localStorage.getItem('vb_session') || 'null');
  if (!session || session.role !== 'owner') {
    /* Uncomment in production to enforce auth: */
    /* window.location.href = 'login.html'; return; */
  }

  /* Set user info in sidebar */
  const name = session?.name || 'Owner';
  const initial = name[0].toUpperCase();
  document.getElementById('sidebar-name').textContent  = name;
  document.getElementById('sidebar-avatar').textContent = initial;
  document.getElementById('topbar-avatar').textContent  = initial;

  /* Load initial panel */
  renderOverview();

  /* Close modals on overlay click */
  ['order-modal', 'delete-modal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        if (id === 'order-modal')  closeOrderModal();
        if (id === 'delete-modal') closeDeleteModal();
      }
    });
  });
});
