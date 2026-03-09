const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  month: { type: String, required: true },
  monthIndex: { type: Number },
  year: { type: Number, default: 2024 },
  revenue: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  newCustomers: { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
});

module.exports = mongoose.model('Analytics', analyticsSchema);