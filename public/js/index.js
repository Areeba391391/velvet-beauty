/* index.js — Homepage logic */
document.addEventListener("DOMContentLoaded", () => {

  // 1. Hero Slider
  const slides = document.querySelectorAll(".hero-slide");
  let cur = 0;
  setInterval(() => {
    slides[cur].classList.remove("active");
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add("active");
  }, 3500);

  // 2. Bestseller Rotator
  const bests = VBProducts.getBest();
  let bsIndex = 0;
  const card  = document.getElementById("bestseller-card");
  const bsImg = document.getElementById("bs-img");
  const bsName= document.getElementById("bs-name");
  const bsPrc = document.getElementById("bs-price");
  const bsBtn = document.getElementById("bs-add-btn");

  function rotateBs() {
    if (!bests.length || !card) return;
    card.classList.add("fade");
    setTimeout(() => {
      const p = bests[bsIndex % bests.length];
      bsImg.src = p.image;
      bsName.textContent = p.name;
      bsPrc.textContent  = "Rs. " + p.price.toLocaleString();
      if (bsBtn) bsBtn.onclick = () => vbAddToCart(p.id);
      card.classList.remove("fade");
      bsIndex++;
    }, 600);
  }
  rotateBs();
  setInterval(rotateBs, 6000);

  // 3. Bestsellers Grid
  const bGrid = document.getElementById("bestsellers-grid");
  if (bGrid) {
    const bs = VBProducts.getBest().slice(0,4);
    bGrid.innerHTML = bs.map((p,i) => vbCard(p, i*0.1)).join("");
  }

  // 4. New Arrivals Grid
  const nGrid = document.getElementById("new-grid");
  if (nGrid) {
    const newProds = VBProducts.getNew().slice(0,4);
    nGrid.innerHTML = newProds.map((p,i) => vbCard(p, i*0.1)).join("");
  }

  // 5. Promo banner from store
  const promo = VBPromo.get();
  if (promo && promo.active) {
    ["promo-eyebrow","promo-title","promo-desc","promo-code","promo-cta"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === "promo-eyebrow") el.textContent = promo.eyebrow || "";
      if (id === "promo-title")   el.textContent = promo.title   || "";
      if (id === "promo-desc")    el.textContent = promo.desc    || "";
      if (id === "promo-code")    el.textContent = promo.code    || "";
      if (id === "promo-cta")     { el.textContent = promo.ctaText || "Shop Now"; el.href = promo.ctaLink || "shop.html"; }
    });
  }

  // 6. Reveal animation observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
});
