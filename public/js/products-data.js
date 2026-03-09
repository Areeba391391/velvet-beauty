/* ============================================
   VELVET BEAUTY — products-data.js
   Shared dummy product data for all pages.
   In production this comes from MongoDB API.
   ============================================ */

const VB_PRODUCTS = [
  /* ── LIPS ── */
  {
    id: 'p001', name: 'Velvet Red Matte Lipstick', category: 'Lips',
    price: 1299, originalPrice: 1799, stock: 45, sold: 312,
    rating: 4.8, reviews: 124, shade: 'Velvet Red', color: '#C2185B',
    badge: 'Bestseller', isNew: false, isActive: true,
    description: 'Richly pigmented matte lipstick with vitamin E. Long-lasting, transfer-proof formula.',
    image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=400&q=80'
  },
  {
    id: 'p002', name: 'Plum Kiss Lip Colour', category: 'Lips',
    price: 1199, originalPrice: 1499, stock: 38, sold: 198,
    rating: 4.6, reviews: 87, shade: 'Deep Plum', color: '#880E4F',
    badge: 'Sale', isNew: false, isActive: true,
    description: 'Deep, sultry plum shade with a satin finish. Hydrating formula.',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=80'
  },
  {
    id: 'p003', name: 'Rose Nude Velvet Lip', category: 'Lips',
    price: 1399, originalPrice: null, stock: 60, sold: 276,
    rating: 4.9, reviews: 203, shade: 'Rose Nude', color: '#C9956C',
    badge: 'Hot', isNew: true, isActive: true,
    description: 'Perfect everyday nude with a velvety matte finish. Suits all skin tones.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80'
  },
  {
    id: 'p004', name: 'Berry Gloss Lip Shine', category: 'Lips',
    price: 899, originalPrice: 1199, stock: 22, sold: 145,
    rating: 4.5, reviews: 62, shade: 'Berry Crush', color: '#8B3A7A',
    badge: 'Sale', isNew: false, isActive: true,
    description: 'High-shine gloss with berry tint. Plumping formula with hyaluronic acid.',
    image: 'https://images.unsplash.com/photo-1599733594230-6b823276abcc?w=400&q=80'
  },
  {
    id: 'p005', name: 'Coral Pop Liquid Lipstick', category: 'Lips',
    price: 1499, originalPrice: null, stock: 35, sold: 89,
    rating: 4.7, reviews: 41, shade: 'Coral Pop', color: '#FF6B6B',
    badge: 'New', isNew: true, isActive: true,
    description: 'Vibrant coral liquid lipstick. Waterproof, smudge-proof, 16-hour wear.',
    image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2b56?w=400&q=80'
  },

  /* ── FACE ── */
  {
    id: 'p006', name: 'Flawless Satin Foundation', category: 'Face',
    price: 2199, originalPrice: 2799, stock: 30, sold: 421,
    rating: 4.8, reviews: 318, shade: 'Natural Beige', color: '#D4A76A',
    badge: 'Bestseller', isNew: false, isActive: true,
    description: 'Full coverage satin foundation with SPF 20. Available in 12 shades.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'
  },
  {
    id: 'p007', name: 'HD Concealer Pen', category: 'Face',
    price: 1599, originalPrice: null, stock: 55, sold: 267,
    rating: 4.7, reviews: 156, shade: 'Porcelain', color: '#F5DEB3',
    badge: 'New', isNew: true, isActive: true,
    description: 'Lightweight concealer pen with built-in brush. Covers dark circles instantly.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80'
  },
  {
    id: 'p008', name: 'Silky Matte Setting Powder', category: 'Face',
    price: 1299, originalPrice: 1599, stock: 42, sold: 188,
    rating: 4.5, reviews: 94, shade: 'Translucent', color: '#FFF8F0',
    badge: 'Sale', isNew: false, isActive: true,
    description: 'Finely milled translucent powder. Sets makeup all day, minimises pores.',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=80'
  },
  {
    id: 'p009', name: 'Dewy Glow Primer', category: 'Face',
    price: 1899, originalPrice: null, stock: 28, sold: 134,
    rating: 4.6, reviews: 72, shade: 'Universal', color: '#FFE4C4',
    badge: null, isNew: false, isActive: true,
    description: 'Illuminating primer that creates a dewy, glass-skin base. Vitamin C infused.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'
  },

  /* ── EYES ── */
  {
    id: 'p010', name: 'Smoke & Sultry Eyeshadow Palette', category: 'Eyes',
    price: 2999, originalPrice: 3999, stock: 20, sold: 356,
    rating: 4.9, reviews: 289, shade: 'Smokey', color: '#4A1A40',
    badge: 'Bestseller', isNew: false, isActive: true,
    description: '12-shade highly pigmented palette. Mattes, shimmers and glitters included.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80'
  },
  {
    id: 'p011', name: 'Waterproof Kohl Kajal', category: 'Eyes',
    price: 699, originalPrice: 899, stock: 80, sold: 534,
    rating: 4.7, reviews: 412, shade: 'Jet Black', color: '#1A0A12',
    badge: 'Hot', isNew: false, isActive: true,
    description: 'Intensely black, waterproof kajal. Glides on smoothly, lasts 24 hours.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80'
  },
  {
    id: 'p012', name: 'Volume Boost Mascara', category: 'Eyes',
    price: 1199, originalPrice: null, stock: 47, sold: 298,
    rating: 4.6, reviews: 167, shade: 'Black', color: '#1A0A12',
    badge: 'New', isNew: true, isActive: true,
    description: 'Volumizing mascara with mega-brush. Lengthens and curls for dramatic lashes.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80'
  },
  {
    id: 'p013', name: 'Precision Liquid Eyeliner', category: 'Eyes',
    price: 899, originalPrice: 1099, stock: 60, sold: 221,
    rating: 4.5, reviews: 103, shade: 'Deep Black', color: '#0D0608',
    badge: 'Sale', isNew: false, isActive: true,
    description: 'Ultra-fine tip liquid liner. Precise application, smudge-proof, all-day wear.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80'
  },

  /* ── CHEEKS ── */
  {
    id: 'p014', name: 'Rose Petal Blush', category: 'Cheeks',
    price: 1499, originalPrice: null, stock: 35, sold: 187,
    rating: 4.8, reviews: 98, shade: 'Rose Pink', color: '#FFB7C5',
    badge: 'New', isNew: true, isActive: true,
    description: 'Finely milled blush with natural rose petal pigments. Builds from sheer to vibrant.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'
  },
  {
    id: 'p015', name: 'Champagne Glow Highlighter', category: 'Cheeks',
    price: 1799, originalPrice: 2299, stock: 25, sold: 145,
    rating: 4.7, reviews: 76, shade: 'Champagne', color: '#F5E6CA',
    badge: 'Sale', isNew: false, isActive: true,
    description: 'Blinding champagne highlighter with multi-dimensional shimmer. Mix of silver and gold.',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=80'
  },
  {
    id: 'p016', name: 'Sun-Kissed Bronzer', category: 'Cheeks',
    price: 1599, originalPrice: null, stock: 18, sold: 92,
    rating: 4.5, reviews: 54, shade: 'Golden Bronze', color: '#C8A560',
    badge: null, isNew: false, isActive: true,
    description: 'Silky bronzer that mimics a natural sun-kissed glow. Perfect for contouring.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80'
  },

  /* ── SKINCARE ── */
  {
    id: 'p017', name: 'Hydra-Glow Vitamin C Serum', category: 'Skincare',
    price: 2499, originalPrice: 2999, stock: 40, sold: 312,
    rating: 4.9, reviews: 247, shade: null, color: '#FFF3CD',
    badge: 'Bestseller', isNew: false, isActive: true,
    description: '15% Vitamin C brightening serum. Reduces dark spots, boosts radiance in 2 weeks.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'
  },
  {
    id: 'p018', name: 'Velvet Rose Moisturiser', category: 'Skincare',
    price: 1999, originalPrice: null, stock: 52, sold: 198,
    rating: 4.7, reviews: 134, shade: null, color: '#FFE4E1',
    badge: 'New', isNew: true, isActive: true,
    description: 'Lightweight gel-cream moisturiser with rose water and hyaluronic acid. 72-hour hydration.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'
  },
  {
    id: 'p019', name: 'Purifying Clay Mask', category: 'Skincare',
    price: 1299, originalPrice: 1599, stock: 33, sold: 156,
    rating: 4.6, reviews: 88, shade: null, color: '#D4C4A8',
    badge: 'Sale', isNew: false, isActive: true,
    description: 'Deep cleansing kaolin clay mask with tea tree. Minimises pores, controls oil.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'
  },
  {
    id: 'p020', name: 'SPF 50 Sunscreen Gel', category: 'Skincare',
    price: 1799, originalPrice: null, stock: 65, sold: 423,
    rating: 4.8, reviews: 312, shade: null, color: '#F0FFF0',
    badge: 'Hot', isNew: false, isActive: true,
    description: 'Lightweight, non-greasy SPF 50 PA+++ sunscreen. No white cast. Perfect under makeup.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80'
  }
];

