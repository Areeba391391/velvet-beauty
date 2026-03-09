/* ============================================
   VELVET BEAUTY — shop.js
   Shop page: filtering, sorting, searching,
   pagination, view toggle
   ============================================ */

/* ── State ── */
let shopState = {
  products:     [...VB_PRODUCTS],
  filtered:     [...VB_PRODUCTS],
  category:     'all',
  minPrice:     0,
  maxPrice:     5000,
  minRating:    0,
  inStockOnly:  false,
  newOnly:      false,
  searchQuery:  '',
  sortBy:       'default',
  currentPage:  1,
  perPage:      8,
  viewMode:     'grid'   /* grid | list */
};

/* ── Read URL params on load ── */
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const cat    = params.get('cat');
  const isNew  = params.get('new');
  const sale   = params.get('sale');

  if (cat) {
    const map = { lips:'Lips', face:'Face', eyes:'Eyes', cheeks:'Cheeks', skincare:'Skincare' };
    shopState.category = map[cat] || 'all';
  }
  if (isNew === 'true') shopState.newOnly = true;
  if (sale === 'true')  shopState.sortBy  = 'price-asc';

  /* Update breadcrumb and title */
  const title      = document.getElementById('shop-page-title');
  const breadcrumb = document.getElementById('breadcrumb-current');
  if (shopState.category !== 'all' && title) {
    title.textContent     = shopState.category;
    breadcrumb.textContent = shopState.category;
  }
}

/* ── Apply all filters & sort ── */
function applyFilters() {
  let list = [...VB_PRODUCTS];

  /* Category */
  if (shopState.category !== 'all') {
    list = list.filter(p => p.category === shopState.category);
  }
  /* Price */
  list = list.filter(p => p.price >= shopState.minPrice && p.price <= shopState.maxPrice);
  /* Rating */
  if (shopState.minRating > 0) {
    list = list.filter(p => p.rating >= shopState.minRating);
  }
  /* In stock */
  if (shopState.inStockOnly) {
    list = list.filter(p => p.stock > 0);
  }
  /* New only */
  if (shopState.newOnly) {
    list = list.filter(p => p.isNew);
  }
  /* Search */
  if (shopState.searchQuery) {
    const q = shopState.searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.shade && p.shade.toLowerCase().includes(q))
    );
  }

  /* Sort */
  switch (shopState.sortBy) {
    case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'rating':     list.sort((a,b) => b.rating - a.rating); break;
    case 'newest':     list.sort((a,b) => b.isNew - a.isNew); break;
    default: break; /* featured — original order */
  }

  shopState.filtered    = list;
  shopState.currentPage = 1;

  renderProducts();
  renderActiveFilters();
  updateFilterCount();
}

/* ── Render product grid ── */
function renderProducts() {
  const grid  = document.getElementById('shop-products-grid');
  const empty = document.getElementById('shop-empty');
  const count = document.getElementById('results-num');
  if (!grid) return;

  const { filtered, currentPage, perPage, viewMode } = shopState;
  const start = (currentPage - 1) * perPage;
  const page  = filtered.slice(start, start + perPage);

  if (count) count.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  empty.classList.add('hidden');
  grid.className = `products-grid${viewMode === 'list' ? ' list-view' : ''}`;
  grid.innerHTML = page.map(buildProductCard).join('');

  renderPagination();
}

