/* ============================================================
   VELVET BEAUTY — wishlist.js
   Wishlist: Render · Remove · Move to Cart · Move All
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  VBAuth.guard(['customer','employee','owner']);
  renderWishlist();
});

function renderWishlist() {
  const ids    = VBWish.get();
  const emptyEl   = document.getElementById('wishlist-empty');
  const gridEl    = document.getElementById('wishlist-grid');
  const toolbarEl = document.getElementById('wishlist-toolbar');
  const countEl   = document.getElementById('wishlist-count-label');

  if (!ids.length) {
    if (emptyEl)   emptyEl.classList.remove('hidden');
    if (gridEl)    gridEl.innerHTML = '';
    if (toolbarEl) toolbarEl.style.display = 'none';
    return;
  }
  if (emptyEl)   emptyEl.classList.add('hidden');
  if (toolbarEl) toolbarEl.style.display = '';
  if (countEl)   countEl.textContent = `${ids.length} item${ids.length!==1?'s':''}`;

  const products = ids.map(id => VBProducts.getById(id)).filter(Boolean);
  if (!gridEl) return;
  gridEl.innerHTML = products.map(p => `
    <div class="wl-card" data-id="${p.id}">
      <div class="wl-img">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/400x300/FDE8F3/E91E8C?text=VB'" loading="lazy"/>
        <button class="wl-remove-btn" onclick="removeFromWish('${p.id}')" title="Remove">✕</button>
      </div>
      <div class="wl-body">
        <div class="wl-cat">${p.category}</div>
        <a class="wl-name" href="product-detail.html?id=${p.id}">${p.name}</a>
        <div class="wl-price-row">
          <span class="wl-price-now">Rs. ${p.price.toLocaleString()}</span>
          ${p.origPrice ? `<span class="wl-price-was">Rs. ${p.origPrice.toLocaleString()}</span>` : ''}
        </div>
        <button class="btn btn-primary btn-sm wl-add-btn" onclick="moveToCart('${p.id}')">
          Add to Cart 🛒
        </button>
      </div>
    </div>`).join('');
}

function removeFromWish(id) {
  VBWish.remove(id);
  VBToast.show('Removed from wishlist', 'info');
  renderWishlist();
}

function moveToCart(id) {
  const p = VBProducts.getById(id);
  if (!p) return;
  VBCart.add(p, 1);
  VBWish.remove(id);
  VBToast.show(`${p.name} moved to cart 🛒`, 'success');
  renderWishlist();
}

function moveAllToCart() {
  const ids = VBWish.get();
  if (!ids.length) return;
  VBWish.moveAll();
  VBToast.show('All items moved to cart 🛒', 'success');
  renderWishlist();
}

function clearWishlist() {
  VBModal.confirm('Clear your entire wishlist?', () => {
    VBWish.save([]);
    VBToast.show('Wishlist cleared', 'info');
    renderWishlist();
  });
}
