/* ============================================
   VELVET BEAUTY — routes/orders.js
   ============================================ */

const router   = require('express').Router();
const Order    = require('../models/Order');
const Customer = require('../models/Customer');

/* GET all orders */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const orders = await Order
      .find(filter)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET single order */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST create order (from checkout) */
router.post('/', async (req, res) => {
  try {
    /* Auto-generate order number */
    const count = await Order.countDocuments();
    req.body.orderNumber = `VB-${String(100001 + count).padStart(6, '0')}`;

    const order = await Order.create(req.body);

    /* Update customer totalOrders + totalSpent */
    if (req.body.customer) {
      await Customer.findByIdAndUpdate(req.body.customer, {
        $inc: { totalOrders: 1, totalSpent: req.body.total || 0 }
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* PUT update order status (owner + employee) */
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

/* DELETE order (owner only) */
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
