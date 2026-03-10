/* ============================================================
   VELVET BEAUTY — shop.js
   Shop: Filters · Search · Sort · Pagination
   Active Chips · Grid/List Toggle · Mobile Filter
   ============================================================ */

let shopState = {
  cat: 'all', search: '', sort: 'default',
  minPrice: 0, maxPrice: 5000,
  rating: 0, inStock: false, newOnly: false, saleOnly: false,
  view: 'grid', page: 1, perPage: 8,
};

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  readUrlParams();
  setupPriceSlider();
  setupFilterListeners();
  applyFilters();
});

// ── Read URL params ───────────────────────────────────────────
function readUrlParams() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('cat'))  { shopState.cat = p.get('cat'); setActiveCat(shopState.cat); }
  if (p.get('new'))  { shopState.newOnly = true; document.getElementById('chk-new').checked = true; }
  if (p.get('sale')) { shopState.saleOnly = true; document.getElementById('chk-sale').checked = true; }
  // Update hero title
  updateHeroTitle();
}

function setActiveCat(cat) {
  document.querySelectorAll('.fcat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat || (cat === 'all' && p.dataset.cat === 'all')));
  document.querySelectorAll('.hero-cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat || (cat === 'all' && p.dataset.cat === 'all')));
}

function updateHeroTitle() {
  const titles = { all:'All Products', Lips:'Lip Products', Face:'Face Products', Eyes:'Eye Products', Cheeks:'Cheek Products', Skincare:'Skincare' };
  const eyebrows = { all:'Explore Our Collection', Lips:'Luxe Lip Collection', Face:'Flawless Face', Eyes:'Eye Drama', Cheeks:'Rosy Cheeks', Skincare:'Glow & Care' };
  const titleEl   = document.getElementById('shop-title');
  const eyebrowEl = document.getElementById('shop-eyebrow');
  const breadEl   = document.getElementById('shop-breadcrumb-curr');
  const cat       = shopState.cat;
  if (titleEl)   titleEl.innerHTML   = (titles[cat] || cat).replace(/(\w+)$/, '<em>$1</em>');
  if (eyebrowEl) eyebrowEl.textContent = eyebrows[cat] || 'Shop';
  if (breadEl)   breadEl.textContent = titles[cat] || cat;
}

// ── Price slider ──────────────────────────────────────────────
function setupPriceSlider() {
  const minSlider  = document.getElementById('price-min');
  const maxSlider  = document.getElementById('price-max');
  const minValEl   = document.getElementById('price-min-val');
  const maxValEl   = document.getElementById('price-max-val');
  const fill       = document.getElementById('price-fill');

  function updateSlider() {
    let min = parseInt(minSlider.value);
    let max = parseInt(maxSlider.value);
    if (min > max) { [minSlider.value, maxSlider.value] = [max, min]; [min, max] = [max, min]; }
    if (minValEl) minValEl.textContent = min.toLocaleString();
    if (maxValEl) maxValEl.textContent = max.toLocaleString();
    const pMin = (min / 5000) * 100;
    const pMax = (max / 5000) * 100;
    if (fill) { fill.style.left = pMin + '%'; fill.style.width = (pMax - pMin) + '%'; }
    shopState.minPrice = min;
    shopState.maxPrice = max;
    shopState.page = 1;
    applyFilters();
  }
  if (minSlider) minSlider.addEventListener('input', updateSlider);
  if (maxSlider) maxSlider.addEventListener('input', updateSlider);
  updateSlider();
}

// ── Filter listeners ──────────────────────────────────────────
function setupFilterListeners() {
  // Category pills (sidebar)
  document.querySelectorAll('.fcat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      shopState.cat = pill.dataset.cat;
      shopState.page = 1;
      setActiveCat(shopState.cat);
      updateHeroTitle();
      applyFilters();
    });
  });
  // Category pills (hero)
  document.querySelectorAll('.hero-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      shopState.cat = pill.dataset.cat;
      shopState.page = 1;
      setActiveCat(shopState.cat);
      updateHeroTitle();
      applyFilters();
    });
  });
  // Rating
  document.querySelectorAll('input[name="rating"]').forEach(r => {
    r.addEventListener('change', () => { shopState.rating = parseFloat(r.value); shopState.page = 1; applyFilters(); });
  });
  // Checkboxes
  const instock = document.getElementById('chk-instock');
  const newOnly = document.getElementById('chk-new');
  const sale    = document.getElementById('chk-sale');
  if (instock) instock.addEventListener('change', () => { shopState.inStock = instock.checked; shopState.page=1; applyFilters(); });
  if (newOnly) newOnly.addEventListener('change', () => { shopState.newOnly = newOnly.checked; shopState.page=1; applyFilters(); });
  if (sale)    sale.addEventListener('change',    () => { shopState.saleOnly = sale.checked;   shopState.page=1; applyFilters(); });
  // Filter group collapse
  document.querySelectorAll('.filter-group-head').forEach(head => {
    head.addEventListener('click', () => head.parentElement.classList.toggle('collapsed'));
  });
}

