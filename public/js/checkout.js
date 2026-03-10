/* ============================================================
   VELVET BEAUTY — checkout.js
   Checkout: Form Validation · Delivery Fees
   Payment · Place Order
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  VBAuth.guard(['customer','employee','owner']);
  if (!VBCart.get().length) { window.location.href = 'cart.html'; return; }
  renderSummary();
  setupDeliveryListeners();
  prefillAddress();
});

// ── Prefill if session has address ────────────────────────────
function prefillAddress() {
  const session = VBAuth.session();
  if (!session) return;
  const nameEl = document.getElementById('addr-name');
  if (nameEl && !nameEl.value) nameEl.value = session.name || '';
}

// ── Render checkout summary ───────────────────────────────────
function renderSummary() {
  const coupon    = sessionStorage.getItem('vb_coupon') || '';
  const t         = VBCart.totals(coupon);
  const cart      = VBCart.get();
  const deliveryFee = getDeliveryFee();

  // Items list
  const itemsEl = document.getElementById('cs-items');
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cs-item">
        <div class="cs-item-img"><img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/52x52/FDE8F3/E91E8C?text=VB'"/></div>
        <div><div class="cs-item-name">${item.name}</div><div class="cs-item-qty">Qty: ${item.qty}</div></div>
        <div class="cs-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</div>
      </div>`).join('');
  }

  document.getElementById('cs-subtotal').textContent = fmtPrice(t.subtotal);
  document.getElementById('cs-total').textContent    = fmtPrice(t.subtotal - t.discount + deliveryFee);

  const discRow = document.getElementById('cs-disc-row');
  if (t.discount > 0) {
    discRow.style.display = '';
    document.getElementById('cs-disc').textContent = `−${fmtPrice(t.discount)}`;
  } else {
    discRow.style.display = 'none';
  }
  document.getElementById('cs-delivery').textContent = deliveryFee === 0 ? '🎁 Free' : fmtPrice(deliveryFee);

  // Standard delivery note
  const settings = DB.get(KEYS.settings) || { freeDeliveryMin:2000, deliveryFee:200 };
  const stdPriceEl = document.getElementById('do-price-std');
  const freeNote   = document.getElementById('free-delivery-note');
  if (t.subtotal - t.discount >= settings.freeDeliveryMin) {
    if (stdPriceEl) stdPriceEl.innerHTML = '<span class="do-free">Free 🎁</span>';
    if (freeNote)   freeNote.style.display = '';
  } else {
    if (stdPriceEl) stdPriceEl.textContent = fmtPrice(settings.deliveryFee);
    if (freeNote)   freeNote.style.display = 'none';
  }

  // Update steps visual
  updateSteps(1);
}

function getDeliveryFee() {
  const selected = document.querySelector('input[name="delivery"]:checked')?.value || 'standard';
  const coupon = sessionStorage.getItem('vb_coupon') || '';
  const t = VBCart.totals(coupon);
  const settings = DB.get(KEYS.settings) || { freeDeliveryMin:2000, deliveryFee:200 };
  const afterDisc = t.subtotal - t.discount;
  if (selected === 'standard') return afterDisc >= settings.freeDeliveryMin ? 0 : settings.deliveryFee;
  if (selected === 'express')  return 400;
  if (selected === 'sameday')  return 600;
  return settings.deliveryFee;
}

function setupDeliveryListeners() {
  document.querySelectorAll('input[name="delivery"]').forEach(r => {
    r.addEventListener('change', renderSummary);
  });
}

// ── Step indicator ────────────────────────────────────────────
function updateSteps(active) {
  for (let i=1; i<=4; i++) {
    const el = document.getElementById(`step-${i}`);
    if (!el) continue;
    el.classList.remove('active','done');
    if (i < active) el.classList.add('done');
    else if (i === active) el.classList.add('active');
  }
}

// ── Place Order ───────────────────────────────────────────────
function placeOrder() {
  // Validate
  const name    = document.getElementById('addr-name')?.value.trim();
  const phone   = document.getElementById('addr-phone')?.value.trim();
  const street  = document.getElementById('addr-street')?.value.trim();
  const city    = document.getElementById('addr-city')?.value;
  let valid = true;

  const fields = [
    { id:'addr-name',   errId:'err-name',   val:name,   msg:'Please enter your name' },
    { id:'addr-phone',  errId:'err-phone',  val:phone,  msg:'Please enter your phone' },
    { id:'addr-street', errId:'err-street', val:street, msg:'Please enter your address' },
    { id:'addr-city',   errId:'err-city',   val:city,   msg:'Please select your city' },
  ];
  fields.forEach(f => {
    const errEl = document.getElementById(f.errId);
    if (!f.val) {
      if (errEl) errEl.classList.add('show');
      valid = false;
    } else {
      if (errEl) errEl.classList.remove('show');
    }
  });
  if (!valid) { VBToast.show('Please fill in all required fields', 'warning'); return; }

  const session      = VBAuth.session();
  const coupon       = sessionStorage.getItem('vb_coupon') || '';
  const t            = VBCart.totals(coupon);
  const deliveryFee  = getDeliveryFee();
  const deliveryType = document.querySelector('input[name="delivery"]:checked')?.value || 'standard';
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
  const notes        = document.getElementById('addr-notes')?.value.trim();

  const btn = document.getElementById('place-order-btn');
  if (btn) { btn.classList.add('btn-loading'); btn.disabled = true; }

  setTimeout(() => {
    const order = VBOrders.place({
      customerId:    session?.id || 'guest',
      customerName:  name,
      customerPhone: phone,
      items:         VBCart.get(),
      subtotal:      t.subtotal,
      discount:      t.discount,
      coupon:        coupon,
      deliveryFee,
      total:         t.subtotal - t.discount + deliveryFee,
      deliveryType,
      paymentMethod,
      address:       `${street}, ${city}`,
      notes,
    });

    VBCart.clear();
    sessionStorage.removeItem('vb_coupon');
    window.location.href = `order-success.html?id=${order.id}`;
  }, 800);
}
