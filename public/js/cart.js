/* ============================================
   VELVET BEAUTY — cart.js
   Shared cart logic (localStorage).
   Included on every page.
   ============================================ */

/* ── Toast helper ── */
function showToast(msg, type = 'default', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { default: '💄', success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '💄'}</span> ${msg}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ── Cart State ── */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('vb_cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('vb_cart', JSON.stringify(cart));
  updateCartBadge();
}

/* ── Add to cart ── */
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      image:    product.image || '',
      category: product.category,
      quantity
    });
  }

  saveCart(cart);
  showToast(`<strong>${product.name}</strong> added to cart!`, 'success');

  /* Animate nav badge */
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; /* reflow to restart animation */
    badge.classList.add('bump');
  }
}

/* ── Remove from cart ── */
function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

/* ── Update quantity ── */
function updateCartQty(productId, newQty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }
  item.quantity = newQty;
  saveCart(cart);
}

/* ── Clear cart ── */
function clearCart() {
  saveCart([]);
  if (typeof renderCartPage === 'function') renderCartPage();
  showToast('Cart cleared', 'default');
}

/* ── Get cart totals ── */
function getCartTotals(discountPercent = 0) {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.round(subtotal * discountPercent / 100);
  const delivery = subtotal >= 2000 ? 0 : 200;
  const total    = subtotal - discount + delivery;
  return { subtotal, discount, delivery, total };
}

/* ── Update nav badge count ── */
function updateCartBadge() {
  const cart  = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/* ── Coupon codes ── */
const COUPONS = {
  'VELVET10': 10,
  'BEAUTY20': 20,
  'VIP30':    30
};

let appliedCoupon = null;

function applyCoupon() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) { showToast('Enter a coupon code', 'warning'); return; }
  if (COUPONS[code]) {
    appliedCoupon = { code, percent: COUPONS[code] };
    showToast(`Coupon "${code}" applied! ${COUPONS[code]}% off 🎉`, 'success');
    if (typeof renderCartSummary === 'function') renderCartSummary();
  } else {
    showToast('Invalid coupon code', 'error');
  }
}

/* ── Init: run on every page ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  /* Sticky navbar scroll effect */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  /* Mobile nav toggle */
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      menu.classList.toggle('open');
    });
  }

  /* Close mobile menu on outside click */
  document.addEventListener('click', (e) => {
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
});