// ── Search ────────────────────────────────────────────────────
function shopSearch(q) {
  shopState.search = q;
  shopState.page   = 1;
  applyFilters();
}

// ── Apply all filters ─────────────────────────────────────────
function applyFilters() {
  let products = VBProducts.getActive();

  if (shopState.cat !== 'all')    products = products.filter(p => p.category === shopState.cat);
  if (shopState.search)           products = products.filter(p => p.name.toLowerCase().includes(shopState.search.toLowerCase()) || p.category.toLowerCase().includes(shopState.search.toLowerCase()));
  if (shopState.rating > 0)       products = products.filter(p => p.rating >= shopState.rating);
  if (shopState.inStock)          products = products.filter(p => (p.stock||0) > 0);
  if (shopState.newOnly)          products = products.filter(p => p.isNew);
  if (shopState.saleOnly)         products = products.filter(p => p.origPrice && p.origPrice > p.price);
  products = products.filter(p => p.price >= shopState.minPrice && p.price <= shopState.maxPrice);

  // Sort
  const sort = document.getElementById('shop-sort');
  const sortVal = sort ? sort.value : shopState.sort;
  if (sortVal === 'price-asc')   products.sort((a,b) => a.price - b.price);
  if (sortVal === 'price-desc')  products.sort((a,b) => b.price - a.price);
  if (sortVal === 'rating')      products.sort((a,b) => b.rating - a.rating);
  if (sortVal === 'bestseller')  products.sort((a,b) => (b.bestseller?1:0) - (a.bestseller?1:0));
  if (sortVal === 'newest')      products.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0));

  // Results count
  const countEl = document.getElementById('results-count');
  if (countEl) countEl.textContent = products.length;

  // Active chips
  renderActiveChips();

  // Paginate
  const totalPages = Math.ceil(products.length / shopState.perPage);
  const start = (shopState.page - 1) * shopState.perPage;
  const paginated = products.slice(start, start + shopState.perPage);

  // Render grid
  const grid   = document.getElementById('shop-grid');
  const empty  = document.getElementById('shop-empty');
  if (!grid) return;
  if (!paginated.length) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
  } else {
    grid.innerHTML = paginated.map((p,i) => vbCard(p, i*0.04)).join('');
    if (empty) empty.classList.add('hidden');
  }
  if (shopState.view === 'list') grid.classList.add('list-view');
  else grid.classList.remove('list-view');

  // Pagination
  renderPagination(totalPages);
}

