/* ============================================================
   VELVET BEAUTY — routes/customers.js
   Owner: view, update status, delete customers
   ============================================================ */

const router   = require('express').Router();
const Customer = require('../models/Customer');

/* ── GET /api/customers ──────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { role: 'customer' };        // only show customers, not staff
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city:  { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(filter).sort({ joinDate: -1 }).select('-password');
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/customers/:id ──────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/customers ─────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/customers/:id ──────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    // Don't allow password update from this route
    delete req.body.password;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/customers/:id ───────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;