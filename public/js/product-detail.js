/* ============================================
   VELVET BEAUTY — product-detail.js
   Single product page logic
   ============================================ */

let pdProductId  = null;
let pdQty        = 1;
let pdRating     = 0;

/* ── Load product from URL param ── */
function loadProductDetail() {
  const params    = new URLSearchParams(window.location.search);
  const id        = params.get('id') || 'p001';
  const product   = getProductById(id);
  if (!product) return;

  pdProductId = id;

  /* Update page title */
  document.title = `${product.name} — Velvet Beauty`;

  /* Breadcrumb */
  const bc = document.getElementById('pd-breadcrumb');
  if (bc) bc.textContent = product.name;

  /* Main image */
  const img = document.getElementById('pd-main-img');
  if (img) { img.src = product.image; img.alt = product.name; }

  /* Badge */
  const badge = document.getElementById('pd-badge');
  if (badge) {
    if (product.badge) {
      badge.textContent  = product.badge;
      badge.className    = `product-main-image-badge badge-${product.badge.toLowerCase().replace(' ','-')}`;
    } else {
      badge.style.display = 'none';
    }
  }

  /* Thumbnail clicks */
  document.querySelectorAll('.product-thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (img) img.src = thumb.querySelector('img')?.src || product.image;
    });
  });

  /* Name */
  const name = document.getElementById('pd-name');
  if (name) name.textContent = product.name;

  /* Rating */
  const ratingEl = document.getElementById('pd-rating');
  if (ratingEl) ratingEl.textContent = product.rating;
  const reviewCount = document.getElementById('pd-review-count');
  if (reviewCount) reviewCount.textContent = `(${product.reviews} reviews)`;

  /* Stock badge */
  const stockBadge = document.getElementById('pd-stock-badge');
  if (stockBadge) {
    if (product.stock > 0) {
      stockBadge.innerHTML = `<span class="in-stock-dot"></span> In Stock (${product.stock} left)`;
      stockBadge.style.color = 'var(--success)';
    } else {
      stockBadge.innerHTML = '⚠️ Out of Stock';
      stockBadge.style.color = 'var(--error)';
    }
  }

  /* Price */
  document.getElementById('pd-price').textContent         = formatPrice(product.price);
  const origPriceEl = document.getElementById('pd-original-price');
  const discountEl  = document.getElementById('pd-discount');
  if (product.originalPrice) {
    origPriceEl.textContent = formatPrice(product.originalPrice);
    discountEl.textContent  = discountPercent(product.price, product.originalPrice);
  } else {
    origPriceEl.style.display = 'none';
    discountEl.style.display  = 'none';
  }

  /* Description */
  const desc = document.getElementById('pd-desc');
  if (desc) desc.textContent = product.description || '';

  /* Shade section (only for lip/cheeks products) */
  if (!product.shade) {
    const shadeSection = document.getElementById('pd-shade-section');
    if (shadeSection) shadeSection.style.display = 'none';
  }

  /* Wishlist button state */
  const wlBtn = document.getElementById('pd-wishlist-btn');
  if (wlBtn) {
    const inWl = isInWishlist(id);
    wlBtn.classList.toggle('active', inWl);
    wlBtn.innerHTML = inWl
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="#E91E8C" stroke="#E91E8C" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  }

  /* Load related products */
  loadRelated(product);
}

/* ── Shade selector ── */
function selectShade(el) {
  document.querySelectorAll('.shade-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('selected-shade-name').textContent = el.dataset.shade || '';
}

/* ── Qty control ── */
function changeQty(delta) {
  pdQty = Math.max(1, Math.min(10, pdQty + delta));
  document.getElementById('pd-qty').textContent = pdQty;
}

/* ── Add to cart from detail page ── */
function addToCartFromDetail() {
  const product = getProductById(pdProductId);
  if (!product) return;
  addToCart(product, pdQty);

  /* Button feedback */
  const btn = document.getElementById('pd-add-cart-btn');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Added!';
    btn.style.background = 'var(--success)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
    }, 1500);
  }
}

/* ── Wishlist from detail page ── */
function toggleWishlistFromDetail() {
  const product = getProductById(pdProductId);
  if (!product) return;
  const added = toggleWishlist(product);

  const wlBtn = document.getElementById('pd-wishlist-btn');
  if (wlBtn) {
    wlBtn.classList.toggle('active', added);
    wlBtn.innerHTML = added
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="#E91E8C" stroke="#E91E8C" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  }
}

/* ── Load related products ── */
function loadRelated(product) {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  const related = VB_PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  grid.innerHTML = related.map(buildProductCard).join('');
}

/* ── Review modal ── */
function openReviewModal() {
  document.getElementById('review-modal')?.classList.add('active');
}

function closeReviewModal() {
  document.getElementById('review-modal')?.classList.remove('active');
}

function setReviewRating(n) {
  pdRating = n;
  document.querySelectorAll('#star-picker span').forEach((star, i) => {
    star.style.color = i < n ? '#F5C518' : '#ddd';
  });
}

function submitReview() {
  const name   = document.getElementById('review-name')?.value.trim();
  const text   = document.getElementById('review-text-input')?.value.trim();
  if (!name || !text || pdRating === 0) {
    showToast('Please fill all fields and select a rating', 'warning');
    return;
  }

  /* Add review card to DOM */
  const list = document.getElementById('reviews-list');
  if (list) {
    const colors = ['#E91E8C','#C9956C','#6B2D5E'];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const stars  = '★'.repeat(pdRating) + '☆'.repeat(5 - pdRating);
    const card   = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-card-header">
        <div class="reviewer-info">
          <div class="reviewer-avatar" style="background:${color};">${name[0].toUpperCase()}</div>
          <div>
            <div class="reviewer-name">${name}</div>
            <div class="reviewer-date">Just now</div>
          </div>
        </div>
        <div style="color:#F5C518; font-size:14px;">${stars}</div>
      </div>
      <p class="review-text">${text}</p>
    `;
    list.insertBefore(card, list.firstChild);
  }

  closeReviewModal();
  showToast('Review submitted! Thank you 💝', 'success');
}

function markHelpful(btn, count) {
  btn.textContent = `👍 ${count + 1}`;
  btn.disabled = true;
  btn.style.color = 'var(--pink-primary)';
  btn.style.borderColor = 'var(--pink-primary)';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetail();

  /* Close modal on overlay click */
  document.getElementById('review-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeReviewModal();
  });
});