/* Dummy orders */
const VB_ORDERS = [
  { id: 'o001', orderNumber: 'VB-100001', customerName: 'Ayesha Khan', customer: 'c001', city: 'Lahore', items: [{productName:'Velvet Red Matte Lipstick',quantity:2,price:1299},{productName:'Rose Nude Velvet Lip',quantity:1,price:1399}], total: 3997, status: 'delivered', createdAt: '2025-03-01' },
  { id: 'o002', orderNumber: 'VB-100002', customerName: 'Sara Malik', customer: 'c002', city: 'Karachi', items: [{productName:'Flawless Satin Foundation',quantity:1,price:2199}], total: 2199, status: 'shipped', createdAt: '2025-03-02' },
  { id: 'o003', orderNumber: 'VB-100003', customerName: 'Maryam Rizvi', customer: 'c003', city: 'Islamabad', items: [{productName:'Smoke & Sultry Eyeshadow Palette',quantity:1,price:2999},{productName:'Precision Liquid Eyeliner',quantity:1,price:899}], total: 3898, status: 'processing', createdAt: '2025-03-03' },
  { id: 'o004', orderNumber: 'VB-100004', customerName: 'Fatima Ahmed', customer: 'c004', city: 'Rawalpindi', items: [{productName:'Hydra-Glow Vitamin C Serum',quantity:1,price:2499}], total: 2499, status: 'processing', createdAt: '2025-03-04' },
  { id: 'o005', orderNumber: 'VB-100005', customerName: 'Zainab Hassan', customer: 'c005', city: 'Faisalabad', items: [{productName:'Waterproof Kohl Kajal',quantity:3,price:699}], total: 2097, status: 'shipped', createdAt: '2025-03-05' },
  { id: 'o006', orderNumber: 'VB-100006', customerName: 'Nadia Iqbal', customer: 'c006', city: 'Lahore', items: [{productName:'Rose Petal Blush',quantity:1,price:1499},{productName:'Champagne Glow Highlighter',quantity:1,price:1799}], total: 3298, status: 'delivered', createdAt: '2025-03-06' },
  { id: 'o007', orderNumber: 'VB-100007', customerName: 'Hina Shah', customer: 'c007', city: 'Karachi', items: [{productName:'HD Concealer Pen',quantity:2,price:1599}], total: 3198, status: 'cancelled', createdAt: '2025-03-07' },
  { id: 'o008', orderNumber: 'VB-100008', customerName: 'Sana Butt', customer: 'c008', city: 'Multan', items: [{productName:'Velvet Rose Moisturiser',quantity:1,price:1999},{productName:'SPF 50 Sunscreen Gel',quantity:1,price:1799}], total: 3798, status: 'processing', createdAt: '2025-03-08' }
];

