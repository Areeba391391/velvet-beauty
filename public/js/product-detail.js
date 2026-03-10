/* ============================================================
   VELVET BEAUTY — product-detail.js
   Gallery · Shades · Qty · Add to Cart · Reviews
   Related Products
   ============================================================ */

let pdProduct = null;
let pdQty     = 1;
let pdShade   = null;
let pdRating  = 0;

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');
  if (!id) { window.location.href = 'shop.html'; return; }
  pdProduct = VBProducts.getById(id);
  if (!pdProduct) { window.location.href = 'shop.html'; return; }
  renderProduct();
  renderReviews();
  renderRelated();
});

// ── Render product ────────────────────────────────────────────
function renderProduct() {
  const p = pdProduct;

  // Breadcrumb
  document.getElementById('pd-breadcrumb-cat').textContent  = p.category;
  document.getElementById('pd-breadcrumb-cat').href         = `shop.html?cat=${p.category.toLowerCase()}`;
  document.getElementById('pd-breadcrumb-name').textContent = p.name;
  document.title = `${p.name} — Velvet Beauty`;

  // Badge
  const badgeEl = document.getElementById('pd-badge');
  if (p.badge) { badgeEl.textContent = p.badge; badgeEl.className = `pc-badge badge-${p.badge}`; badgeEl.style.display=''; }
  else badgeEl.style.display = 'none';

  // Main image
  const mainImg = document.getElementById('pd-main-img');
  mainImg.src = p.image;
  mainImg.alt = p.name;

  // Thumbnails (use same image for demo + placeholders)
  const thumbWrap = document.getElementById('pd-thumbnails');
  const thumbUrls = [p.image,
    `https://placehold.co/400x300/FDE8F3/E91E8C?text=${encodeURIComponent(p.name.split(' ')[0])}+2`,
    `https://placehold.co/400x300/F0E4D8/C9956C?text=${encodeURIComponent(p.name.split(' ')[0])}+3`,
  ];
  thumbWrap.innerHTML = thumbUrls.map((src,i) => `
    <div class="pd-thumb ${i===0?'active':''}" onclick="switchThumb('${src}',this)">
      <img src="${src}" alt="view ${i+1}" onerror="this.src='https://placehold.co/72x72/FDE8F3/E91E8C?text=VB'"/>
    </div>`).join('');

  // Wishlist button on image
  const wBtn = document.getElementById('pd-wishlist-btn');
  const inW = VBWish.has(p.id);
  if (wBtn) { wBtn.textContent = inW ? '❤️' : '🤍'; wBtn.classList.toggle('active', inW); wBtn.onclick = () => togglePdWish(); }

  // Info
  document.getElementById('pd-cat').textContent  = p.category;
  document.getElementById('pd-name').textContent = p.name;

  const starsFull  = Math.round(p.rating);
  const starsHtml2 = '★'.repeat(starsFull) + '☆'.repeat(5-starsFull);
  document.getElementById('pd-stars').textContent       = starsHtml2;
  document.getElementById('pd-rating-val').textContent  = p.rating.toFixed(1);
  document.getElementById('pd-review-count').textContent = `(${p.reviews||0} reviews)`;

  const stockEl = document.getElementById('pd-stock');
  if ((p.stock||0) > 0) { stockEl.className='status-badge s-delivered'; stockEl.textContent='✅ In Stock'; }
  else { stockEl.className='status-badge s-cancelled'; stockEl.textContent='Out of Stock'; }

  document.getElementById('pd-price-now').textContent = `Rs. ${p.price.toLocaleString()}`;
  const wasEl   = document.getElementById('pd-price-was');
  const discEl  = document.getElementById('pd-discount');
  if (p.origPrice) {
    wasEl.textContent   = `Rs. ${p.origPrice.toLocaleString()}`;
    const disc = Math.round((1 - p.price/p.origPrice)*100);
    discEl.textContent  = `-${disc}%`;
    discEl.style.display = '';
  } else { wasEl.textContent=''; discEl.style.display='none'; }

  document.getElementById('pd-desc').textContent = p.desc || '';

  // Shades
  const shadesWrap = document.getElementById('pd-shades-wrap');
  const swatchWrap = document.getElementById('pd-swatches');
  if (p.shades && p.shades.length) {
    shadesWrap.style.display = '';
    swatchWrap.innerHTML = p.shades.map((hex,i) => `
      <div class="pd-swatch ${i===0?'active':''}" style="background:${hex};" title="${hex}" onclick="selectShade('${hex}',this)"></div>`).join('');
    pdShade = p.shades[0];
    document.getElementById('pd-shade-selected').textContent = pdShade;
  } else {
    shadesWrap.style.display = 'none';
  }

  // Qty
  document.getElementById('pd-qty-minus').onclick = () => { if (pdQty > 1) { pdQty--; document.getElementById('pd-qty').textContent = pdQty; } };
  document.getElementById('pd-qty-plus').onclick  = () => { pdQty++; document.getElementById('pd-qty').textContent = pdQty; };

  // Add to cart
  document.getElementById('pd-add-cart-btn').onclick = () => {
    const session = VBAuth.session();
    if (!session) { VBToast.show('Please login to add to cart','warning'); window.location.href='login.html'; return; }
    VBCart.add(p, pdQty);
    VBToast.show(`${p.name} × ${pdQty} added to cart 🛒`, 'success');
  };

  // Wishlist btn
  const wBtn2 = document.getElementById('pd-wish-btn');
  if (wBtn2) { wBtn2.textContent = VBWish.has(p.id)?'❤️':'🤍'; wBtn2.onclick = () => togglePdWish(); }
}

