/* ============================================================
   VELVET BEAUTY — BOUTIQUE CHECKOUT LOGIC
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Render
    renderCheckoutSummary();
    
    // 2. Listen for delivery changes to update total
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', renderCheckoutSummary);
    });

    // Sync navbar cart count
    const cart = VBCart.get();
    document.getElementById('cart-count').textContent = cart.length;
});

/**
 * Calculates and Renders the Order Review Section
 */
function renderCheckoutSummary() {
    const cart = VBCart.get();
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    const itemsList = document.getElementById('cs-items');
    const couponCode = sessionStorage.getItem('active_coupon') || null;
    const totals = VBCart.totals(couponCode); // Utility from store.js

    // Get selected delivery fee
    const deliveryType = document.querySelector('input[name="delivery"]:checked').value;
    let deliveryFee = 200; // Standard
    if (deliveryType === 'express') deliveryFee = 450;

    // Free delivery check (e.g. if subtotal > 2000)
    if (totals.subtotal > 2000 && deliveryType === 'standard') {
        deliveryFee = 0;
        document.getElementById('do-price-std').innerHTML = "FREE ✨";
    } else {
        document.getElementById('do-price-std').textContent = "Rs. 200";
    }

    const grandTotal = totals.subtotal - totals.discount + deliveryFee;

    // Render Items
    itemsList.innerHTML = cart.map(item => `
        <div class="s-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="s-item-info">
                <h5>${item.name}</h5>
                <span>Qty: ${item.qty}</span>
            </div>
            <div class="s-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</div>
        </div>
    `).join('');

    // Update Totals UI
    document.getElementById('cs-subtotal').textContent = `Rs. ${totals.subtotal.toLocaleString()}`;
    document.getElementById('cs-delivery').textContent = deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`;
    document.getElementById('cs-total').textContent = grandTotal.toLocaleString();

    if (totals.discount > 0) {
        document.getElementById('cs-disc-row').style.display = 'flex';
        document.getElementById('cs-disc').textContent = `-Rs. ${totals.discount.toLocaleString()}`;
    }
}

/**
 * Form Validation and Order Placement
 */
function placeOrder() {
    const btn = document.getElementById('place-order-btn');
    
    // Fields to validate
    const name = document.getElementById('addr-name').value.trim();
    const phone = document.getElementById('addr-phone').value.trim();
    const street = document.getElementById('addr-street').value.trim();
    const city = document.getElementById('addr-city').value;

    let isValid = true;

    // Simple validation logic
    if (!name) { document.getElementById('err-name').classList.add('show'); isValid = false; }
    else { document.getElementById('err-name').classList.remove('show'); }

    if (!phone || phone.length < 11) { document.getElementById('err-phone').classList.add('show'); isValid = false; }
    else { document.getElementById('err-phone').classList.remove('show'); }

    if (!street) { document.getElementById('err-street').classList.add('show'); isValid = false; }
    else { document.getElementById('err-street').classList.remove('show'); }

    if (!city) { document.getElementById('err-city').classList.add('show'); isValid = false; }
    else { document.getElementById('err-city').classList.remove('show'); }

    if (!isValid) {
        VBToast.show('Please fill required boutique fields 🎀', 'warning');
        return;
    }

    // Process Order
    btn.innerHTML = "Processing Order Selection...";
    btn.disabled = true;

    setTimeout(() => {
        // Collect order data
        const session = VBAuth.session();
        const cartItems = VBCart.get();
        const totalsData = VBCart.totals(sessionStorage.getItem('active_coupon'));
        const orderData = {
          customerId:    session ? session.id   : '',
          customerName:  session ? session.name : 'Guest',
          items:         cartItems,
          subtotal:      totalsData.subtotal,
          discount:      totalsData.discount,
          deliveryFee:   totalsData.deliveryFee,
          total:         totalsData.total,
          paymentMethod: (document.getElementById('payment-method') || {}).value || 'cod',
          deliveryType:  'standard',
          address:       [
            (document.getElementById('co-address') || {}).value || '',
            (document.getElementById('co-city')    || {}).value || '',
          ].filter(Boolean).join(', '),
        };
        const placedOrder = VBOrders.place(orderData);
        VBCart.clear();
        sessionStorage.removeItem('active_coupon');
        VBToast.show('Order placed successfully! ✨', 'success');
        window.location.href = 'order-success.html?id=' + (placedOrder ? placedOrder.id : '');
    }, 1500);
}