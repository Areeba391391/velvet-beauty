/* ============================================
   VELVET BEAUTY — cart-page.js
   Cart page: render items, qty controls,
   coupon, order summary
   ============================================ */

let cartDiscount = 0; /* percent applied by coupon */

/* ── Render full cart page ── */
function renderCartPage() {
  const cart      = getCart();
  const layout    = document.getElementById('cart-layout');
  const emptyEl   = document.getElementById('cart-empty-state');
  const countLabel = document.getElementById('cart-item-count-label');

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (countLabel) countLabel.textContent = `(${itemCount} item${itemCount !== 1 ? 's' : ''})`;

  if (cart.length === 0) {
    if (layout)  layout.style.display  = 'none';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (layout)  layout.style.display  = '';
  if (emptyEl) emptyEl.classList.add('hidden');

  renderCartItems(cart);
  renderCartSummary();
}

/* ── Render cart item rows ── */
function renderCartItems(cart) {
  const list = document.getElementById('cart-items-list');
  if (!list) return;

  list.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-row-${item.id}">
      <!-- Product -->
      <div class="cart-item-product">
        <div class="cart-item-image">
          <img
            src="${item.image || 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=200&q=80'}"
            alt="${item.name}"
            onerror="this.src='https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=200&q=80'"
          />
        </div>
        <div>
          <a href="product-detail.html?id=${item.id}" class="cart-item-name">${item.name}</a>
          <div class="cart-item-meta">${item.category || ''}</div>
        </div>
      </div>
      <!-- Unit price -->
      <div class="cart-item-price">${formatPrice(item.price)}</div>
      <!-- Qty -->
      <div class="qty-control">
        <button class="qty-btn" onclick="changeItemQty('${item.id}', ${item.quantity - 1})">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" onclick="changeItemQty('${item.id}', ${item.quantity + 1})">+</button>
      </div>
      <!-- Total -->
      <div class="cart-item-total">${formatPrice(item.price * item.quantity)}</div>
      <!-- Remove -->
      <button class="cart-item-remove" onclick="removeItem('${item.id}')" title="Remove">×</button>
    </div>
  `).join('');
}

/* ── Render order summary ── */
function renderCartSummary() {
  const { subtotal, discount, delivery, total } = getCartTotals(cartDiscount);

  const subtotalEl  = document.getElementById('summary-subtotal');
  const discountEl  = document.getElementById('summary-discount');
  const discountRow = document.getElementById('summary-discount-row');
  const deliveryEl  = document.getElementById('summary-delivery');
  const totalEl     = document.getElementById('summary-total');

  if (subtotalEl)  subtotalEl.textContent  = formatPrice(subtotal);
  if (totalEl)     totalEl.textContent     = formatPrice(total);
  if (deliveryEl)  deliveryEl.textContent  = delivery === 0 ? 'Free 🎉' : formatPrice(delivery);

  if (cartDiscount > 0 && discountRow && discountEl) {
    discountRow.style.display = '';
    discountEl.textContent    = `-${formatPrice(discount)} (${cartDiscount}% off)`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }
}

/* ── Item qty change ── */
function changeItemQty(id, newQty) {
  if (newQty <= 0) {
    removeItem(id);
    return;
  }
  updateCartQty(id, newQty);
  renderCartPage();
}

/* ── Remove item ── */
function removeItem(id) {
  const row = document.getElementById(`cart-row-${id}`);
  if (row) {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    row.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      removeFromCart(id);
      renderCartPage();
    }, 300);
  } else {
    removeFromCart(id);
    renderCartPage();
  }
}

/* ── Apply coupon (overrides shared cart.js version for cart page) ── */
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  const code  = input?.value.trim().toUpperCase();
  if (!code) { showToast('Enter a coupon code', 'warning'); return; }

  if (COUPONS[code]) {
    cartDiscount = COUPONS[code];
    showToast(`Coupon "${code}" applied! ${COUPONS[code]}% off 🎉`, 'success');
    renderCartSummary();
  } else {
    showToast('Invalid coupon code ❌', 'error');
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', renderCartPage);
