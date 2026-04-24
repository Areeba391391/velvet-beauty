/* ============================================================
   VELVET BEAUTY — product-detail.js  (FIXED + REVIEWS ENABLED)
   ============================================================ */

let pdProduct  = null;
let currentQty = 1;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { window.location.href = 'shop.html'; return; }

  pdProduct = await VBProducts.getById(id);
  if (!pdProduct) { window.location.href = 'shop.html'; return; }

  renderProduct();
  await renderReviews();
  await renderRelated();

  initNav();
  const cc = document.getElementById('cart-count');
  if (cc) {
    const cnt = VBCart.count();
    cc.textContent   = cnt;
    cc.style.display = cnt > 0 ? 'inline-flex' : 'none';
  }
});

/* ── Render Main Product ── */
function renderProduct() {
  const p   = pdProduct;
  const pid = p._id || p.id;

  document.title = `${p.name} — Velvet Beauty`;

  const setTxt  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setTxt('pd-breadcrumb-name', p.name);
  setTxt('pd-name-v2',         p.name);
  setTxt('pd-cat-v2',          p.category);
  setTxt('pd-desc-v2',         p.description || 'Our handcrafted formula ensures long-lasting results and premium comfort.');

  // Badge
  const badgeEl = document.getElementById('pd-badge-v2');
  if (badgeEl) {
    if (p.badge) {
      badgeEl.textContent = p.badge.toUpperCase();
      badgeEl.style.display = 'block';
      const badgeColors = { bestseller: '#C9956C', sale: '#E91E8C', new: '#2D8A4E', hot: '#C0392B' };
      badgeEl.style.background = badgeColors[p.badge] || '#E91E8C';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // Stock
  const stockEl = document.getElementById('pd-stock-v2');
  if (stockEl) {
    if (p.stock > 10)     { stockEl.textContent = 'In Stock';           stockEl.style.color = '#2D8A4E'; }
    else if (p.stock > 0) { stockEl.textContent = `Only ${p.stock} left!`; stockEl.style.color = '#C9880A'; }
    else                  { stockEl.textContent = 'Out of Stock';        stockEl.style.color = '#C0392B'; }
  }

  // Pricing
  const origPrice = p.originalPrice || p.origPrice;
  setTxt('pd-price-now', `Rs. ${Number(p.price).toLocaleString()}`);
  const wasEl  = document.getElementById('pd-price-was');
  const discEl = document.getElementById('pd-discount');
  if (origPrice) {
    if (wasEl)  wasEl.textContent  = `Rs. ${Number(origPrice).toLocaleString()}`;
    if (discEl) {
      const pct = Math.round(((origPrice - p.price) / origPrice) * 100);
      discEl.textContent   = `Save ${pct}%`;
      discEl.style.display = 'inline-block';
    }
  } else {
    if (wasEl)  wasEl.textContent  = '';
    if (discEl) discEl.style.display = 'none';
  }

  // Gallery
  const mainImg = document.getElementById('pd-main-img');
  const fallback = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600';
  if (mainImg) {
    mainImg.src     = p.image || fallback;
    mainImg.onerror = () => { mainImg.src = fallback; };
  }
  const thumbs = document.getElementById('pd-thumbnails');
  if (thumbs) {
    thumbs.innerHTML = `
      <img src="${p.image || fallback}" class="active"
           onclick="changeThumb('${p.image || fallback}', this)"
           onerror="this.src='${fallback}'">
      <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200"
           onclick="changeThumb(this.src, this)"
           onerror="this.src='${fallback}'">
      <img src="https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=200"
           onclick="changeThumb(this.src, this)"
           onerror="this.src='${fallback}'">
    `;
  }

  // Stars
  const rating = p.rating || 0;
  setTxt('pd-stars-v2',        '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)));
  setTxt('pd-review-count-v2', `(${p.reviews || 0} reviews)`);

  // Shades
  const shadesWrap = document.getElementById('pd-shades-wrap');
  if (shadesWrap) {
    if (p.shades && p.shades.length > 0) {
      shadesWrap.style.display = 'block';
      const swEl = document.getElementById('pd-swatches');
      if (swEl) swEl.innerHTML = p.shades.map((s, i) =>
        `<div class="shade-dot${i === 0 ? ' active' : ''}" style="background:${s}" title="${s}" onclick="selectShade('${s}', this)"></div>`
      ).join('');
      const nm = document.getElementById('pd-shade-name');
      if (nm && p.shades[0]) nm.textContent = p.shades[0];
    } else {
      shadesWrap.style.display = 'none';
    }
  }

  // Wishlist button state
  const wishBtn = document.getElementById('pd-wish-btn-v2');
  if (wishBtn) {
    if (VBWish.has(pid)) wishBtn.classList.add('active');
    wishBtn.onclick = () => {
      const session = VBAuth.session();
      if (!session) { VBToast.show('Please login to use wishlist', 'warning'); return; }
      const added = VBWish.toggle(pid);
      wishBtn.classList.toggle('active', added);
      VBToast.show(added ? 'Added to wishlist 💝' : 'Removed from wishlist', added ? 'success' : 'info');
    };
  }

  // Add to Cart
  const addCartBtn = document.getElementById('pd-add-cart-btn');
  if (addCartBtn) {
    addCartBtn.onclick = () => {
      const session = VBAuth.session();
      if (!session) {
        VBToast.show('Please login to add items to cart', 'warning');
        setTimeout(() => window.location.href = 'login.html?return=' + encodeURIComponent(window.location.href), 800);
        return;
      }
      if (!p.stock || p.stock === 0) { VBToast.show('Sorry, this item is out of stock!', 'error'); return; }
      VBCart.add(pdProduct, currentQty);
      VBToast.show(`${currentQty} × ${p.name} added to cart ✨`, 'success');
      const cc = document.getElementById('cart-count');
      if (cc) { cc.textContent = VBCart.count(); cc.style.display = 'inline-flex'; }
    };
  }
}

function updateQty(val) {
  const max  = pdProduct?.stock || 99;
  currentQty = Math.min(max, Math.max(1, currentQty + val));
  const qtyEl = document.getElementById('pd-qty');
  if (qtyEl) qtyEl.textContent = currentQty;
}

function changeThumb(src, el) {
  const mainImg = document.getElementById('pd-main-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.thumb-list img').forEach(img => img.classList.remove('active'));
  el.classList.add('active');
}

function selectShade(color, el) {
  const nameEl = document.getElementById('pd-shade-name');
  if (nameEl) nameEl.textContent = color;
  document.querySelectorAll('.shade-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}

/* ═══════════════════════════════════════════
   REVIEWS
═══════════════════════════════════════════ */
let reviewFormOpen = false;

function toggleReviewForm() {
  const session = VBAuth.session();
  if (!session) {
    VBToast.show('Please login to write a review', 'warning');
    setTimeout(() => window.location.href = 'login.html?return=' + encodeURIComponent(window.location.href), 800);
    return;
  }
  reviewFormOpen = !reviewFormOpen;
  const formEl = document.getElementById('review-write-form');
  if (formEl) formEl.style.display = reviewFormOpen ? 'block' : 'none';
  // Reset form
  if (!reviewFormOpen) {
    selectedRating = 0;
    document.querySelectorAll('.rv-star').forEach(s => s.classList.remove('selected'));
    const tv = document.getElementById('rv-text'); if (tv) tv.value = '';
    document.getElementById('rv-rating-val').value = '0';
  }
}

function setReviewRating(val) {
  selectedRating = val;
  document.getElementById('rv-rating-val').value = val;
  document.querySelectorAll('.rv-star').forEach((s, i) => {
    s.classList.toggle('selected', i < val);
  });
}

async function submitReview() {
  const session = VBAuth.session();
  if (!session) { VBToast.show('Please login to submit a review', 'warning'); return; }

  const rating = parseInt(document.getElementById('rv-rating-val')?.value || '0');
  const text   = document.getElementById('rv-text')?.value?.trim();
  const btn    = document.getElementById('rv-submit-btn');

  if (!rating || rating < 1) { VBToast.show('Please select a star rating', 'warning'); return; }
  if (!text)                  { VBToast.show('Please write your review', 'warning'); return; }

  btn.disabled    = true;
  btn.textContent = 'Posting...';

  const pid    = pdProduct._id || pdProduct.id;
  const result = await VBReviews.add({
    product:      pid,
    customerName: session.name,
    customer:     session.customerId,
    rating,
    text,
  });

  btn.disabled    = false;
  btn.textContent = 'Post Review';

  if (result) {
    VBToast.show('Review posted! Thank you 💝', 'success');
    // Update local count
    pdProduct.reviews = (pdProduct.reviews || 0) + 1;
    const rcount = document.getElementById('pd-review-count-v2');
    if (rcount) rcount.textContent = `(${pdProduct.reviews} reviews)`;
    // Close form & refresh list
    reviewFormOpen = true;
    toggleReviewForm();
    await renderReviews();
  } else {
    VBToast.show('Failed to post review. Please try again.', 'error');
  }
}

async function renderReviews() {
  const list    = document.getElementById('reviews-list');
  const bigNum  = document.getElementById('rs-big-num');
  const rsStars = document.getElementById('rs-stars');
  const rsCount = document.getElementById('rs-count');
  const rsBars  = document.getElementById('rs-bars');
  if (!list) return;

  const pid     = pdProduct._id || pdProduct.id;
  const reviews = await VBReviews.getByProduct(pid);

  if (!reviews.length) {
    if (bigNum)  bigNum.textContent  = '—';
    if (rsStars) rsStars.textContent = '☆☆☆☆☆';
    if (rsCount) rsCount.textContent = 'No reviews yet';
    if (rsBars)  rsBars.innerHTML    = '';
    list.innerHTML = `
      <div style="padding:32px;background:#fff;border-radius:20px;text-align:center;color:#aaa;font-size:14px;">
        <div style="font-size:2.5rem;margin-bottom:10px;">💬</div>
        <div style="font-weight:600;color:#666;margin-bottom:6px;">No reviews yet</div>
        Be the first to share your experience!
      </div>`;
    return;
  }

  // Stats
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  if (bigNum)  bigNum.textContent  = avg.toFixed(1);
  if (rsStars) rsStars.innerHTML   = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
  if (rsCount) rsCount.textContent = `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;

  // Rating breakdown bars
  if (rsBars) {
    rsBars.innerHTML = [5,4,3,2,1].map(star => {
      const cnt = reviews.filter(r => r.rating === star).length;
      const pct = Math.round((cnt / reviews.length) * 100);
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px;">
          <span style="color:#FFD700;width:16px;">${star}★</span>
          <div style="flex:1;height:6px;background:#f0f0f0;border-radius:10px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:#E91E8C;border-radius:10px;"></div>
          </div>
          <span style="color:#999;width:20px;text-align:right;">${cnt}</span>
        </div>`;
    }).join('');
  }

  // Review cards
  list.innerHTML = reviews.map(r => `
    <div style="padding:22px 24px;background:#fff;border-radius:18px;margin-bottom:14px;box-shadow:0 2px 14px rgba(0,0,0,0.05);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:#2A0D28;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">
            ${escHtml(r.customerName.charAt(0).toUpperCase())}
          </div>
          <div>
            <div style="font-weight:700;color:#2A0D28;font-size:14px;">${escHtml(r.customerName)}</div>
            <div style="color:#E91E8C;font-size:15px;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
        </div>
        <small style="color:#ccc;font-size:12px;">${fmtDate(r.createdAt)}</small>
      </div>
      <p style="margin:0;color:#555;font-size:14px;line-height:1.7;">${escHtml(r.text)}</p>
    </div>
  `).join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ── Related Products ── */
async function renderRelated() {
  const grid = document.getElementById('related-grid');
  const sec  = document.getElementById('related-section');
  if (!grid) return;

  const related  = await VBProducts.fetchAll({ category: pdProduct.category });
  const pid      = pdProduct._id || pdProduct.id;
  const filtered = related.filter(p => (p._id || p.id) !== pid).slice(0, 4);

  if (!filtered.length) {
    if (sec) sec.style.display = 'none';
    return;
  }
  if (sec) sec.style.display = 'block';
  grid.innerHTML = filtered.map((p, i) => vbCard(p, i * 0.1)).join('');
}
