/* ============================================
   VELVET BEAUTY — routes/reviews.js
   ============================================ */

const router  = require('express').Router();
const Review  = require('../models/Review');
const Product = require('../models/Product');

/* GET reviews (for a product or all) */
router.get('/', async (req, res) => {
  try {
    const { product, minRating } = req.query;
    const filter = {};
    if (product)   filter.product = product;
    if (minRating) filter.rating  = { $gte: Number(minRating) };

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST create review */
router.post('/', async (req, res) => {
  try {
    const review = await Review.create(req.body);

    /* Update product rating */
    const allReviews = await Review.find({ product: req.body.product });
    const avgRating  = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(req.body.product, {
      rating:  Math.round(avgRating * 10) / 10,
      reviews: allReviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* DELETE review (owner + employee) */
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
