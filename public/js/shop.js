/* shop.js */
let shopState = { cat: "all", search: "", sort: "default", minPrice: 0, maxPrice: 5000 };

document.addEventListener("DOMContentLoaded", () => {
  // URL params
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get("cat");
  if (urlCat) {
    shopState.cat = urlCat.charAt(0).toUpperCase() + urlCat.slice(1).toLowerCase();
    setCatUI(shopState.cat);
  }

  // Render
  applyFilters();

  // Search
  const srch = document.getElementById("shop-search");
  if (srch) srch.addEventListener("input", e => { shopState.search = e.target.value; applyFilters(); });

  // Hero tabs + sidebar cats — unified
  document.querySelectorAll(".shop-tab, .sidebar-cats li").forEach(el => {
    el.addEventListener("click", () => {
      shopState.cat = el.dataset.cat || el.textContent.trim();
      // Normalise
      const catMap = { "All Items":"all", "All":"all", "Lips":"Lips", "Face &amp; Base":"Face", "Face":"Face", "Eye Artistry":"Eyes", "Eyes":"Eyes", "Cheeks":"Cheeks", "Skincare":"Skincare" };
      shopState.cat = catMap[shopState.cat] !== undefined ? catMap[shopState.cat] : shopState.cat;
      setCatUI(shopState.cat);
      applyFilters();
    });
  });

  // Price range
  const minS = document.getElementById("price-min");
  const maxS = document.getElementById("price-max");
  if (minS && maxS) {
    [minS, maxS].forEach(s => s.addEventListener("input", () => {
      shopState.minPrice = +minS.value;
      shopState.maxPrice = +maxS.value;
      const minEl = document.getElementById("price-min-val");
      const maxEl = document.getElementById("price-max-val");
      if (minEl) minEl.textContent = minS.value;
      if (maxEl) maxEl.textContent = maxS.value;
      applyFilters();
    }));
  }
});

function setCatUI(cat) {
  document.querySelectorAll(".shop-tab").forEach(t => t.classList.toggle("active", (t.dataset.cat || "") === cat));
  document.querySelectorAll(".sidebar-cats li").forEach(li => {
    const liCat = li.dataset.cat || li.textContent.trim();
    const catMap2 = { "All Items":"all", "Lips":"Lips", "Face &amp; Base":"Face", "Eyes":"Eyes", "Eye Artistry":"Eyes", "Cheeks":"Cheeks", "Skincare":"Skincare" };
    const norm = catMap2[liCat] !== undefined ? catMap2[liCat] : liCat;
    li.classList.toggle("active", norm === cat || liCat === cat);
  });
}

function applyFilters() {
  let products = VBProducts.getActive();
  if (shopState.cat !== "all") products = products.filter(p => p.category.toLowerCase() === shopState.cat.toLowerCase());
  if (shopState.search) { const q = shopState.search.toLowerCase(); products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }
  products = products.filter(p => p.price >= shopState.minPrice && p.price <= shopState.maxPrice);
  const sv = (document.getElementById("shop-sort") || {}).value || "default";
  if (sv === "price-asc")  products.sort((a,b) => a.price - b.price);
  if (sv === "price-desc") products.sort((a,b) => b.price - a.price);
  if (sv === "rating")     products.sort((a,b) => b.rating - a.rating);
  renderGrid(products);
}

function renderGrid(list) {
  const grid  = document.getElementById("shop-grid");
  const empty = document.getElementById("shop-empty");
  const cnt   = document.getElementById("results-count");
  if (cnt) cnt.textContent = list.length;
  if (!grid) return;
  if (!list.length) { grid.innerHTML = ""; if (empty) empty.classList.remove("hidden"); return; }
  if (empty) empty.classList.add("hidden");
  grid.innerHTML = list.map((p,i) => vbCard(p, i*0.05)).join("");
}

function clearAllFilters() {
  shopState = { cat:"all", search:"", sort:"default", minPrice:0, maxPrice:5000 };
  const srch = document.getElementById("shop-search"); if (srch) srch.value = "";
  const srt  = document.getElementById("shop-sort");   if (srt)  srt.value  = "default";
  const minS = document.getElementById("price-min");   if (minS) minS.value = "0";
  const maxS = document.getElementById("price-max");   if (maxS) maxS.value = "5000";
  const minEl= document.getElementById("price-min-val"); if (minEl) minEl.textContent = "0";
  const maxEl= document.getElementById("price-max-val"); if (maxEl) maxEl.textContent = "5000";
  setCatUI("all");
  applyFilters();
}
