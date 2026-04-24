/* ============================================================
   VELVET BEAUTY — models/Order.js
   ============================================================ */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber:   { type: String, required: true, unique: true },
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerName:  { type: String, required: true },
  items: [{
    product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    productName: { type: String },
    quantity:    { type: Number, default: 1 },
    price:       { type: Number, default: 0 },
  }],
  total:         { type: Number, required: true },
  status:        { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  city:          { type: String, default: '' },
  address:       { type: String, default: '' },
  paymentMethod: { type: String, default: 'cod' },
  deliveryType:  { type: String, default: 'standard' },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);