/* Dummy customers */
const VB_CUSTOMERS = [
  { id: 'c001', name: 'Ayesha Khan', email: 'ayesha@example.com', phone: '0300-1234567', city: 'Lahore', totalOrders: 8, totalSpent: 24500, status: 'VIP', joinDate: '2024-06-15' },
  { id: 'c002', name: 'Sara Malik', email: 'sara@example.com', phone: '0321-9876543', city: 'Karachi', totalOrders: 5, totalSpent: 14200, status: 'Regular', joinDate: '2024-08-22' },
  { id: 'c003', name: 'Maryam Rizvi', email: 'maryam@example.com', phone: '0333-5551234', city: 'Islamabad', totalOrders: 3, totalSpent: 8900, status: 'Regular', joinDate: '2024-09-10' },
  { id: 'c004', name: 'Fatima Ahmed', email: 'fatima@example.com', phone: '0345-7654321', city: 'Rawalpindi', totalOrders: 1, totalSpent: 2499, status: 'New', joinDate: '2025-02-28' },
  { id: 'c005', name: 'Zainab Hassan', email: 'zainab@example.com', phone: '0311-2223333', city: 'Faisalabad', totalOrders: 2, totalSpent: 5100, status: 'New', joinDate: '2025-01-14' },
  { id: 'c006', name: 'Nadia Iqbal', email: 'nadia@example.com', phone: '0300-9998888', city: 'Lahore', totalOrders: 12, totalSpent: 38700, status: 'VIP', joinDate: '2024-03-05' },
  { id: 'c007', name: 'Hina Shah', email: 'hina@example.com', phone: '0322-4445566', city: 'Karachi', totalOrders: 4, totalSpent: 11200, status: 'Regular', joinDate: '2024-07-19' },
  { id: 'c008', name: 'Sana Butt', email: 'sana@example.com', phone: '0344-6667788', city: 'Multan', totalOrders: 2, totalSpent: 6800, status: 'New', joinDate: '2025-02-01' }
];