/* ── Pagination ── */
function renderPagination() {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  const { filtered, currentPage, perPage } = shopState;
  const total = Math.ceil(filtered.length / perPage);
  if (total <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - currentPage) <= 1) {
      html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span class="page-ellipsis">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="goToPage(${currentPage+1})" ${currentPage===total?'disabled':''}>›</button>`;
  pag.innerHTML = html;
}

function goToPage(n) {
  const total = Math.ceil(shopState.filtered.length / shopState.perPage);
  if (n < 1 || n > total) return;
  shopState.currentPage = n;
  renderProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Filter functions (called from HTML) ── */
function filterByCategory(cat) {
  shopState.category = cat;
  /* Update pills */
  document.querySelectorAll('.filter-category-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.cat === cat);
  });
  applyFilters();
}

function filterByRating(min) {
  shopState.minRating = Number(min);
  applyFilters();
}

function updatePriceRange() {
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  const fill  = document.getElementById('price-slider-fill');
  if (!minEl || !maxEl) return;

  let min = Number(minEl.value);
  let max = Number(maxEl.value);
  if (min > max) { minEl.value = max; min = max; }

  document.getElementById('price-min-display').textContent = min.toLocaleString();
  document.getElementById('price-max-display').textContent = max.toLocaleString();

  /* Update fill bar */
  const pct = (v) => ((v / 5000) * 100).toFixed(1) + '%';
  if (fill) {
    fill.style.left  = pct(min);
    fill.style.right = (100 - (max / 5000 * 100)).toFixed(1) + '%';
  }

  shopState.minPrice = min;
  shopState.maxPrice = max;
  applyFilters();
}

function clearAllFilters() {
  shopState.category   = 'all';
  shopState.minPrice   = 0;
  shopState.maxPrice   = 5000;
  shopState.minRating  = 0;
  shopState.inStockOnly = false;
  shopState.newOnly    = false;
  shopState.searchQuery = '';

  /* Reset UI */
  document.querySelectorAll('.filter-category-pill').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-cat="all"]')?.classList.add('active');
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  if (minEl) minEl.value = 0;
  if (maxEl) maxEl.value = 5000;
  document.getElementById('price-min-display') && (document.getElementById('price-min-display').textContent = '0');
  document.getElementById('price-max-display') && (document.getElementById('price-max-display').textContent = '5,000');
  const radios = document.querySelectorAll('input[name="rating"]');
  radios.forEach(r => r.checked = r.value === '0');
  const stockCb = document.getElementById('in-stock-only');
  const newCb   = document.getElementById('new-only');
  if (stockCb) stockCb.checked = false;
  if (newCb)   newCb.checked   = false;
  const searchEl = document.getElementById('shop-search');
  if (searchEl) searchEl.value = '';

  applyFilters();
}

/* ── Active filter chips ── */
function renderActiveFilters() {
  const container = document.getElementById('active-filters');
  if (!container) return;
  const chips = [];

  if (shopState.category !== 'all')
    chips.push({ label: shopState.category, clear: () => { shopState.category = 'all'; applyFilters(); } });
  if (shopState.minPrice > 0 || shopState.maxPrice < 5000)
    chips.push({ label: `Rs.${shopState.minPrice}–${shopState.maxPrice}`, clear: () => { shopState.minPrice=0; shopState.maxPrice=5000; applyFilters(); } });
  if (shopState.minRating > 0)
    chips.push({ label: `${shopState.minRating}+ Stars`, clear: () => { shopState.minRating=0; applyFilters(); } });
  if (shopState.inStockOnly)
    chips.push({ label: 'In Stock', clear: () => { shopState.inStockOnly=false; applyFilters(); } });
  if (shopState.newOnly)
    chips.push({ label: 'New Arrivals', clear: () => { shopState.newOnly=false; applyFilters(); } });
  if (shopState.searchQuery)
    chips.push({ label: `"${shopState.searchQuery}"`, clear: () => { shopState.searchQuery=''; applyFilters(); } });

  container.innerHTML = chips.map((chip, i) => `
    <span class="active-filter-chip">
      ${chip.label}
      <button class="active-filter-remove" onclick="removeFilter(${i})">×</button>
    </span>
  `).join('');

  /* Store for onclick access */
  window._filterChips = chips;
}

function removeFilter(i) {
  if (window._filterChips && window._filterChips[i]) {
    window._filterChips[i].clear();
  }
}

function updateFilterCount() {
  let count = 0;
  if (shopState.category !== 'all')          count++;
  if (shopState.minPrice > 0)                count++;
  if (shopState.maxPrice < 5000)             count++;
  if (shopState.minRating > 0)               count++;
  if (shopState.inStockOnly)                 count++;
  if (shopState.newOnly)                     count++;

  const badge = document.getElementById('filter-count');
  if (badge) {
    badge.textContent    = count;
    badge.style.display  = count > 0 ? 'flex' : 'none';
  }
}

/* ── Filter group collapse ── */
function toggleFilterGroup(id) {
  document.getElementById(id)?.classList.toggle('collapsed');
}

/* ── Mobile filter sidebar ── */
function openFilterSidebar() {
  document.getElementById('filter-sidebar')?.classList.add('open');
  document.getElementById('filter-overlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeFilterSidebar() {
  document.getElementById('filter-sidebar')?.classList.remove('open');
  document.getElementById('filter-overlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  readURLParams();

  /* Search input (debounced) */
  const searchInput = document.getElementById('shop-search');
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        shopState.searchQuery = searchInput.value.trim();
        applyFilters();
      }, 300);
    });
  }

  /* Sort select */
  const sortSelect = document.getElementById('shop-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      shopState.sortBy = sortSelect.value;
      applyFilters();
    });
  }

  /* View toggle */
  document.getElementById('grid-view-btn')?.addEventListener('click', () => {
    shopState.viewMode = 'grid';
    document.getElementById('grid-view-btn').classList.add('active');
    document.getElementById('list-view-btn').classList.remove('active');
    renderProducts();
  });

  document.getElementById('list-view-btn')?.addEventListener('click', () => {
    shopState.viewMode = 'list';
    document.getElementById('list-view-btn').classList.add('active');
    document.getElementById('grid-view-btn').classList.remove('active');
    renderProducts();
  });

  /* Mobile filter button */
  document.getElementById('mobile-filter-btn')?.addEventListener('click', openFilterSidebar);
  document.getElementById('filter-overlay')?.addEventListener('click', closeFilterSidebar);

  /* In-stock / new-only checkboxes */
  document.getElementById('in-stock-only')?.addEventListener('change', (e) => {
    shopState.inStockOnly = e.target.checked;
    applyFilters();
  });
  document.getElementById('new-only')?.addEventListener('change', (e) => {
    shopState.newOnly = e.target.checked;
    applyFilters();
  });

  /* Clear all filters button */
  document.getElementById('clear-all-filters')?.addEventListener('click', clearAllFilters);

  /* Sync category if URL param set */
  if (shopState.category !== 'all') {
    document.querySelectorAll('.filter-category-pill').forEach(p =>
      p.classList.toggle('active', p.dataset.cat === shopState.category)
    );
    if (shopState.newOnly) {
      const cb = document.getElementById('new-only');
      if (cb) cb.checked = true;
    }
  }

  applyFilters();
});
