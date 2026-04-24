/* ============================================================
   VELVET BEAUTY — CART LOGIC (MongoDB API version)
   ============================================================ */

let activeCoupon = null;

document.addEventListener("DOMContentLoaded", async () => {
  renderCart();
  await renderMiniRecs();
});

function renderCart() {
  const cart     = VBCart.get();
  const emptyEl  = document.getElementById("cart-empty");
  const layoutEl = document.getElementById("cart-layout");
  const listEl   = document.getElementById("cart-items-list");
  const headCount= document.getElementById("cart-title-count");

  const navBadge = document.getElementById("cart-count");
  if (navBadge) navBadge.textContent = cart.length;

  if (!cart || cart.length === 0) {
    if (emptyEl)  emptyEl.classList.remove("hidden");
    if (layoutEl) layoutEl.style.display = "none";
    return;
  }

  if (emptyEl)  emptyEl.classList.add("hidden");
  if (layoutEl) layoutEl.style.display = "grid";
  if (headCount) headCount.textContent = `Your Items (${cart.length})`;

  if (listEl) {
    listEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100/FDE8F3/E91E8C?text=Beauty'">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.category || "Luxury"}</div>
          <div class="cart-item-name">${item.name}</div>
          <div class="qty-ctrl">
            <button onclick="changeQty('${item.id}', ${item.qty - 1})">−</button>
            <span class="qty-val">${item.qty}</span>
            <button onclick="changeQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
        </div>
        <div class="cart-item-total">Rs. ${(item.price * item.qty).toLocaleString()}</div>
        <button class="remove-item" onclick="removeItem('${item.id}')">✕</button>
      </div>
    `).join("");
  }

  updateSummary();
}

function changeQty(id, qty) {
  if (qty < 1) return removeItem(id);
  VBCart.updateQty(id, qty);
  renderCart();
}

function removeItem(id) {
  VBCart.remove(id);
  VBToast.show("Item removed 🌸", "info");
  renderCart();
}

function clearCart() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.style.display = 'flex';
  const yesBtn = document.getElementById('confirm-yes');
  if (yesBtn) yesBtn.onclick = () => {
    VBCart.clear();
    if (modal) modal.style.display = 'none';
    renderCart();
  };
}

window.VBModal = { close: (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; } };

async function updateSummary() {
  const totals = await VBCart.totals(activeCoupon);
  const sub  = document.getElementById("sum-subtotal"); if (sub)  sub.textContent  = `Rs. ${totals.subtotal.toLocaleString()}`;
  const del  = document.getElementById("sum-delivery"); if (del)  del.textContent  = totals.deliveryFee === 0 ? "FREE" : `Rs. ${totals.deliveryFee}`;
  const tot  = document.getElementById("sum-total");    if (tot)  tot.textContent  = totals.total.toLocaleString();
  const discRow = document.getElementById("sum-disc-row");
  if (discRow) {
    if (totals.discount > 0) {
      discRow.style.display = "flex";
      const discEl = document.getElementById("sum-discount"); if (discEl) discEl.textContent = `-Rs. ${totals.discount.toLocaleString()}`;
    } else {
      discRow.style.display = "none";
    }
  }
}

function applyCoupon() {
  const code = document.getElementById("coupon-input").value.trim().toUpperCase();
  const valid = ["VELVET10", "BEAUTY20", "VIP30", "FIRST15"];
  if (valid.includes(code)) {
    activeCoupon = code;
    VBToast.show("Coupon Applied! ✨", "success");
    updateSummary();
  } else {
    VBToast.show("Invalid coupon code", "error");
  }
}

async function renderMiniRecs() {
  const mini = document.getElementById("mini-recs");
  if (!mini) return;
  const all  = await VBProducts.fetchAll({ limit: 2 });
  mini.innerHTML = all.slice(0, 2).map(p => `
    <div style="display:flex; gap:10px; margin-bottom:10px; align-items:center;">
      <img src="${p.image || ''}" width="50" style="border-radius:10px;"
           onerror="this.src='https://placehold.co/50x50/FDE8F3/E91E8C?text=💄'">
      <div style="font-size:12px;"><strong>${p.name}</strong><br>Rs. ${p.price.toLocaleString()}</div>
    </div>
  `).join("");
}