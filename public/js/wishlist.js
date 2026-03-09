/* ============================================
   VELVET BEAUTY — wishlist.js
   Shared wishlist logic (localStorage).
   Included on every page.
   ============================================ */

/* ── Wishlist State ── */
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('vb_wishlist') || '[]');
  } catch {
    return [];
  }
}

function saveWishlist(wl) {
  localStorage.setItem('vb_wishlist', JSON.stringify(wl));
  updateWishlistBadge();
}

/* ── Toggle wishlist ── */
function toggleWishlist(product) {
  const wl = getWishlist();
  const idx = wl.findIndex(item => item.id === product.id);

  if (idx === -1) {
    wl.push({
      id:           product.id,
      name:         product.name,
      price:        product.price,
      originalPrice: product.originalPrice || null,
      image:        product.image || '',
      category:     product.category
    });
    saveWishlist(wl);
    showToast(`<strong>${product.name}</strong> added to wishlist 💝`, 'success');
    return true; /* added */
  } else {
    wl.splice(idx, 1);
    saveWishlist(wl);
    showToast(`Removed from wishlist`, 'default');
    return false; /* removed */
  }
}

/* ── Check if in wishlist ── */
function isInWishlist(productId) {
  return getWishlist().some(item => item.id === productId);
}

/* ── Remove from wishlist ── */
function removeFromWishlist(productId) {
  const wl = getWishlist().filter(item => item.id !== productId);
  saveWishlist(wl);
}

/* ── Move all wishlist items to cart ── */
function moveAllToCart() {
  const wl = getWishlist();
  if (wl.length === 0) {
    showToast('Wishlist is empty', 'warning');
    return;
  }
  wl.forEach(item => addToCart(item));
  saveWishlist([]);
  showToast(`${wl.length} items moved to cart 🛒`, 'success');
  if (typeof renderWishlistPage === 'function') renderWishlistPage();
}

/* ── Update nav badge ── */
function updateWishlistBadge() {
  const wl    = getWishlist();
  const badge = document.getElementById('wishlist-count');
  if (badge) {
    badge.textContent = wl.length;
    badge.style.display = wl.length > 0 ? 'flex' : 'none';
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistBadge();
});
