/* ============================================================
   VELVET BEAUTY — routes/auth.js
   Login, Register, role-based access
   Password plain text stored for demo — add bcrypt for prod
   ============================================================ */

const router   = require('express').Router();
const Customer = require('../models/Customer');

const EMP_CODE   = process.env.EMP_CODE   || 'EMP2025';
const OWNER_CODE = process.env.OWNER_CODE || 'OWNER2025';

/* ── POST /api/auth/register ─────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, city, password, role = 'customer', accessCode = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    /* Access code check for staff */
    if (role === 'employee' && accessCode !== EMP_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid employee access code' });
    }
    if (role === 'owner' && accessCode !== OWNER_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid owner access code' });
    }

    /* Email already taken? */
    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
    }

    /* Save user to DB */
    const user = await Customer.create({
      name,
      email:    email.toLowerCase(),
      password, // store plain for demo; use bcrypt in production
      phone:    phone  || '',
      city:     city   || '',
      role,
    });

    const sessionData = {
      customerId: user._id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
    };

    res.status(201).json({ success: true, data: sessionData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── POST /api/auth/login ────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role = 'customer', accessCode = '' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    /* Access code check for staff roles */
    if (role === 'employee' && accessCode !== EMP_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid employee access code' });
    }
    if (role === 'owner' && accessCode !== OWNER_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid owner access code' });
    }

    /* Find user in DB */
    const user = await Customer.findOne({ email: email.toLowerCase(), role });

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email and role' });
    }

    /* Password check (plain comparison for demo) */
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const sessionData = {
      customerId: user._id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
    };

    res.json({ success: true, data: sessionData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/auth/codes ─────────────────────────────────── */
router.get('/codes', (req, res) => {
  res.json({ success: true, data: { empCode: EMP_CODE, ownerCode: OWNER_CODE } });
});

module.exports = router;