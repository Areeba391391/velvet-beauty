/* ============================================
   VELVET BEAUTY — wishlist-page.js
   Wishlist page: render saved items
   ============================================ */

function renderWishlistPage() {
  const wl      = getWishlist();
  const grid    = document.getElementById('wishlist-grid');
  const empty   = document.getElementById('wishlist-empty-state');
  const countEl = document.getElementById('wishlist-item-count');

  if (countEl) countEl.textContent = `${wl.length} item${wl.length !== 1 ? 's' : ''} saved`;

  if (wl.length === 0) {
    if (grid)  grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    const moveBtn = document.getElementById('move-all-btn');
    if (moveBtn) moveBtn.style.display = 'none';
    return;
  }

  if (empty) empty.classList.add('hidden');
  const moveBtn = document.getElementById('move-all-btn');
  if (moveBtn) moveBtn.style.display = '';

  if (grid) {
    grid.innerHTML = wl.map(item => {
      const discount = item.originalPrice
        ? `<span style="font-size:0.75rem; color:var(--success); margin-left:0.5rem;">${discountPercent(item.price, item.originalPrice)}</span>`
        : '';
      return `
        <div class="wishlist-item-card" id="wl-card-${item.id}">
          <div class="wishlist-item-image">
            <img
              src="${item.image || 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=400&q=80'}"
              alt="${item.name}"
              onerror="this.src='https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=400&q=80'"
            />
            <!-- Remove from wishlist -->
            <button class="wishlist-remove-btn" onclick="removeWishlistItem('${item.id}')" title="Remove">💔</button>
          </div>
          <div class="wishlist-item-body">
            <div class="wishlist-item-category">${item.category || ''}</div>
            <a href="product-detail.html?id=${item.id}" class="wishlist-item-name" style="display:block; text-decoration:none;">
              ${item.name}
            </a>
            <div class="wishlist-item-price-row">
              <span class="wishlist-item-price">
                ${formatPrice(item.price)}${discount}
              </span>
              <button class="wishlist-move-btn" onclick="moveOneToCart('${item.id}')">
                Add to Cart 🛒
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/* ── Remove single wishlist item ── */
function removeWishlistItem(id) {
  const card = document.getElementById(`wl-card-${id}`);
  if (card) {
    card.style.opacity   = '0';
    card.style.transform = 'scale(0.9)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      removeFromWishlist(id);
      renderWishlistPage();
    }, 300);
  } else {
    removeFromWishlist(id);
    renderWishlistPage();
  }
}

/* ── Move one item to cart ── */
function moveOneToCart(id) {
  const wl   = getWishlist();
  const item = wl.find(i => i.id === id);
  if (!item) return;

  addToCart(item, 1);
  removeFromWishlist(id);
  renderWishlistPage();
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', renderWishlistPage);
