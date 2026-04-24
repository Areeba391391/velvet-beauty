/* ============================================================
   VELVET BEAUTY — models/Review.js
   ============================================================ */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:  { type: String, default: '' },      // denormalized for display
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName: { type: String, required: true },
  rating:       { type: Number, required: true, min: 1, max: 5 },
  text:         { type: String, required: true },
  helpful:      { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);