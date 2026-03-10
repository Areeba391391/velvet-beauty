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
  renderPromoBanner();
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

// ── Promo Banner (loaded from store) ─────────────────────────
function renderPromoBanner() {
  const promo = VBPromo.get();
  const section = document.getElementById('promo-section');
  if (!section) return;

  if (!promo.active) { section.style.display = 'none'; return; }
  section.style.display = '';

  const set     = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML   = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href        = val; };

  set('promo-eyebrow',  promo.eyebrow  || '⚡ Limited Time Offer');
  setHtml('promo-title', (promo.title  || 'Up to 40% Off Bestsellers').replace(/(\d+%)/g, '<em>$1</em>'));
  set('promo-desc',     promo.desc     || '');
  set('promo-code-key', promo.code     || 'BEAUTY20');
  set('promo-code-pct', (promo.codePct || '20') + '%');
  set('promo-cta-text', promo.ctaText  || 'Shop Sale Now');
  setHref('promo-cta-btn', promo.ctaLink || 'shop.html?sale=true');

  const codeEl = document.getElementById('promo-code-wrap');
  if (codeEl) codeEl.onclick = () => copyCode(promo.code || 'BEAUTY20');

  startCountdown(parseInt(promo.countdownHours) || 8);
}

// ── Promo Countdown ───────────────────────────────────────────
function startCountdown(hours = 8) {
  let total = hours * 3600;
  // Persist countdown so it doesn't reset on refresh
  const storageKey = 'vb_countdown_end';
  let endTime = parseInt(localStorage.getItem(storageKey) || '0');
  const now = Date.now();
  if (!endTime || endTime < now) {
    endTime = now + total * 1000;
    localStorage.setItem(storageKey, endTime);
  }

  function tick() {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const pad = n => String(n).padStart(2, '0');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
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
