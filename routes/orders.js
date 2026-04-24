/* ============================================================
   VELVET BEAUTY — routes/orders.js
   Full CRUD + auto analytics update on order create
   ============================================================ */

const router    = require('express').Router();
const Order     = require('../models/Order');
const Customer  = require('../models/Customer');
const Analytics = require('../models/Analytics');

/* Helper: update analytics when order is placed */
async function updateAnalytics(total) {
  try {
    const now       = new Date();
    const monthName = now.toLocaleString('en-US', { month: 'short' }) + ' ' + now.getFullYear();
    const monthIdx  = now.getMonth();
    const year      = now.getFullYear();

    let record = await Analytics.findOne({ month: monthName });
    if (!record) {
      record = new Analytics({ month: monthName, monthIndex: monthIdx, year, revenue: 0, orders: 0 });
    }
    record.revenue += total;
    record.orders  += 1;
    record.avgOrderValue = Math.round(record.revenue / record.orders);
    await record.save();
  } catch (e) {
    console.error('Analytics update error:', e.message);
  }
}

/* ── GET /api/orders ─────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 200 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const orders = await Order
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/orders/:id ─────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/orders ────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    /* Auto-generate order number */
    const count = await Order.countDocuments();
    req.body.orderNumber = `VB-${String(100001 + count).padStart(6, '0')}`;

    const order = await Order.create(req.body);

    /* Update customer stats */
    if (req.body.customer) {
      await Customer.findByIdAndUpdate(req.body.customer, {
        $inc: { totalOrders: 1, totalSpent: req.body.total || 0 }
      });
    }

    /* Update monthly analytics */
    await updateAnalytics(req.body.total || 0);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/orders/:id ─────────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/orders/:id ──────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;