function switchThumb(src, el) {
  document.getElementById('pd-main-img').src = src;
  document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function selectShade(hex, el) {
  pdShade = hex;
  document.getElementById('pd-shade-selected').textContent = hex;
  document.querySelectorAll('.pd-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

function togglePdWish() {
  const session = VBAuth.session();
  if (!session) { VBToast.show('Please login to save to wishlist','warning'); window.location.href='login.html'; return; }
  const added = VBWish.toggle(pdProduct.id);
  const emoji = added ? '❤️' : '🤍';
  const btn1 = document.getElementById('pd-wishlist-btn');
  const btn2 = document.getElementById('pd-wish-btn');
  if (btn1) { btn1.textContent = emoji; btn1.classList.toggle('active', added); }
  if (btn2) { btn2.textContent = emoji; }
  VBToast.show(added ? 'Added to wishlist 💝' : 'Removed from wishlist', added?'success':'info');
}

// ── Reviews ───────────────────────────────────────────────────
function renderReviews() {
  const reviews = VBReviews.getByProduct(pdProduct.id);
  const listEl  = document.getElementById('reviews-list');
  const emptyEl = document.getElementById('reviews-empty');

  // Rating summary
  document.getElementById('rs-big-num').textContent = pdProduct.rating?.toFixed(1) || '0.0';
  document.getElementById('rs-stars').textContent   = starsHtml(Math.round(pdProduct.rating||0));
  document.getElementById('rs-count').textContent   = `${reviews.length} review${reviews.length!==1?'s':''}`;

  // Bars
  const barsEl = document.getElementById('rs-bars');
  if (barsEl) {
    const counts = [5,4,3,2,1].map(s => reviews.filter(r => r.rating===s).length);
    barsEl.innerHTML = [5,4,3,2,1].map((s,i) => {
      const pct = reviews.length ? Math.round(counts[i]/reviews.length*100) : 0;
      return `<div class="rs-bar-row">
        <span class="rs-bar-label">${s}</span>
        <div class="rs-bar-track"><div class="rs-bar-fill" style="width:${pct}%"></div></div>
        <span class="rs-bar-count">${counts[i]}</span>
      </div>`;
    }).join('');
  }

  // Login note
  const loginNote = document.getElementById('review-login-note');
  if (!VBAuth.session()) {
    if (loginNote) loginNote.classList.remove('hidden');
    const submitBtn = document.getElementById('submit-review-btn');
    if (submitBtn) submitBtn.style.display = 'none';
  }

  // Star picker
  document.querySelectorAll('.star-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pdRating = parseInt(btn.dataset.star);
      document.querySelectorAll('.star-pick-btn').forEach((b,i) => b.classList.toggle('lit', i < pdRating));
    });
  });

  // Submit
  const submitBtn = document.getElementById('submit-review-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const session = VBAuth.session();
      if (!session) { VBToast.show('Please login to review','warning'); return; }
      if (!pdRating) { VBToast.show('Please select a star rating','warning'); return; }
      const text = document.getElementById('review-text').value.trim();
      if (!text) { VBToast.show('Please write your review','warning'); return; }
      VBReviews.add({ productId:pdProduct.id, customerId:session.id, customerName:session.name, rating:pdRating, title:document.getElementById('review-title').value.trim()||'Review', text });
      document.getElementById('review-text').value = '';
      document.getElementById('review-title').value = '';
      pdRating = 0;
      document.querySelectorAll('.star-pick-btn').forEach(b => b.classList.remove('lit'));
      VBToast.show('Review submitted! Thank you 💝', 'success');
      pdProduct = VBProducts.getById(pdProduct.id);
      renderReviews();
    });
  }

  // List
  if (!reviews.length) { if (emptyEl) emptyEl.classList.remove('hidden'); if (listEl) listEl.innerHTML=''; return; }
  if (emptyEl) emptyEl.classList.add('hidden');
  if (listEl) {
    listEl.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="rc-head">
          <div class="rc-avatar" style="background:${avatarBg(r.customerName)}">${r.customerName.charAt(0)}</div>
          <div><div class="rc-name">${r.customerName}</div><div class="rc-date">${fmtDate(r.date)}</div></div>
          <div class="rc-stars">${'★'.repeat(r.rating)}</div>
        </div>
        ${r.title ? `<strong style="display:block;margin-bottom:0.4rem;font-size:0.9rem;color:var(--plum-dark);">${r.title}</strong>` : ''}
        <p class="rc-text">${r.text}</p>
        <div class="rc-footer">
          <button class="rc-helpful-btn" onclick="markHelpful('${r.id}',this)">👍 Helpful (${r.helpful||0})</button>
        </div>
      </div>`).join('');
  }
}

function markHelpful(id, btn) {
  VBReviews.helpful(id);
  const r = VBReviews.getAll().find(r => r.id===id);
  if (r && btn) btn.innerHTML = `👍 Helpful (${r.helpful})`;
}

// ── Related ───────────────────────────────────────────────────
function renderRelated() {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  const related = VBProducts.getByCat(pdProduct.category).filter(p => p.id !== pdProduct.id).slice(0,4);
  grid.innerHTML = related.map((p,i) => vbCard(p, i*0.07)).join('');
}