// ── Active filter chips ───────────────────────────────────────
function renderActiveChips() {
  const wrap = document.getElementById('active-chips');
  if (!wrap) return;
  const chips = [];
  if (shopState.cat !== 'all')  chips.push({ label:`Category: ${shopState.cat}`, clear:() => { shopState.cat='all'; setActiveCat('all'); updateHeroTitle(); } });
  if (shopState.search)         chips.push({ label:`Search: "${shopState.search}"`, clear:() => { shopState.search=''; document.getElementById('shop-search').value=''; } });
  if (shopState.rating > 0)     chips.push({ label:`Rating: ${shopState.rating}+★`, clear:() => { shopState.rating=0; document.querySelector('input[name="rating"][value="0"]').checked=true; } });
  if (shopState.inStock)        chips.push({ label:'In Stock', clear:() => { shopState.inStock=false; document.getElementById('chk-instock').checked=false; } });
  if (shopState.newOnly)        chips.push({ label:'New Arrivals', clear:() => { shopState.newOnly=false; document.getElementById('chk-new').checked=false; } });
  if (shopState.saleOnly)       chips.push({ label:'On Sale', clear:() => { shopState.saleOnly=false; document.getElementById('chk-sale').checked=false; } });
  if (shopState.minPrice > 0 || shopState.maxPrice < 5000) chips.push({ label:`Price: Rs.${shopState.minPrice}–${shopState.maxPrice}`, clear:() => { shopState.minPrice=0; shopState.maxPrice=5000; document.getElementById('price-min').value=0; document.getElementById('price-max').value=5000; setupPriceSlider(); } });

  // Badge
  const badge = document.getElementById('filter-badge');
  if (badge) { badge.textContent = chips.length; badge.classList.toggle('hidden', chips.length===0); }

  wrap.innerHTML = chips.map((c,i) => `
    <span style="display:inline-flex;align-items:center;gap:0.4rem;background:var(--pink-pale);border:1.5px solid var(--pink-light);border-radius:var(--r-full);padding:4px 12px;font-size:0.78rem;color:var(--pink-dark);font-weight:500;">
      ${c.label}
      <button onclick="clearChip(${i})" style="background:none;border:none;color:var(--pink);font-size:1rem;line-height:1;cursor:pointer;">✕</button>
    </span>`).join('');
  wrap._chips = chips;
}

function clearChip(i) {
  const wrap = document.getElementById('active-chips');
  if (wrap && wrap._chips && wrap._chips[i]) { wrap._chips[i].clear(); shopState.page=1; applyFilters(); }
}

function clearAllFilters() {
  shopState = { ...shopState, cat:'all', search:'', sort:'default', minPrice:0, maxPrice:5000, rating:0, inStock:false, newOnly:false, saleOnly:false, page:1 };
  document.getElementById('shop-search').value = '';
  document.getElementById('shop-sort').value = 'default';
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  document.getElementById('chk-instock').checked = false;
  document.getElementById('chk-new').checked = false;
  document.getElementById('chk-sale').checked = false;
  document.getElementById('price-min').value = 0;
  document.getElementById('price-max').value = 5000;
  setupPriceSlider();
  setActiveCat('all');
  updateHeroTitle();
  applyFilters();
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination(totalPages) {
  const pag = document.getElementById('shop-pagination');
  if (!pag || totalPages <= 1) { if (pag) pag.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="goPage(${shopState.page-1})" ${shopState.page===1?'disabled':''}>‹</button>`;
  for (let i=1; i<=totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - shopState.page) <= 1) {
      html += `<button class="page-btn ${i===shopState.page?'active':''}" onclick="goPage(${i})">${i}</button>`;
    } else if (i === shopState.page-2 || i === shopState.page+2) {
      html += `<span class="page-ellipsis">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="goPage(${shopState.page+1})" ${shopState.page===totalPages?'disabled':''}>›</button>`;
  pag.innerHTML = html;
}

function goPage(page) {
  shopState.page = page;
  applyFilters();
  document.querySelector('.shop-section')?.scrollIntoView({ behavior:'smooth', block:'start' });
}

// ── View toggle ───────────────────────────────────────────────
function setView(view, btn) {
  shopState.view = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('shop-grid');
  if (grid) { grid.classList.toggle('list-view', view==='list'); }
}

// ── Mobile filter ─────────────────────────────────────────────
function openMobileFilter() {
  document.getElementById('filter-sidebar').classList.add('open');
  document.getElementById('filter-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMobileFilter() {
  document.getElementById('filter-sidebar').classList.remove('open');
  document.getElementById('filter-overlay').classList.remove('show');
  document.body.style.overflow = '';
}
