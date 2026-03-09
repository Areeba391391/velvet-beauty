const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  city: { type: String },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['New', 'Regular', 'VIP'], default: 'New' },
  avatar: { type: String, default: '#E91E8C' },
  joinDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);