/* Dummy reviews */
const VB_REVIEWS = [
  { id: 'r001', product: 'p001', productName: 'Velvet Red Matte Lipstick', customerName: 'Ayesha Khan', rating: 5, text: 'Absolutely love this lipstick! Rich pigment, lasts all day.', helpful: 42, createdAt: '2025-03-02' },
  { id: 'r002', product: 'p001', productName: 'Velvet Red Matte Lipstick', customerName: 'Sara Malik', rating: 5, text: 'Best matte formula I\'ve tried. Packaging is so luxurious!', helpful: 28, createdAt: '2025-02-18' },
  { id: 'r003', product: 'p010', productName: 'Smoke & Sultry Eyeshadow Palette', customerName: 'Maryam Rizvi', rating: 5, text: 'Pigments are insane. Blends beautifully. No fallout!', helpful: 35, createdAt: '2025-01-30' },
  { id: 'r004', product: 'p006', productName: 'Flawless Satin Foundation', customerName: 'Nadia Iqbal', rating: 4, text: 'Great coverage and finish. Wish there were more shade options.', helpful: 19, createdAt: '2025-02-10' },
  { id: 'r005', product: 'p017', productName: 'Hydra-Glow Vitamin C Serum', customerName: 'Fatima Ahmed', rating: 5, text: 'Saw results in just 2 weeks! Skin looks so much brighter.', helpful: 51, createdAt: '2025-03-01' }
];

/* Dummy analytics */
const VB_ANALYTICS = [
  { month: 'October',  monthIndex: 9,  year: 2024, revenue: 145000, orders: 58,  newCustomers: 22, avgOrderValue: 2500 },
  { month: 'November', monthIndex: 10, year: 2024, revenue: 189000, orders: 74,  newCustomers: 31, avgOrderValue: 2554 },
  { month: 'December', monthIndex: 11, year: 2024, revenue: 256000, orders: 98,  newCustomers: 45, avgOrderValue: 2612 },
  { month: 'January',  monthIndex: 0,  year: 2025, revenue: 198000, orders: 81,  newCustomers: 28, avgOrderValue: 2444 },
  { month: 'February', monthIndex: 1,  year: 2025, revenue: 221000, orders: 89,  newCustomers: 33, avgOrderValue: 2483 },
  { month: 'March',    monthIndex: 2,  year: 2025, revenue: 87000,  orders: 34,  newCustomers: 12, avgOrderValue: 2559 }
];

/* Access codes (in real app these are in backend .env) */
const VB_ACCESS_CODES = {
  employee: 'EMP2025',
  owner:    'OWNER2025'
};

/* Helper: get product by id */
function getProductById(id) {
  return VB_PRODUCTS.find(p => p.id === id) || null;
}

/* Helper: format price */
function formatPrice(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-PK');
}

/* Helper: render stars */
function renderStars(rating) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

/* Helper: discount percent */
function discountPercent(price, original) {
  if (!original || original <= price) return null;
  return Math.round((1 - price / original) * 100) + '% OFF';
}
