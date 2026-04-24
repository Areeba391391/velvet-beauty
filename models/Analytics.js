/* ============================================================
   VELVET BEAUTY — models/Analytics.js
   ============================================================ */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  month:         { type: String, required: true },   // e.g. "Jan 2025"
  monthIndex:    { type: Number },                   // 0-11
  year:          { type: Number, default: 2025 },
  revenue:       { type: Number, default: 0 },
  orders:        { type: Number, default: 0 },
  newCustomers:  { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
});

module.exports = mongoose.model('Analytics', analyticsSchema);