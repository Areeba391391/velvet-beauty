/* ============================================
   VELVET BEAUTY — checkout.js
   Checkout page: form validation, order
   summary render, place order
   ============================================ */

let deliveryFee    = 0;
let paymentMethod  = 'cod';
let checkoutDiscount = 0;

/* ── Render order review sidebar ── */
function renderCheckoutOrder() {
  const cart = getCart();

  /* Items */
  const itemsEl = document.getElementById('checkout-order-items');
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="order-review-item">
        <div class="order-review-item-img">
          <img src="${item.image || ''}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=200&q=80'" />
          <span class="order-qty-badge">${item.quantity}</span>
        </div>
        <span class="order-review-item-name">${item.name}</span>
        <span class="order-review-item-price">${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('') || '<p style="color:var(--gray-400); font-size:0.875rem;">Cart is empty</p>';
  }

  /* Totals */
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = Math.round(subtotal * checkoutDiscount / 100);
  const total    = subtotal - discount + deliveryFee;

  const el = (id) => document.getElementById(id);
  if (el('co-subtotal'))  el('co-subtotal').textContent = formatPrice(subtotal);
  if (el('co-delivery'))  el('co-delivery').textContent = deliveryFee === 0 ? 'Free 🎉' : formatPrice(deliveryFee);
  if (el('co-total'))     el('co-total').textContent    = formatPrice(total);

  const discRow = el('co-discount-row');
  if (discRow) discRow.style.display = checkoutDiscount > 0 ? '' : 'none';
  if (el('co-discount')) el('co-discount').textContent = `-${formatPrice(discount)}`;
}

/* ── Delivery option selection ── */
function selectDelivery(el, type, fee) {
  document.querySelectorAll('.delivery-option[data-delivery]').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  deliveryFee = fee;
  /* Update standard price label */
  const stdPrice = document.getElementById('delivery-std-price');
  renderCheckoutOrder();
}

/* ── Payment method selection ── */
function selectPayment(el, method) {
  document.querySelectorAll('.delivery-option[data-pay]').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  paymentMethod = method;
}

/* ── Validate form ── */
function validateCheckoutForm() {
  let valid = true;

  const fields = [
    { id: 'first-name', err: 'err-first-name', check: v => v.length >= 2 },
    { id: 'last-name',  err: 'err-last-name',  check: v => v.length >= 2 },
    { id: 'phone',      err: 'err-phone',       check: v => /^[0-9\-\+]{10,13}$/.test(v.replace(/\s/g,'')) },
    { id: 'address',    err: 'err-address',     check: v => v.length >= 5 },
    { id: 'city',       err: 'err-city',        check: v => v !== '' }
  ];

  fields.forEach(({ id, err, check }) => {
    const input  = document.getElementById(id);
    const errEl  = document.getElementById(err);
    const val    = input?.value.trim() || '';
    const ok     = check(val);
    input?.classList.toggle('error', !ok);
    if (errEl) errEl.classList.toggle('hidden', ok);
    if (!ok) valid = false;
  });

  return valid;
}

/* ── Place order ── */
function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'warning');
    return;
  }

  if (!validateCheckoutForm()) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  /* Build order object */
  const firstName = document.getElementById('first-name')?.value.trim();
  const lastName  = document.getElementById('last-name')?.value.trim();
  const phone     = document.getElementById('phone')?.value.trim();
  const address   = document.getElementById('address')?.value.trim();
  const city      = document.getElementById('city')?.value;
  const notes     = document.getElementById('order-notes')?.value.trim();

  const subtotal  = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total     = subtotal + deliveryFee;
  const orderNum  = 'VB-' + String(Date.now()).slice(-6);

  const order = {
    orderNumber:   orderNum,
    customerName:  `${firstName} ${lastName}`,
    phone, address, city, notes,
    items:         cart,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    createdAt:     new Date().toISOString()
  };

  /* Save to sessionStorage for success page */
  sessionStorage.setItem('lastOrder', JSON.stringify(order));

  /* Save order to localStorage orders list (for dashboard) */
  const orders = JSON.parse(localStorage.getItem('vb_orders') || '[]');
  orders.unshift({
    id:           'o' + Date.now(),
    orderNumber:  orderNum,
    customerName: order.customerName,
    city,
    items:        cart.map(i => ({ productName: i.name, quantity: i.quantity, price: i.price })),
    total,
    status:       'processing',
    createdAt:    new Date().toISOString().split('T')[0]
  });
  localStorage.setItem('vb_orders', JSON.stringify(orders));

  /* Clear cart */
  saveCart([]);

  /* Redirect */
  showToast('Order placed! Redirecting... 🎉', 'success');
  setTimeout(() => {
    window.location.href = 'order-success.html';
  }, 1000);
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Cart is empty! Add products first.', 'warning');
    setTimeout(() => window.location.href = 'shop.html', 1500);
    return;
  }
  /* Apply coupon discount from cart page if saved */
  checkoutDiscount = Number(sessionStorage.getItem('vb_coupon_pct') || 0);
  renderCheckoutOrder();

  /* Cart badge */
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
});
