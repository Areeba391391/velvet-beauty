/* ============================================================
   VELVET BEAUTY — models/Product.js
   ============================================================ */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, enum: ['Lips', 'Face', 'Eyes', 'Cheeks', 'Skincare'], required: true },
  price:         { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null },
  stock:         { type: Number, default: 0, min: 0 },
  sold:          { type: Number, default: 0 },
  rating:        { type: Number, default: 4.5, min: 0, max: 5 },
  reviews:       { type: Number, default: 0 },
  image:         { type: String, default: '' },
  shades:        [{ type: String }],
  shade:         { type: String },
  color:         { type: String, default: '#E91E8C' },
  description:   { type: String, default: '' },
  badge:         { type: String, default: '' },
  isNew:         { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);