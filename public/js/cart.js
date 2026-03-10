/* ============================================================
   VELVET BEAUTY — cart.js
   Cart: Items · Qty · Remove · Coupon · Summary
   ============================================================ */

let activeCoupon = null;

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  VBAuth.guard(['customer','employee','owner']);
  renderCart();
});

function renderCart() {
  const cart    = VBCart.get();
  const emptyEl = document.getElementById('cart-empty');
  const layoutEl = document.getElementById('cart-layout');

  if (!cart.length) {
    if (emptyEl)  emptyEl.classList.remove('hidden');
    if (layoutEl) layoutEl.style.display = 'none';
    return;
  }
  if (emptyEl)  emptyEl.classList.add('hidden');
  if (layoutEl) layoutEl.style.display = '';

  // Item count label
  const countEl = document.getElementById('cart-item-count');
  if (countEl) countEl.textContent = ` (${cart.length} item${cart.length!==1?'s':''})`;

  // Items
  const listEl = document.getElementById('cart-items-list');
  if (listEl) {
    listEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/88x88/FDE8F3/E91E8C?text=VB'"/>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.category||''}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-unit">Rs. ${item.price.toLocaleString()} each</div>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${item.id}', ${item.qty-1})">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', ${item.qty+1})">+</button>
        </div>
        <div class="cart-item-price">
          Rs. ${(item.price * item.qty).toLocaleString()}
          <div class="cart-item-price-sub">${item.qty > 1 ? `${item.qty} × Rs. ${item.price.toLocaleString()}` : ''}</div>
        </div>
        <button class="cart-remove-btn" onclick="removeItem('${item.id}')" title="Remove">✕</button>
      </div>`).join('');
  }

  updateSummary();
}

function changeQty(id, qty) {
  if (qty < 1) { removeItem(id); return; }
  VBCart.updateQty(id, qty);
  renderCart();
}

function removeItem(id) {
  VBCart.remove(id);
  VBToast.show('Item removed from cart', 'info');
  renderCart();
}

function clearCart() {
  VBModal.confirm('Clear your entire cart?', () => {
    VBCart.clear();
    activeCoupon = null;
    VBToast.show('Cart cleared', 'info');
    renderCart();
  });
}

// ── Coupon ────────────────────────────────────────────────────
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  const code  = (input?.value || '').trim().toUpperCase();
  const valid = { VELVET10:10, BEAUTY20:20, VIP30:30, FIRST15:15 };
  if (!code) { VBToast.show('Please enter a coupon code', 'warning'); return; }
  if (!valid[code]) { VBToast.show('Invalid coupon code', 'error'); return; }
  activeCoupon = code;
  document.getElementById('coupon-normal').classList.add('hidden');
  document.getElementById('coupon-applied').classList.remove('hidden');
  document.getElementById('applied-code-name').textContent = code;
  document.getElementById('applied-disc-text').textContent = valid[code] + '%';
  VBToast.show(`Coupon ${code} applied — ${valid[code]}% off! 🎉`, 'success');
  updateSummary();
}

function removeCoupon() {
  activeCoupon = null;
  document.getElementById('coupon-normal').classList.remove('hidden');
  document.getElementById('coupon-applied').classList.add('hidden');
  document.getElementById('coupon-input').value = '';
  VBToast.show('Coupon removed', 'info');
  updateSummary();
}

// ── Summary ───────────────────────────────────────────────────
function updateSummary() {
  const t = VBCart.totals(activeCoupon);

  document.getElementById('os-item-count').textContent = VBCart.get().length;
  document.getElementById('os-subtotal').textContent   = fmtPrice(t.subtotal);
  document.getElementById('os-delivery').textContent   = t.deliveryFee === 0 ? '🎁 Free' : fmtPrice(t.deliveryFee);
  document.getElementById('os-total').textContent      = fmtPrice(t.total);

  const discRow = document.getElementById('os-disc-row');
  const discEl  = document.getElementById('os-disc');
  if (t.discount > 0) {
    discRow.style.display = '';
    discEl.textContent = `−${fmtPrice(t.discount)}`;
  } else {
    discRow.style.display = 'none';
  }
}

// ── Checkout ──────────────────────────────────────────────────
function goCheckout() {
  if (!VBCart.get().length) { VBToast.show('Your cart is empty', 'warning'); return; }
  // Pass coupon in session storage for checkout
  if (activeCoupon) sessionStorage.setItem('vb_coupon', activeCoupon);
  else sessionStorage.removeItem('vb_coupon');
  window.location.href = 'checkout.html';
}
