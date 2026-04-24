/* wishlist.js — Wishlist page re-render helper (MongoDB API version) */
// Override vbToggleWish to re-render wishlist page if we're on it
const _origWishToggle = window.vbToggleWish;
window.vbToggleWish = function (id, btn) {
  const session = VBAuth.session();
  if (!session) {
    VBToast.show('Please login first', 'warning');
    window.location.href = 'login.html';
    return;
  }
  const added = VBWish.toggle(id);
  VBToast.show(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
  // Re-render wishlist page if we are on it
  if (typeof renderWishlist === 'function') renderWishlist();
};