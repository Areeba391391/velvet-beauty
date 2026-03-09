/* ============================================
   VELVET BEAUTY — routes/auth.js
   Login, Register, role-based access
   NOTE: Simple demo auth — no JWT in this
   version. Add bcrypt + JWT for production.
   ============================================ */

const router   = require('express').Router();
const Customer = require('../models/Customer');

/* Access codes (ideally in .env) */
const EMP_CODE   = process.env.EMP_CODE   || 'EMP2025';
const OWNER_CODE = process.env.OWNER_CODE || 'OWNER2025';

/* ── REGISTER ── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, city, password, role, accessCode } = req.body;

    /* Role validation */
    if (role === 'employee' && accessCode !== EMP_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid employee code' });
    }
    if (role === 'owner' && accessCode !== OWNER_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid owner code' });
    }

    /* Check existing */
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    /* For customer role: save to Customer model */
    let userData = { id: 'u' + Date.now(), name, email, phone, city, role };

    if (role === 'customer') {
      const customer = await Customer.create({ name, email, phone, city });
      userData.customerId = customer._id;
    }

    res.status(201).json({ success: true, data: userData });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── LOGIN ── */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, accessCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    /* Role code validation */
    if (role === 'employee' && accessCode !== EMP_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid employee code' });
    }
    if (role === 'owner' && accessCode !== OWNER_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid owner code' });
    }

    /* Demo: accept any valid email for the role
       In production: check hashed password from DB */
    const name = role === 'owner'    ? 'Store Owner'   :
                 role === 'employee' ? 'Staff Member'   :
                 email.split('@')[0];

    const session = {
      id:    'u' + Date.now(),
      name,
      email,
      role: role || 'customer'
    };

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET access codes (owner only — for settings page) */
router.get('/codes', (req, res) => {
  res.json({ success: true, data: { empCode: EMP_CODE, ownerCode: OWNER_CODE } });
});

module.exports = router;
