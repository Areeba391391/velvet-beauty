/* ============================================================
   VELVET BEAUTY — server.js (FIXED)
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

/* ── Customer Model (SAME model used by auth.js) ── */
const Customer = require('./models/Customer');

/* ── Auto Seed Users (Owner + Employee) ── */
async function seedUsers() {
  try {
    const ownerEmail = 'owner@velvetbeauty.pk';
    const empEmail   = 'employee@velvetbeauty.pk';

    // Remove old bcrypt-hashed users if they exist (they won't work with plain-text auth)
    const oldOwner = await Customer.findOne({ email: ownerEmail });
    if (oldOwner) {
      // If password looks like a bcrypt hash, delete and re-create with plain text
      if (oldOwner.password && oldOwner.password.startsWith('$2')) {
        await Customer.deleteOne({ email: ownerEmail });
        console.log('  🔄  Old hashed owner removed, re-seeding...');
      }
    }
    const oldEmp = await Customer.findOne({ email: empEmail });
    if (oldEmp) {
      if (oldEmp.password && oldEmp.password.startsWith('$2')) {
        await Customer.deleteOne({ email: empEmail });
        console.log('  🔄  Old hashed employee removed, re-seeding...');
      }
    }

    const ownerExists = await Customer.findOne({ email: ownerEmail });
    const empExists   = await Customer.findOne({ email: empEmail });

    if (!ownerExists) {
      await Customer.create({
        name:     'Owner',
        email:    ownerEmail,
        password: 'owner123',   // plain text — matches auth.js plain comparison
        phone:    '',
        city:     '',
        role:     'owner',
      });
      console.log('  👑  Owner seeded!');
    }

    if (!empExists) {
      await Customer.create({
        name:     'Employee',
        email:    empEmail,
        password: 'emp123',     // plain text — matches auth.js plain comparison
        phone:    '',
        city:     '',
        role:     'employee',
      });
      console.log('  🏷️   Employee seeded!');
    }

    console.log('  ✅  Users ready!');
  } catch (err) {
    console.error('  ❌  Seeding error:', err.message);
  }
}

/* ── MongoDB Connection ── */
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('  ✅  MongoDB connected successfully!');
    await seedUsers();
  })
  .catch(err => {
    console.error('  ❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ── API Routes ── */
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth',      require('./routes/auth'));

/* ── Settings API ── */
let appSettings = {
  empCode:         process.env.EMP_CODE   || 'EMP2025',
  ownerCode:       process.env.OWNER_CODE || 'OWNER2025',
  freeDeliveryMin: 2000,
  deliveryFee:     200,
};

let appPromo = {
  active: false,
  eyebrow: 'Limited Offer',
  title: '',
  desc: '',
  code: '',
  codePct: '',
  ctaText: 'Shop Now',
  ctaLink: 'shop.html',
  countdownHours: 8,
};

app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: appSettings });
});

app.put('/api/settings', (req, res) => {
  appSettings = { ...appSettings, ...req.body };
  res.json({ success: true, data: appSettings });
});

app.get('/api/promo', (req, res) => {
  res.json({ success: true, data: appPromo });
});

app.put('/api/promo', (req, res) => {
  appPromo = { ...appPromo, ...req.body };
  res.json({ success: true, data: appPromo });
});

/* ── HTML Pages ── */
app.get('/', (req, res) => {
  res.redirect('/views/index.html');
});

app.get('/:page.html', (req, res) => {
  const file = path.join(__dirname, 'views', req.params.page + '.html');
  res.sendFile(file, err => {
    if (err) res.redirect('/views/index.html');
  });
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
