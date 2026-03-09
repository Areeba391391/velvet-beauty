/* ============================================
   VELVET BEAUTY — routes/analytics.js
   Owner only: revenue & order analytics
   ============================================ */

const router    = require('express').Router();
const Analytics = require('../models/Analytics');
const Order     = require('../models/Order');

/* GET analytics data */
router.get('/', async (req, res) => {
  try {
    const data = await Analytics.find().sort({ year: 1, monthIndex: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET live summary from orders */
router.get('/summary', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'cancelled' } });

    const totalRevenue  = orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders   = orders.length;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    const delivered     = orders.filter(o => o.status === 'delivered').length;
    const pending       = await Order.countDocuments({ status: 'processing' });

    res.json({
      success: true,
      data: { totalRevenue, totalOrders, avgOrderValue, delivered, pending }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
