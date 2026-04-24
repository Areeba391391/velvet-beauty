/* ============================================================
   VELVET BEAUTY — server.js
   Express + MongoDB (Mongoose) Backend
   Run: node server.js  →  http://localhost:3000
   ============================================================ */

require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Static Files ── */
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/views',  express.static(path.join(__dirname, 'views')));

/* ── MongoDB Connection ── */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('  ✅  MongoDB connected successfully!'))
  .catch(err => { console.error('  ❌  MongoDB connection error:', err.message); process.exit(1); });

/* ── API Routes ── */
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth',      require('./routes/auth'));

/* ── Settings API (in-memory defaults, can be extended to DB later) ── */
let appSettings = {
  empCode:         process.env.EMP_CODE   || 'EMP2025',
  ownerCode:       process.env.OWNER_CODE || 'OWNER2025',
  freeDeliveryMin: 2000,
  deliveryFee:     200,
};
let appPromo = {
  active: false, eyebrow: 'Limited Offer', title: '', desc: '',
  code: '', codePct: '', ctaText: 'Shop Now', ctaLink: 'shop.html', countdownHours: 8,
};

app.get('/api/settings',      (req, res) => res.json({ success: true, data: appSettings }));
app.put('/api/settings',      (req, res) => { appSettings = { ...appSettings, ...req.body }; res.json({ success: true, data: appSettings }); });
app.get('/api/promo',         (req, res) => res.json({ success: true, data: appPromo }));
app.put('/api/promo',         (req, res) => { appPromo = { ...appPromo, ...req.body }; res.json({ success: true, data: appPromo }); });

/* ── HTML Pages ── */
app.get('/', (req, res) => res.redirect('/views/index.html'));

app.get('/:page.html', (req, res) => {
  const file = path.join(__dirname, 'views', req.params.page + '.html');
  res.sendFile(file, err => { if (err) res.redirect('/views/index.html'); });
});

/* ── Start Server ── */
app.listen(PORT, () => {
  console.log('');
  console.log('  ✨  Velvet Beauty is running!');
  console.log(`  🌐  Open: http://localhost:${PORT}`);
  console.log('');
  console.log('  👑  Owner login:    owner@velvetbeauty.pk / owner123');
  console.log('  🏷️   Employee login: employee@velvetbeauty.pk / emp123');
  console.log('  👤  Register a customer account on the login page');
  console.log('');
  console.log('  📦  API Endpoints:');
  console.log(`       GET/POST   http://localhost:${PORT}/api/products`);
  console.log(`       GET/POST   http://localhost:${PORT}/api/orders`);
  console.log(`       GET/POST   http://localhost:${PORT}/api/customers`);
  console.log(`       GET/POST   http://localhost:${PORT}/api/reviews`);
  console.log(`       GET        http://localhost:${PORT}/api/analytics`);
  console.log(`       POST       http://localhost:${PORT}/api/auth/login`);
  console.log(`       POST       http://localhost:${PORT}/api/auth/register`);
  console.log('');
});