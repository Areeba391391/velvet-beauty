/* index.js — Homepage logic (MongoDB API version) */
document.addEventListener("DOMContentLoaded", async () => {

  // 1. Hero Slider
  const slides = document.querySelectorAll(".hero-slide");
  let cur = 0;
  setInterval(() => {
    slides[cur].classList.remove("active");
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add("active");
  }, 3500);

  // 2. Load products from MongoDB
  const allProducts = await VBProducts.fetchAll();

  // 3. Bestseller Rotator
  const bests  = allProducts.filter(p => p.badge === 'bestseller' || p.sold > 0).sort((a,b) => (b.sold||0)-(a.sold||0));
  let bsIndex  = 0;
  const card   = document.getElementById("bestseller-card");
  const bsImg  = document.getElementById("bs-img");
  const bsName = document.getElementById("bs-name");
  const bsPrc  = document.getElementById("bs-price");
  const bsBtn  = document.getElementById("bs-add-btn");

  function rotateBs() {
    if (!bests.length || !card) return;
    card.classList.add("fade");
    setTimeout(() => {
      const p   = bests[bsIndex % bests.length];
      const pid = p._id || p.id;
      if (bsImg)  bsImg.src         = p.image || '';
      if (bsName) bsName.textContent = p.name;
      if (bsPrc)  bsPrc.textContent  = "Rs. " + p.price.toLocaleString();
      if (bsBtn)  bsBtn.onclick      = () => vbAddToCart(pid);
      card.classList.remove("fade");
      bsIndex++;
    }, 600);
  }
  rotateBs();
  setInterval(rotateBs, 2000);

  // 4. Bestsellers Grid
  const bGrid = document.getElementById("bestsellers-grid");
  if (bGrid) {
    const bs = bests.slice(0, 4);
    bGrid.innerHTML = bs.map((p, i) => vbCard(p, i * 0.1)).join("");
  }

  // 5. New Arrivals Grid
  const nGrid = document.getElementById("new-grid");
  if (nGrid) {
    const newProds = allProducts.filter(p => p.isNew).slice(0, 4);
    nGrid.innerHTML = newProds.map((p, i) => vbCard(p, i * 0.1)).join("");
  }

  // 6. Promo banner from API
  const promo = await VBPromo.get();
  if (promo && promo.active) {
    [["promo-eyebrow", promo.eyebrow], ["promo-title", promo.title], ["promo-desc", promo.desc], ["promo-code", promo.code]].forEach(([id, val]) => {
      const el = document.getElementById(id); if (el) el.textContent = val || "";
    });
    const ctaEl = document.getElementById("promo-cta");
    if (ctaEl) { ctaEl.textContent = promo.ctaText || "Shop Now"; ctaEl.href = promo.ctaLink || "shop.html"; }
  }

  // 7. Reveal animation observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
});