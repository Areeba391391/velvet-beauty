/* ============================================================
   VELVET BEAUTY — BOUTIQUE PRODUCT DETAIL LOGIC
   ============================================================ */

let pdProduct = null;
let currentQty = 1;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        window.location.href = 'shop.html';
        return;
    }

    pdProduct = VBProducts.getById(id);
    if (!pdProduct) {
        window.location.href = 'shop.html';
        return;
    }

    renderProduct();
    renderReviews();
    renderRelated();
    
    // Sync cart count
    document.getElementById('cart-count').textContent = VBCart.get().length;
});

/**
 * Main Render Function
 */
function renderProduct() {
    const p = pdProduct;

    // Head/Breadcrumb
    document.title = `${p.name} — Velvet Beauty`;
    document.getElementById('pd-breadcrumb-name').textContent = p.name;
    document.getElementById('pd-name-v2').textContent = p.name;
    document.getElementById('pd-cat-v2').textContent = p.category;
    document.getElementById('pd-desc-v2').textContent = p.desc || "Our handcrafted formula ensures long-lasting results and premium comfort for the modern woman.";

    // Pricing
    document.getElementById('pd-price-now').textContent = `Rs. ${p.price.toLocaleString()}`;
    if (p.origPrice) {
        document.getElementById('pd-price-was').textContent = `Rs. ${p.origPrice.toLocaleString()}`;
        const discount = Math.round(((p.origPrice - p.price) / p.origPrice) * 100);
        document.getElementById('pd-discount').textContent = `Save ${discount}%`;
        document.getElementById('pd-discount').style.display = 'inline-block';
    } else {
        document.getElementById('pd-price-was').textContent = '';
        document.getElementById('pd-discount').style.display = 'none';
    }

    // Gallery
    document.getElementById('pd-main-img').src = p.image;
    document.getElementById('pd-thumbnails').innerHTML = `
        <img src="${p.image}" class="active" onclick="changeThumb('${p.image}', this)">
        <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200" onclick="changeThumb(this.src, this)">
        <img src="https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=200" onclick="changeThumb(this.src, this)">
    `;

    // Stars
    const fullStars = '★'.repeat(Math.round(p.rating));
    const emptyStars = '☆'.repeat(5 - Math.round(p.rating));
    document.getElementById('pd-stars-v2').textContent = fullStars + emptyStars;
    document.getElementById('pd-review-count-v2').textContent = `(${p.reviews || 0} reviews)`;

    // Shades (if any)
    const shadesWrap = document.getElementById('pd-shades-wrap');
    if (p.shades && p.shades.length > 0) {
        shadesWrap.style.display = 'block';
        document.getElementById('pd-swatches').innerHTML = p.shades.map(s => `
            <div class="shade-dot" style="background:${s}" onclick="selectShade('${s}', this)"></div>
        `).join('');
    } else {
        shadesWrap.style.display = 'none';
    }

    // Wishlist Button State
    const wishBtn = document.getElementById('pd-wish-btn-v2');
    if (VBWish.has(p.id)) wishBtn.classList.add('active');

    // Add to Cart Logic
    document.getElementById('pd-add-cart-btn').onclick = () => {
        VBCart.add(p.id, currentQty);
        VBToast.show(`${currentQty} x ${p.name} added to selection ✨`, 'success');
        document.getElementById('cart-count').textContent = VBCart.get().length;
    };
}

function updateQty(val) {
    currentQty = Math.max(1, currentQty + val);
    document.getElementById('pd-qty').textContent = currentQty;
}

function changeThumb(src, el) {
    document.getElementById('pd-main-img').src = src;
    document.querySelectorAll('.thumb-list img').forEach(img => img.classList.remove('active'));
    el.classList.add('active');
}

function selectShade(color, el) {
    document.getElementById('pd-shade-name').textContent = color;
    document.querySelectorAll('.shade-dot').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    list.innerHTML = `
        <div style="padding: 20px; background: white; border-radius: 20px; font-size: 14px;">
            <strong>Sara K.</strong> — "Absolutely loved the quality. The velvet finish is exactly what I was looking for. Will definitely buy more!"
        </div>
    `;
}

function renderRelated() {
    const grid = document.getElementById('related-grid');
    const related = VBProducts.get().slice(0, 3); // Get 3 products
    grid.innerHTML = related.map(p => `
        <div class="product-card">
            <img src="${p.image}" style="width:100%; border-radius:20px;">
            <h4>${p.name}</h4>
            <p>Rs. ${p.price}</p>
        </div>
    `).join('');
}