/* ============================================
   VELVET BEAUTY — server.js
   Express server connecting to MongoDB
   ============================================ */

const express    = require('express');
const mongoose   = require('mongoose');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Static files ── */
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/views',  express.static(path.join(__dirname, 'views')));

/* ── MongoDB connection ── */
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/velvet_beauty')
  .then(() => {
    console.log('✅ MongoDB connected');
    seedDatabase(); /* seed dummy data if empty */
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

/* ── Routes ── */
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth',      require('./routes/auth'));

/* ── Serve HTML pages ── */
app.get('/',              (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/shop',          (req, res) => res.sendFile(path.join(__dirname, 'views', 'shop.html')));
app.get('/product/:id',   (req, res) => res.sendFile(path.join(__dirname, 'views', 'product-detail.html')));
app.get('/cart',          (req, res) => res.sendFile(path.join(__dirname, 'views', 'cart.html')));
app.get('/wishlist',      (req, res) => res.sendFile(path.join(__dirname, 'views', 'wishlist.html')));
app.get('/checkout',      (req, res) => res.sendFile(path.join(__dirname, 'views', 'checkout.html')));
app.get('/order-success', (req, res) => res.sendFile(path.join(__dirname, 'views', 'order-success.html')));
app.get('/login',         (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register',      (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/dashboard',     (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard-owner.html')));
app.get('/dashboard-emp', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard-emp.html')));

/* ── 404 fallback ── */
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'views', 'index.html')));

/* ── Database Seeder ── */
async function seedDatabase() {
  try {
    const Product  = require('./models/Product');
    const Customer = require('./models/Customer');
    const Order    = require('./models/Order');
    const Review   = require('./models/Review');
    const Analytics = require('./models/Analytics');

    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`ℹ️  Database already has ${productCount} products. Skipping seed.`);
      return;
    }

    console.log('🌱 Seeding database with dummy data...');

    /* ── Products ── */
    const products = await Product.insertMany([
      { name:'Velvet Red Matte Lipstick', category:'Lips',     price:1299, originalPrice:1799, stock:45, sold:312, rating:4.8, reviews:124, shade:'Velvet Red',   color:'#C2185B', badge:'Bestseller', isNew:false, description:'Richly pigmented matte lipstick with vitamin E. Long-lasting, transfer-proof formula.' },
      { name:'Plum Kiss Lip Colour',      category:'Lips',     price:1199, originalPrice:1499, stock:38, sold:198, rating:4.6, reviews:87,  shade:'Deep Plum',    color:'#880E4F', badge:'Sale',       isNew:false, description:'Deep sultry plum shade with satin finish.' },
      { name:'Rose Nude Velvet Lip',      category:'Lips',     price:1399, originalPrice:null, stock:60, sold:276, rating:4.9, reviews:203, shade:'Rose Nude',    color:'#C9956C', badge:'Hot',        isNew:true,  description:'Perfect everyday nude with velvety matte finish.' },
      { name:'Berry Gloss Lip Shine',     category:'Lips',     price:899,  originalPrice:1199, stock:22, sold:145, rating:4.5, reviews:62,  shade:'Berry Crush',  color:'#8B3A7A', badge:'Sale',       isNew:false, description:'High-shine gloss with berry tint and hyaluronic acid.' },
      { name:'Coral Pop Liquid Lipstick', category:'Lips',     price:1499, originalPrice:null, stock:35, sold:89,  rating:4.7, reviews:41,  shade:'Coral Pop',    color:'#FF6B6B', badge:'New',        isNew:true,  description:'Vibrant coral, waterproof, 16-hour wear.' },
      { name:'Flawless Satin Foundation', category:'Face',     price:2199, originalPrice:2799, stock:30, sold:421, rating:4.8, reviews:318, shade:'Natural Beige',color:'#D4A76A', badge:'Bestseller', isNew:false, description:'Full coverage satin foundation with SPF 20.' },
      { name:'HD Concealer Pen',          category:'Face',     price:1599, originalPrice:null, stock:55, sold:267, rating:4.7, reviews:156, shade:'Porcelain',    color:'#F5DEB3', badge:'New',        isNew:true,  description:'Lightweight concealer pen. Covers dark circles instantly.' },
      { name:'Silky Matte Setting Powder',category:'Face',     price:1299, originalPrice:1599, stock:42, sold:188, rating:4.5, reviews:94,  shade:'Translucent',  color:'#FFF8F0', badge:'Sale',       isNew:false, description:'Finely milled translucent powder. Sets makeup all day.' },
      { name:'Dewy Glow Primer',          category:'Face',     price:1899, originalPrice:null, stock:28, sold:134, rating:4.6, reviews:72,  shade:'Universal',    color:'#FFE4C4', badge:null,         isNew:false, description:'Illuminating primer. Vitamin C infused.' },
      { name:'Smoke & Sultry Eyeshadow Palette', category:'Eyes', price:2999, originalPrice:3999, stock:20, sold:356, rating:4.9, reviews:289, shade:'Smokey', color:'#4A1A40', badge:'Bestseller', isNew:false, description:'12-shade highly pigmented palette.' },
      { name:'Waterproof Kohl Kajal',     category:'Eyes',     price:699,  originalPrice:899,  stock:80, sold:534, rating:4.7, reviews:412, shade:'Jet Black',   color:'#1A0A12', badge:'Hot',        isNew:false, description:'Intensely black waterproof kajal. Lasts 24 hours.' },
      { name:'Volume Boost Mascara',      category:'Eyes',     price:1199, originalPrice:null, stock:47, sold:298, rating:4.6, reviews:167, shade:'Black',        color:'#1A0A12', badge:'New',        isNew:true,  description:'Volumizing mascara with mega-brush.' },
      { name:'Precision Liquid Eyeliner', category:'Eyes',     price:899,  originalPrice:1099, stock:60, sold:221, rating:4.5, reviews:103, shade:'Deep Black',   color:'#0D0608', badge:'Sale',       isNew:false, description:'Ultra-fine tip. Smudge-proof, all-day wear.' },
      { name:'Rose Petal Blush',          category:'Cheeks',   price:1499, originalPrice:null, stock:35, sold:187, rating:4.8, reviews:98,  shade:'Rose Pink',   color:'#FFB7C5', badge:'New',        isNew:true,  description:'Natural rose petal pigments. Builds sheer to vibrant.' },
      { name:'Champagne Glow Highlighter',category:'Cheeks',   price:1799, originalPrice:2299, stock:25, sold:145, rating:4.7, reviews:76,  shade:'Champagne',   color:'#F5E6CA', badge:'Sale',       isNew:false, description:'Blinding champagne highlighter with multi-dimensional shimmer.' },
      { name:'Sun-Kissed Bronzer',        category:'Cheeks',   price:1599, originalPrice:null, stock:18, sold:92,  rating:4.5, reviews:54,  shade:'Golden Bronze',color:'#C8A560', badge:null,         isNew:false, description:'Natural sun-kissed glow. Perfect for contouring.' },
      { name:'Hydra-Glow Vitamin C Serum',category:'Skincare', price:2499, originalPrice:2999, stock:40, sold:312, rating:4.9, reviews:247, shade:null,           color:'#FFF3CD', badge:'Bestseller', isNew:false, description:'15% Vitamin C serum. Reduces dark spots, boosts radiance.' },
      { name:'Velvet Rose Moisturiser',   category:'Skincare', price:1999, originalPrice:null, stock:52, sold:198, rating:4.7, reviews:134, shade:null,           color:'#FFE4E1', badge:'New',        isNew:true,  description:'Gel-cream moisturiser with rose water. 72-hour hydration.' },
      { name:'Purifying Clay Mask',       category:'Skincare', price:1299, originalPrice:1599, stock:33, sold:156, rating:4.6, reviews:88,  shade:null,           color:'#D4C4A8', badge:'Sale',       isNew:false, description:'Kaolin clay mask with tea tree. Minimises pores.' },
      { name:'SPF 50 Sunscreen Gel',      category:'Skincare', price:1799, originalPrice:null, stock:65, sold:423, rating:4.8, reviews:312, shade:null,           color:'#F0FFF0', badge:'Hot',        isNew:false, description:'Lightweight SPF 50 PA+++. No white cast.' }
    ]);

    console.log(`✅ ${products.length} products seeded`);

    /* ── Customers ── */
    const customers = await Customer.insertMany([
      { name:'Ayesha Khan',  email:'ayesha@example.com', phone:'0300-1234567', city:'Lahore',     totalOrders:8,  totalSpent:24500, status:'VIP',     joinDate:new Date('2024-06-15') },
      { name:'Sara Malik',   email:'sara@example.com',   phone:'0321-9876543', city:'Karachi',    totalOrders:5,  totalSpent:14200, status:'Regular', joinDate:new Date('2024-08-22') },
      { name:'Maryam Rizvi', email:'maryam@example.com', phone:'0333-5551234', city:'Islamabad',  totalOrders:3,  totalSpent:8900,  status:'Regular', joinDate:new Date('2024-09-10') },
      { name:'Fatima Ahmed', email:'fatima@example.com', phone:'0345-7654321', city:'Rawalpindi', totalOrders:1,  totalSpent:2499,  status:'New',     joinDate:new Date('2025-02-28') },
      { name:'Nadia Iqbal',  email:'nadia@example.com',  phone:'0300-9998888', city:'Lahore',     totalOrders:12, totalSpent:38700, status:'VIP',     joinDate:new Date('2024-03-05') },
      { name:'Hina Shah',    email:'hina@example.com',   phone:'0322-4445566', city:'Karachi',    totalOrders:4,  totalSpent:11200, status:'Regular', joinDate:new Date('2024-07-19') }
    ]);
    console.log(`✅ ${customers.length} customers seeded`);

    /* ── Orders ── */
    await Order.insertMany([
      { orderNumber:'VB-100001', customerName:'Ayesha Khan',  customer:customers[0]._id, items:[{productName:'Velvet Red Matte Lipstick',quantity:2,price:1299}], total:3997, status:'delivered', city:'Lahore' },
      { orderNumber:'VB-100002', customerName:'Sara Malik',   customer:customers[1]._id, items:[{productName:'Flawless Satin Foundation',quantity:1,price:2199}], total:2199, status:'shipped',   city:'Karachi' },
      { orderNumber:'VB-100003', customerName:'Maryam Rizvi', customer:customers[2]._id, items:[{productName:'Smoke & Sultry Eyeshadow Palette',quantity:1,price:2999}], total:2999, status:'processing',city:'Islamabad' },
      { orderNumber:'VB-100004', customerName:'Fatima Ahmed', customer:customers[3]._id, items:[{productName:'Hydra-Glow Vitamin C Serum',quantity:1,price:2499}], total:2499, status:'processing',city:'Rawalpindi' },
      { orderNumber:'VB-100005', customerName:'Nadia Iqbal',  customer:customers[4]._id, items:[{productName:'Waterproof Kohl Kajal',quantity:3,price:699}], total:2097, status:'delivered', city:'Lahore' }
    ]);
    console.log('✅ Orders seeded');

    /* ── Reviews ── */
    await Review.insertMany([
      { product:products[0]._id, customer:customers[0]._id, customerName:'Ayesha Khan',  rating:5, text:'Absolutely love this lipstick! Rich pigment, lasts all day.',    helpful:42 },
      { product:products[0]._id, customer:customers[1]._id, customerName:'Sara Malik',   rating:5, text:"Best matte formula I've tried. Packaging is so luxurious!",      helpful:28 },
      { product:products[9]._id, customer:customers[2]._id, customerName:'Maryam Rizvi', rating:5, text:'Pigments are insane. Blends beautifully. No fallout!',          helpful:35 },
      { product:products[5]._id, customer:customers[4]._id, customerName:'Nadia Iqbal',  rating:4, text:'Great coverage and finish. Wish there were more shade options.',  helpful:19 },
      { product:products[16]._id,customer:customers[3]._id, customerName:'Fatima Ahmed', rating:5, text:'Saw results in just 2 weeks! Skin looks so much brighter.',     helpful:51 }
    ]);
    console.log('✅ Reviews seeded');

    /* ── Analytics ── */
    await Analytics.insertMany([
      { month:'October',  monthIndex:9,  year:2024, revenue:145000, orders:58, newCustomers:22, avgOrderValue:2500 },
      { month:'November', monthIndex:10, year:2024, revenue:189000, orders:74, newCustomers:31, avgOrderValue:2554 },
      { month:'December', monthIndex:11, year:2024, revenue:256000, orders:98, newCustomers:45, avgOrderValue:2612 },
      { month:'January',  monthIndex:0,  year:2025, revenue:198000, orders:81, newCustomers:28, avgOrderValue:2444 },
      { month:'February', monthIndex:1,  year:2025, revenue:221000, orders:89, newCustomers:33, avgOrderValue:2483 },
      { month:'March',    monthIndex:2,  year:2025, revenue:87000,  orders:34, newCustomers:12, avgOrderValue:2559 }
    ]);
    console.log('✅ Analytics seeded');
    console.log('🎉 Database seeding complete!');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
}

/* ── Start Server ── */
app.listen(PORT, () => {
  console.log(`\n🚀 Velvet Beauty server running at http://localhost:${PORT}`);
  console.log(`📦 Dashboard Owner: http://localhost:${PORT}/dashboard`);
  console.log(`👤 Dashboard Emp:   http://localhost:${PORT}/dashboard-emp\n`);
});
