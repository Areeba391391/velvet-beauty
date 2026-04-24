/* ============================================================
   VELVET BEAUTY — routes/products.js
   GET, POST, PUT, DELETE for products
   GET /seed — populates DB with sample data if empty
   ============================================================ */

const router  = require('express').Router();
const Product = require('../models/Product');

/* ── GET /api/products ───────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const {
      category, minPrice, maxPrice, minRating,
      badge, isNew, limit = 100, sort = 'default'
    } = req.query;

    const filter = { isActive: true };
    if (category)       filter.category = category;
    if (badge)          filter.badge    = badge;
    if (isNew === 'true') filter.isNew  = true;
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
      'default':    { createdAt: -1 },
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

/* ── GET /api/products/seed ──────────────────────────────── */
router.get('/seed', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.json({ success: true, message: `DB already has ${count} products. No seed needed.` });
    }

    const sampleProducts = [
      { name: 'Velvet Matte Lipstick', category: 'Lips', price: 1200, originalPrice: 1500, badge: 'bestseller', rating: 4.8, reviews: 124, sold: 340, isNew: false, stock: 50, image: 'https://images.unsplash.com/photo-1625093404046-0307b78cabd3?w=600', description: 'Long-lasting matte formula with rich pigment.', shades: ['#C0392B','#A93226','#E74C3C','#8E44AD','#D35400'] },
      { name: 'Glass Skin Foundation', category: 'Face', price: 2800, originalPrice: 3500, badge: 'bestseller', rating: 4.7, reviews: 89, sold: 210, isNew: false, stock: 35, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600', description: 'Lightweight foundation for a flawless glass-skin look.' },
      { name: 'Smoky Eye Palette', category: 'Eyes', price: 1800, badge: 'new', rating: 4.6, reviews: 56, sold: 120, isNew: true, stock: 40, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600', description: '12 blendable shades for the perfect smoky eye.' },
      { name: 'Rose Blush Compact', category: 'Cheeks', price: 950, originalPrice: 1200, badge: 'sale', rating: 4.5, reviews: 73, sold: 185, isNew: false, stock: 60, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=600', description: 'Silky-smooth blush that gives a natural rosy glow.', shades: ['#FFB6C1','#FF69B4','#E91E8C'] },
      { name: 'Hydra-Glow Serum', category: 'Skincare', price: 3200, badge: 'bestseller', rating: 4.9, reviews: 201, sold: 420, isNew: false, stock: 25, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600', description: 'Vitamin C + hyaluronic acid for radiant, hydrated skin.' },
      { name: 'Glitter Liner', category: 'Eyes', price: 750, badge: 'new', rating: 4.4, reviews: 38, sold: 95, isNew: true, stock: 70, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600', description: 'Precision glitter liner for dazzling eye looks.', shades: ['#FFD700','#C0C0C0','#B22222','#000000'] },
      { name: 'Plump & Shine Lip Gloss', category: 'Lips', price: 880, badge: 'new', rating: 4.6, reviews: 47, sold: 115, isNew: true, stock: 55, image: 'https://images.unsplash.com/photo-1631214503851-25e34c5e5979?w=600', description: 'High-shine gloss with a plumping peptide complex.', shades: ['#FFB6C1','#FF1493','#E91E8C','#C71585'] },
      { name: 'Contour & Highlight Duo', category: 'Face', price: 1650, originalPrice: 2000, rating: 4.7, reviews: 62, sold: 140, isNew: false, stock: 30, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600', description: 'Sculpt and highlight in one compact palette.' },
    ];

    await Product.insertMany(sampleProducts);
    res.json({ success: true, message: `Seeded ${sampleProducts.length} products successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /api/products/:id ───────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST /api/products ──────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── PUT /api/products/:id ───────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── DELETE /api/products/:id ────────────────────────────── */
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