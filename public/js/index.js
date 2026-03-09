/* ============================================
   VELVET BEAUTY — index.js
   Homepage: featured products, bestsellers,
   countdown timer, newsletter
   ============================================ */

/* ── Build a product card HTML ── */
function buildProductCard(product) {
  const inWl     = isInWishlist(product.id);
  const discount = discountPercent(product.price, product.originalPrice);
  const badge    = product.badge
    ? `<span class="product-card-badge badge-${product.badge.toLowerCase().replace(' ','-')}">${product.badge}</span>`
    : '';

  return `
    <div class="product-card" id="card-${product.id}">
      <div class="product-card-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=400&q=80'"
        />
        ${badge}

        <!-- Quick actions: wishlist & quick view -->
        <div class="product-card-actions">
          <button
            class="product-action-btn ${inWl ? 'active' : ''}"
            title="${inWl ? 'Remove from Wishlist' : 'Add to Wishlist'}"
            id="wl-btn-${product.id}"
            onclick="handleWishlistBtn('${product.id}', this)"
          >
            ${inWl ? '💝' : '🤍'}
          </button>
          <button
            class="product-action-btn"
            title="Quick View"
            onclick="window.location.href='product-detail.html?id=${product.id}'"
          >
            👁
          </button>
        </div>
      </div>

      <div class="product-card-body">
        <div class="product-category">${product.category}</div>
        <a href="product-detail.html?id=${product.id}" class="product-name" style="display:block; text-decoration:none;">
          ${product.name}
        </a>

        <div class="product-stars">
          <span class="star" style="color:#F5C518;">${renderStars(product.rating)}</span>
          <span class="star-count">(${product.reviews})</span>
        </div>

        <div class="product-price-row">
          <div class="product-price">
            <span class="price-current">${formatPrice(product.price)}</span>
            ${product.originalPrice
              ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>`
              : ''}
          </div>
          <button
            class="add-to-cart-btn"
            title="Add to Cart"
            onclick="handleAddToCart('${product.id}')"
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ── Wishlist toggle from card ── */
function handleWishlistBtn(productId, btn) {
  const product = getProductById(productId);
  if (!product) return;
  const added = toggleWishlist(product);
  btn.textContent = added ? '💝' : '🤍';
  btn.classList.toggle('active', added);
}

/* ── Add to cart from card ── */
function handleAddToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  addToCart(product, 1);
}

/* ── Featured tabs ── */
let currentTab = 'all';

function renderFeatured(tab = 'all') {
  const grid = document.getElementById('featured-products-grid');
  if (!grid) return;

  const products = tab === 'all'
    ? VB_PRODUCTS.slice(0, 8)
    : VB_PRODUCTS.filter(p => p.category === tab).slice(0, 8);

  grid.innerHTML = products.map(buildProductCard).join('');
}

document.addEventListener('DOMContentLoaded', () => {

  /* ── Featured tabs ── */
  const tabs = document.querySelectorAll('.featured-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderFeatured(tab.dataset.tab);
    });
  });
  renderFeatured('all');

  /* ── Bestsellers ── */
  const bsGrid = document.getElementById('bestseller-grid');
  if (bsGrid) {
    const bestsellers = [...VB_PRODUCTS]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 4);
    bsGrid.innerHTML = bestsellers.map(buildProductCard).join('');
  }

  /* ── Countdown Timer ── */
  let endTime = Number(localStorage.getItem('vb_countdown_end'));
  if (!endTime || endTime < Date.now()) {
    /* Set to 24 hours from now */
    endTime = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('vb_countdown_end', endTime);
  }

  function updateCountdown() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      localStorage.removeItem('vb_countdown_end');
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');

    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(s).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

});

/* ── Newsletter ── */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (!input || !input.value) return;
  showToast('Thank you for subscribing! 💌', 'success');
  input.value = '';
}
