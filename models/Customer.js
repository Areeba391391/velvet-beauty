/* ============================================================
   VELVET BEAUTY — models/Customer.js
   Stores customers + staff accounts (role-based)
   ============================================================ */

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },          // plain for demo; use bcrypt in production
  phone:       { type: String, default: '' },
  city:        { type: String, default: '' },
  role:        { type: String, enum: ['customer', 'employee', 'owner'], default: 'customer' },
  totalOrders: { type: Number, default: 0 },
  totalSpent:  { type: Number, default: 0 },
  status:      { type: String, enum: ['New', 'Regular', 'VIP'], default: 'New' },
  joinDate:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);