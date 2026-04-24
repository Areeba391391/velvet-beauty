/* ============================================================
   VELVET BEAUTY — CHECKOUT LOGIC (MongoDB API version)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  await renderCheckoutSummary();

  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', renderCheckoutSummary);
  });

  const cc = document.getElementById('cart-count');
  if (cc) cc.textContent = VBCart.count();
});

async function renderCheckoutSummary() {
  const cart = VBCart.get();
  if (cart.length === 0) { window.location.href = 'cart.html'; return; }

  const itemsList  = document.getElementById('cs-items');
  const couponCode = sessionStorage.getItem('active_coupon') || null;
  const totals     = await VBCart.totals(couponCode);

  const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
  const deliveryType  = deliveryRadio ? deliveryRadio.value : 'standard';
  let deliveryFee     = deliveryType === 'express' ? 450 : 200;

  if (totals.subtotal > 2000 && deliveryType === 'standard') {
    deliveryFee = 0;
    const stdEl = document.getElementById('do-price-std');
    if (stdEl) stdEl.innerHTML = 'FREE ✨';
  } else {
    const stdEl = document.getElementById('do-price-std');
    if (stdEl) stdEl.textContent = 'Rs. 200';
  }

  const grandTotal = totals.subtotal - totals.discount + deliveryFee;

  if (itemsList) {
    itemsList.innerHTML = cart.map(item => `
      <div class="s-item">
        <img src="${item.image || ''}" alt="${item.name}"
             onerror="this.src='https://placehold.co/60x60/FDE8F3/E91E8C?text=💄'">
        <div class="s-item-info">
          <h5>${item.name}</h5>
          <span>Qty: ${item.qty}</span>
        </div>
        <div class="s-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</div>
      </div>
    `).join('');
  }

  const subEl  = document.getElementById('cs-subtotal'); if (subEl)  subEl.textContent  = `Rs. ${totals.subtotal.toLocaleString()}`;
  const delEl  = document.getElementById('cs-delivery');  if (delEl)  delEl.textContent  = deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`;
  const totEl  = document.getElementById('cs-total');     if (totEl)  totEl.textContent  = grandTotal.toLocaleString();

  if (totals.discount > 0) {
    const discRow = document.getElementById('cs-disc-row');
    if (discRow) discRow.style.display = 'flex';
    const discEl = document.getElementById('cs-disc');
    if (discEl)  discEl.textContent = `-Rs. ${totals.discount.toLocaleString()}`;
  }
}

async function placeOrder() {
  const btn = document.getElementById('place-order-btn');

  const name   = document.getElementById('addr-name')?.value.trim()   || '';
  const phone  = document.getElementById('addr-phone')?.value.trim()  || '';
  const street = document.getElementById('addr-street')?.value.trim() || '';
  const city   = document.getElementById('addr-city')?.value          || '';

  let isValid = true;
  const toggleErr = (id, show) => { const el = document.getElementById(id); if (el) el.classList.toggle('show', show); };
  toggleErr('err-name',   !name);   if (!name)   isValid = false;
  toggleErr('err-phone',  phone.length < 11); if (phone.length < 11) isValid = false;
  toggleErr('err-street', !street); if (!street) isValid = false;
  toggleErr('err-city',   !city);   if (!city)   isValid = false;

  if (!isValid) { VBToast.show('Please fill required fields 🎀', 'warning'); return; }

  btn.innerHTML = 'Processing Order...';
  btn.disabled  = true;

  const session    = VBAuth.session();
  const cartItems  = VBCart.get();
  const coupon     = sessionStorage.getItem('active_coupon');
  const totalsData = await VBCart.totals(coupon);

  const deliveryRadio = document.querySelector('input[name="delivery"]:checked');
  const deliveryType  = deliveryRadio ? deliveryRadio.value : 'standard';
  let deliveryFee     = deliveryType === 'express' ? 450 : 200;
  if (totalsData.subtotal > 2000 && deliveryType === 'standard') deliveryFee = 0;

  const grandTotal = totalsData.subtotal - totalsData.discount + deliveryFee;

  const orderData = {
    customerName:  session ? session.name : name,
    customer:      session?.customerId || null,
    items:         cartItems.map(i => ({
      productName: i.name,
      quantity:    i.qty,
      price:       i.price,
    })),
    total:         grandTotal,
    city:          city,
    address:       `${street}, ${city}`,
    paymentMethod: document.getElementById('payment-method')?.value || 'cod',
    deliveryType,
  };

  const placedOrder = await VBOrders.place(orderData);

  sessionStorage.removeItem('active_coupon');

  if (placedOrder) {
    VBToast.show('Order placed successfully! ✨', 'success');
    const orderId = placedOrder._id || placedOrder.orderNumber || '';
    window.location.href = 'order-success.html?id=' + orderId;
  } else {
    VBToast.show('Something went wrong. Please try again.', 'error');
    btn.innerHTML = 'Place Order';
    btn.disabled  = false;
  }
}