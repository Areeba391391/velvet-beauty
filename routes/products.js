/* ============================================
   VELVET BEAUTY — routes/products.js
   GET, POST, PUT, DELETE for products
   ============================================ */

const router  = require('express').Router();
const Product = require('../models/Product');

/* GET all products (with optional filters) */
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, minRating, badge, isNew, limit = 50, sort = 'default' } = req.query;
    const filter = { isActive: true };

    if (category)  filter.category = category;
    if (badge)     filter.badge    = badge;
    if (isNew === 'true') filter.isNew = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const sortMap = {
      'price-asc':  { price: 1 },
      'price-desc': { price: -1 },
      'rating':     { rating: -1 },
      'newest':     { createdAt: -1 },
      'bestseller': { sold: -1 },
      'default':    { createdAt: -1 }
    };

    const products = await Product
      .find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET single product */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST create product (owner only) */
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* PUT update product (owner only) */
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* DELETE product (owner only) */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
