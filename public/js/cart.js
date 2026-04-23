/* ============================================================
   VELVET BEAUTY — CART LOGIC
   ============================================================ */

let activeCoupon = null;

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    renderMiniRecs();
});

function renderCart() {
    const cart = VBCart.get(); // Helper from store.js
    const emptyEl = document.getElementById("cart-empty");
    const layoutEl = document.getElementById("cart-layout");
    const listEl = document.getElementById("cart-items-list");
    const headCount = document.getElementById("cart-title-count");

    // Update Nav Count
    const navBadge = document.getElementById("cart-count");
    if (navBadge) navBadge.textContent = cart.length;

    if (!cart || cart.length === 0) {
        if (emptyEl) emptyEl.classList.remove("hidden");
        if (layoutEl) layoutEl.style.display = "none";
        return;
    }

    if (emptyEl) emptyEl.classList.add("hidden");
    if (layoutEl) layoutEl.style.display = "grid";
    if (headCount) headCount.textContent = `Your Items (${cart.length})`;

    // FIXED: Using backticks to avoid quote errors
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
                <div class="cart-item-total">
                    Rs. ${(item.price * item.qty).toLocaleString()}
                </div>
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
    modal.style.display = 'flex';
    document.getElementById('confirm-yes').onclick = () => {
        VBCart.clear();
        modal.style.display = 'none';
        renderCart();
    };
}

window.VBModal = { close: (id) => document.getElementById(id).style.display = 'none' };

function updateSummary() {
    const totals = VBCart.totals(activeCoupon);
    document.getElementById("sum-subtotal").textContent = `Rs. ${totals.subtotal.toLocaleString()}`;
    document.getElementById("sum-delivery").textContent = totals.deliveryFee === 0 ? "FREE" : `Rs. ${totals.deliveryFee}`;
    document.getElementById("sum-total").textContent = totals.total.toLocaleString();

    const discRow = document.getElementById("sum-disc-row");
    if (totals.discount > 0) {
        discRow.style.display = "flex";
        document.getElementById("sum-discount").textContent = `-Rs. ${totals.discount.toLocaleString()}`;
    } else {
        discRow.style.display = "none";
    }
}

function applyCoupon() {
    const code = document.getElementById("coupon-input").value.trim().toUpperCase();
    if (code === "VELVET10") {
        activeCoupon = code;
        VBToast.show("10% Discount Applied! ✨", "success");
        updateSummary();
    } else {
        VBToast.show("Invalid code", "error");
    }
}

function renderMiniRecs() {
    const mini = document.getElementById("mini-recs");
    if (!mini) return;
    const recs = VBProducts.get().slice(0, 2);
    mini.innerHTML = recs.map(p => `
        <div style="display:flex; gap:10px; margin-bottom:10px; align-items:center;">
            <img src="${p.image}" width="50" style="border-radius:10px;">
            <div style="font-size:12px;"><strong>${p.name}</strong><br>Rs. ${p.price}</div>
        </div>
    `).join("");
}