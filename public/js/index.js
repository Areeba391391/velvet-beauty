/* ============================================================
   VELVET BEAUTY — index.js
   Homepage: Featured · Bestsellers · Testimonials
   Countdown · Newsletter · Search Modal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  renderCategories();
  renderFeatured('all');
  renderBestsellers();
  renderTestimonials();
  startCountdown();
  setupFeatTabs();
});

// ── Category counts ───────────────────────────────────────────
function renderCategories() {
  const products = VBProducts.getActive();
  const cats = ['lips','face','eyes','cheeks','skincare'];
  cats.forEach(cat => {
    const el = document.getElementById(`cat-count-${cat}`);
    if (el) {
      const count = products.filter(p => p.category.toLowerCase() === cat).length;
      el.textContent = `${count} Products`;
    }
  });
}

// ── Featured tabs ─────────────────────────────────────────────
function setupFeatTabs() {
  document.querySelectorAll('.feat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.feat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderFeatured(tab.dataset.tab);
    });
  });
}

function renderFeatured(tab) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  let products = VBProducts.getActive();
  if (tab !== 'all') products = products.filter(p => p.category === tab);
  // Max 8 shown
  products = products.slice(0, 8);
  if (!products.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--g400);padding:2rem;">No products in this category.</p>';
    return;
  }
  grid.innerHTML = products.map((p, i) => vbCard(p, i * 0.06)).join('');
}

// ── Bestsellers ───────────────────────────────────────────────
function renderBestsellers() {
  const grid = document.getElementById('bestsellers-grid');
  if (!grid) return;
  const products = VBProducts.getBest().slice(0, 4);
  grid.innerHTML = products.map((p, i) => vbCard(p, i * 0.08)).join('');
}

// ── Testimonials ──────────────────────────────────────────────
function renderTestimonials() {
  const grid = document.getElementById('testi-grid');
  if (!grid) return;
  const reviews = VBReviews.getAll().filter(r => r.rating >= 4).slice(0, 3);
  if (!reviews.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = reviews.map(r => {
    const bg = avatarBg(r.customerName);
    return `
      <div class="testi-card">
        <div class="testi-quote">"</div>
        <div class="testi-stars">${'★'.repeat(r.rating)}</div>
        <p class="testi-text">${r.text}</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:${bg}">${r.customerName.charAt(0)}</div>
          <div>
            <div class="testi-name">${r.customerName}</div>
            <div class="testi-city">${fmtDate(r.date)}</div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Promo Countdown ───────────────────────────────────────────
function startCountdown() {
  // 8 hours from page load
  let total = 8 * 3600;
  function tick() {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = n => String(n).padStart(2, '0');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
    if (total > 0) total--;
  }
  tick();
  setInterval(tick, 1000);
}

// ── Copy coupon code ──────────────────────────────────────────
function copyCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    VBToast.show(`Code "${code}" copied to clipboard! 📋`, 'success');
  }).catch(() => {
    VBToast.show(`Use code: ${code}`, 'info');
  });
}

// ── Search modal ──────────────────────────────────────────────
function openSearch() {
  VBModal.open('search-modal');
  setTimeout(() => {
    const input = document.getElementById('search-input');
    if (input) { input.value = ''; input.focus(); handleSearch(''); }
  }, 100);
}

function handleSearch(q) {
  const resultsEl = document.getElementById('search-results');
  const emptyEl   = document.getElementById('search-empty');
  if (!resultsEl) return;
  if (!q.trim()) {
    // Show first 6 products
    const products = VBProducts.getActive().slice(0, 6);
    resultsEl.innerHTML = products.map(p => vbCard(p, 0)).join('');
    if (emptyEl) emptyEl.classList.add('hidden');
    return;
  }
  const results = VBProducts.search(q);
  if (!results.length) {
    resultsEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
  } else {
    resultsEl.innerHTML = results.slice(0, 9).map(p => vbCard(p, 0)).join('');
    if (emptyEl) emptyEl.classList.add('hidden');
  }
}

// ── Newsletter ────────────────────────────────────────────────
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input && input.value) {
    VBToast.show('Subscribed! Welcome to the Velvet family 💌', 'success');
    input.value = '';
  }
}
