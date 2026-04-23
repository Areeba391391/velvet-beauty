/* ============================================================
   VELVET BEAUTY — dummy-data.js
   ⚠️  TESTING ONLY — Yeh file production mein use mat karna
   
   Agar aap testing ke liye dummy data load karna chahein toh:
   1. dashboard-owner.html mein store.js ke BAAD yeh script add karein:
      <script src="../public/js/dummy-data.js"></script>
   2. Browser console mein likhein: loadDummyData()
   3. Page reload karein
   ============================================================ */

function loadDummyData() {
  // Purana data clear karo
  localStorage.removeItem('vb_products');
  localStorage.removeItem('vb_customers');
  localStorage.removeItem('vb_orders');
  localStorage.removeItem('vb_reviews');
  localStorage.removeItem('vb_analytics');

  // --- PRODUCTS (20 items) ---
  // Image URL: Har product ka image alag Unsplash URL hai
  // Aap dashboard se naya product add karte waqt koi bhi image URL de sakte hain
  localStorage.setItem('vb_products', JSON.stringify([
    { id:'p1',  name:'Velvet Red Matte Lipstick',     category:'Lips',     price:1499, origPrice:1999, image:'https://images.unsplash.com/photo-1586716849912-6a4efc85e3a7?w=600&q=80', rating:4.9, reviews:42, stock:45, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:['#C62828','#B71C1C','#880E4F','#E91E8C'], desc:'Long-lasting, intensely pigmented matte lipstick for a bold look. Our bestselling formula stays put for 12 hours.' },
    { id:'p2',  name:'Rose Nude Lip Gloss',           category:'Lips',     price:899,  origPrice:1199, image:'https://images.unsplash.com/photo-1631730486784-74757ac55b9c?w=600&q=80', rating:4.7, reviews:28, stock:60, badge:'new',        bestseller:false, isNew:true,  active:true, shades:['#FFCDD2','#F48FB1','#F06292','#E91E8C'], desc:'Sheer, hydrating gloss with a gorgeous rose-nude finish. Plumps lips naturally.' },
    { id:'p3',  name:'Berry Stain Liquid Lip',        category:'Lips',     price:1299, origPrice:null, image:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80', rating:4.6, reviews:19, stock:38, badge:'',           bestseller:false, isNew:false, active:true, shades:['#880E4F','#AD1457','#C2185B'], desc:'All-day wear liquid lip stain in rich berry tones. Transfer-proof formula.' },
    { id:'p4',  name:'Classic Red Lip Liner',         category:'Lips',     price:599,  origPrice:799,  image:'https://images.unsplash.com/photo-1583241800698-e8ab01830a66?w=600&q=80', rating:4.5, reviews:15, stock:80, badge:'sale',       bestseller:false, isNew:false, active:true, shades:['#D32F2F','#B71C1C','#C62828'], desc:'Define and shape your lips with our long-wear liner. Creamy texture, precise tip.' },
    { id:'p5',  name:'Plum Satin Lipstick',           category:'Lips',     price:1199, origPrice:1499, image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', rating:4.8, reviews:33, stock:52, badge:'hot',        bestseller:true,  isNew:false, active:true, shades:['#6A1B9A','#7B1FA2','#8E24AA','#AB47BC'], desc:'Silky satin finish lipstick in a stunning plum shade. Moisturises while you wear.' },
    { id:'p6',  name:'Flawless Glow Foundation',      category:'Face',     price:2499, origPrice:2999, image:'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=600&q=80', rating:4.8, reviews:55, stock:30, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:['#FDDCBC','#F5CBA7','#E8B89A','#D4956A','#C0784A'], desc:'Full coverage, skin-loving foundation with SPF 20. Buildable, breathable formula.' },
    { id:'p7',  name:'Velvet Setting Powder',         category:'Face',     price:1799, origPrice:null, image:'https://images.unsplash.com/photo-1574023278078-2a3c6aa2bfcf?w=600&q=80', rating:4.6, reviews:21, stock:42, badge:'new',        bestseller:false, isNew:true,  active:true, shades:[], desc:'Finely milled setting powder for a flawless, matte finish. Blurs pores instantly.' },
    { id:'p8',  name:'Dewy Skin BB Cream',            category:'Face',     price:1599, origPrice:1999, image:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80', rating:4.5, reviews:18, stock:55, badge:'',           bestseller:false, isNew:false, active:true, shades:['#FDDCBC','#F5CBA7','#D4956A'], desc:'Lightweight BB cream that hydrates and evens skin tone. SPF 30 included.' },
    { id:'p9',  name:'Radiance Primer',               category:'Face',     price:1299, origPrice:1699, image:'https://images.unsplash.com/photo-1617333306978-9f5d9b1e0e29?w=600&q=80', rating:4.4, reviews:12, stock:48, badge:'sale',       bestseller:false, isNew:false, active:true, shades:[], desc:'Smoothing primer that blurs pores and preps skin. Creates a luminous base for makeup.' },
    { id:'p10', name:'Smoke & Sultry Eye Palette',    category:'Eyes',     price:2999, origPrice:3999, image:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80', rating:4.9, reviews:67, stock:25, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:[], desc:'12-shade eyeshadow palette with mattes, shimmers & glitters. Pigment-rich formula.' },
    { id:'p11', name:'Volumizing Mascara',            category:'Eyes',     price:1099, origPrice:1399, image:'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=600&q=80', rating:4.7, reviews:44, stock:70, badge:'hot',        bestseller:true,  isNew:false, active:true, shades:[], desc:'Dramatic volume and length with our waterproof formula. 24-hour hold.' },
    { id:'p12', name:'Kohl Kajal Eyeliner',           category:'Eyes',     price:699,  origPrice:899,  image:'https://images.unsplash.com/photo-1583241800698-e8ab01830a66?w=600&q=80', rating:4.6, reviews:38, stock:90, badge:'',           bestseller:false, isNew:false, active:true, shades:[], desc:'Intensely black kohl kajal for bold, smudge-proof definition. Lasts all day.' },
    { id:'p13', name:'Glitter Eye Topper',            category:'Eyes',     price:899,  origPrice:null, image:'https://images.unsplash.com/photo-1557202355-0953a772f494?w=600&q=80', rating:4.3, reviews:9,  stock:35, badge:'new',        bestseller:false, isNew:true,  active:true, shades:['#F5C518','#E91E8C','#C9956C','#6B2D5E'], desc:'Sparkling glitter topper for a show-stopping eye look. Apply over any shadow.' },
    { id:'p14', name:'Peachy Blush',                  category:'Cheeks',   price:1199, origPrice:1499, image:'https://images.unsplash.com/photo-1602036178459-ca9c91a26b3c?w=600&q=80', rating:4.7, reviews:26, stock:44, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:['#FFAB91','#FF8A65','#F4511E'], desc:'Silky smooth blush powder for a natural, sun-kissed glow. Buildable coverage.' },
    { id:'p15', name:'Rose Gold Highlight',           category:'Cheeks',   price:1599, origPrice:1999, image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80', rating:4.8, reviews:31, stock:38, badge:'hot',        bestseller:false, isNew:false, active:true, shades:[], desc:'Luxurious rose gold highlighter for blinding, metallic glow. Finely milled formula.' },
    { id:'p16', name:'Bronzer & Contour Duo',         category:'Cheeks',   price:1899, origPrice:2399, image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', rating:4.5, reviews:17, stock:29, badge:'',           bestseller:false, isNew:false, active:true, shades:[], desc:'Sculpt and bronze with our buildable contour and bronzer duo. Natural finish.' },
    { id:'p17', name:'Vitamin C Brightening Serum',   category:'Skincare', price:2999, origPrice:3999, image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', rating:4.9, reviews:58, stock:22, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:[], desc:'Powerful Vitamin C serum that brightens and evens skin tone. Visible results in 2 weeks.' },
    { id:'p18', name:'Rose Hydrating Face Mist',      category:'Skincare', price:1299, origPrice:1599, image:'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=600&q=80', rating:4.6, reviews:23, stock:60, badge:'new',        bestseller:false, isNew:true,  active:true, shades:[], desc:'Refreshing rose water mist for instant hydration on the go. Soothes and tones.' },
    { id:'p19', name:'Retinol Night Cream',           category:'Skincare', price:3499, origPrice:4499, image:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80', rating:4.8, reviews:35, stock:18, badge:'hot',        bestseller:false, isNew:false, active:true, shades:[], desc:'Anti-aging retinol cream for smoother, firmer skin overnight. Clinically tested.' },
    { id:'p20', name:'Hyaluronic Acid Moisturiser',   category:'Skincare', price:2199, origPrice:2799, image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80', rating:4.7, reviews:41, stock:35, badge:'',           bestseller:true,  isNew:false, active:true, shades:[], desc:'Deep hydration moisturiser with 3-layer hyaluronic acid. Plumps skin for 48 hours.' },
  ]));

  // --- CUSTOMERS (8 dummy) ---
  localStorage.setItem('vb_customers', JSON.stringify([
    { id:'c1', name:'Sara Khan',    email:'sara@example.com',   phone:'0301-1234567', city:'Karachi',    type:'vip',     totalOrders:5, totalSpent:12450, joinDate:'2024-08-15' },
    { id:'c2', name:'Ayesha Malik', email:'ayesha@example.com', phone:'0312-2345678', city:'Lahore',     type:'vip',     totalOrders:4, totalSpent:9800,  joinDate:'2024-09-22' },
    { id:'c3', name:'Nadia Ahmed',  email:'nadia@example.com',  phone:'0323-3456789', city:'Islamabad',  type:'regular', totalOrders:2, totalSpent:4200,  joinDate:'2024-11-05' },
    { id:'c4', name:'Fatima Raza',  email:'fatima@example.com', phone:'0334-4567890', city:'Rawalpindi', type:'regular', totalOrders:3, totalSpent:6750,  joinDate:'2024-10-18' },
    { id:'c5', name:'Zara Butt',    email:'zara@example.com',   phone:'0345-5678901', city:'Faisalabad', type:'new',     totalOrders:1, totalSpent:2499,  joinDate:'2025-01-10' },
    { id:'c6', name:'Hira Shahid',  email:'hira@example.com',   phone:'0346-6789012', city:'Multan',     type:'new',     totalOrders:1, totalSpent:1899,  joinDate:'2025-01-20' },
    { id:'c7', name:'Mariam Baig',  email:'mariam@example.com', phone:'0347-7890123', city:'Karachi',    type:'regular', totalOrders:2, totalSpent:3600,  joinDate:'2024-12-02' },
    { id:'c8', name:'Saba Iqbal',   email:'saba@example.com',   phone:'0348-8901234', city:'Lahore',     type:'vip',     totalOrders:6, totalSpent:15200, joinDate:'2024-07-30' },
  ]));

  // --- ORDERS (8 dummy) ---
  localStorage.setItem('vb_orders', JSON.stringify([
    { id:'VB-10001', customerId:'c1', customerName:'Sara Khan',    items:[{id:'p1',name:'Velvet Red Matte Lipstick',qty:2,price:1499,image:'https://images.unsplash.com/photo-1586716849912-6a4efc85e3a7?w=80'},{id:'p17',name:'Vitamin C Brightening Serum',qty:1,price:2999,image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80'}], subtotal:5997, discount:0, deliveryFee:0, total:5997, status:'delivered',  deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-05', address:'House 12, DHA Phase 5, Karachi' },
    { id:'VB-10002', customerId:'c2', customerName:'Ayesha Malik', items:[{id:'p10',name:'Smoke & Sultry Eye Palette',qty:1,price:2999,image:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=80'},{id:'p6',name:'Flawless Glow Foundation',qty:1,price:2499,image:'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=80'}], subtotal:5498, discount:550, deliveryFee:0, total:4948, status:'delivered',  deliveryType:'express',  paymentMethod:'easypaisa', date:'2025-01-08', address:'24 Gulberg III, Lahore' },
    { id:'VB-10003', customerId:'c3', customerName:'Nadia Ahmed',  items:[{id:'p5',name:'Plum Satin Lipstick',qty:1,price:1199,image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80'},{id:'p14',name:'Peachy Blush',qty:1,price:1199,image:'https://images.unsplash.com/photo-1602036178459-ca9c91a26b3c?w=80'}], subtotal:2398, discount:0, deliveryFee:200, total:2598, status:'shipped',   deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-14', address:'F-7/2, Islamabad' },
    { id:'VB-10004', customerId:'c4', customerName:'Fatima Raza',  items:[{id:'p19',name:'Retinol Night Cream',qty:1,price:3499,image:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=80'}], subtotal:3499, discount:525, deliveryFee:0, total:2974, status:'processing', deliveryType:'standard', paymentMethod:'jazzcash',  date:'2025-01-18', address:'Raja Market, Rawalpindi' },
    { id:'VB-10005', customerId:'c5', customerName:'Zara Butt',    items:[{id:'p6',name:'Flawless Glow Foundation',qty:1,price:2499,image:'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=80'}], subtotal:2499, discount:0, deliveryFee:0, total:2499, status:'processing', deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-19', address:'Peoples Colony, Faisalabad' },
    { id:'VB-10006', customerId:'c8', customerName:'Saba Iqbal',   items:[{id:'p1',name:'Velvet Red Matte Lipstick',qty:1,price:1499,image:'https://images.unsplash.com/photo-1586716849912-6a4efc85e3a7?w=80'},{id:'p11',name:'Volumizing Mascara',qty:2,price:1099,image:'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=80'},{id:'p15',name:'Rose Gold Highlight',qty:1,price:1599,image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=80'}], subtotal:5296, discount:1059, deliveryFee:0, total:4237, status:'shipped',   deliveryType:'express',  paymentMethod:'bank',      date:'2025-01-20', address:'Model Town, Lahore' },
    { id:'VB-10007', customerId:'c6', customerName:'Hira Shahid',  items:[{id:'p16',name:'Bronzer & Contour Duo',qty:1,price:1899,image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80'}], subtotal:1899, discount:0, deliveryFee:200, total:2099, status:'processing', deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-21', address:'Bosan Road, Multan' },
    { id:'VB-10008', customerId:'c7', customerName:'Mariam Baig',  items:[{id:'p18',name:'Rose Hydrating Face Mist',qty:2,price:1299,image:'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=80'},{id:'p20',name:'Hyaluronic Acid Moisturiser',qty:1,price:2199,image:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=80'}], subtotal:4797, discount:0, deliveryFee:0, total:4797, status:'delivered',  deliveryType:'standard', paymentMethod:'easypaisa', date:'2025-01-22', address:'PECHS, Karachi' },
  ]));

  // --- REVIEWS (7 dummy) ---
  localStorage.setItem('vb_reviews', JSON.stringify([
    { id:'r1', productId:'p1',  customerId:'c1', customerName:'Sara K.',   rating:5, title:'Absolutely love this!',   text:'Best lipstick I have ever bought. The color is exactly as shown and it lasts all day!', date:'2025-01-06', helpful:12 },
    { id:'r2', productId:'p1',  customerId:'c8', customerName:'Saba I.',   rating:5, title:'Perfect red!',             text:'This is my HG red lipstick. Creamy, pigmented and long-lasting. Highly recommend!', date:'2025-01-21', helpful:8 },
    { id:'r3', productId:'p6',  customerId:'c2', customerName:'Ayesha M.', rating:5, title:'Flawless coverage',        text:'This foundation is incredible. Medium to full coverage, blends beautifully. I am obsessed!', date:'2025-01-09', helpful:15 },
    { id:'r4', productId:'p10', customerId:'c2', customerName:'Ayesha M.', rating:5, title:'Stunning palette!',        text:'The pigmentation is insane! Every shade is buttery smooth. This palette has everything for a smoky eye.', date:'2025-01-09', helpful:20 },
    { id:'r5', productId:'p17', customerId:'c1', customerName:'Sara K.',   rating:5, title:'Glowing skin in 2 weeks',  text:'I have been using this serum for 2 weeks and my skin is noticeably brighter. Absorbs quickly too.', date:'2025-01-06', helpful:18 },
    { id:'r6', productId:'p5',  customerId:'c4', customerName:'Fatima R.', rating:4, title:'Beautiful colour',         text:'Love the plum shade! Slightly drying after 6 hours but colour payoff is amazing. Would buy again.', date:'2025-01-19', helpful:5 },
    { id:'r7', productId:'p19', customerId:'c4', customerName:'Fatima R.', rating:5, title:'Night-time miracle cream', text:'Woke up with softer skin after the first use. This retinol cream is gentle yet effective. Love it!', date:'2025-01-19', helpful:9 },
  ]));

  // --- ANALYTICS (6 months) ---
  localStorage.setItem('vb_analytics', JSON.stringify([
    { month:'Aug 2024', revenue:42500,  orders:18, newCustomers:5,  avgOrder:2361 },
    { month:'Sep 2024', revenue:58200,  orders:24, newCustomers:7,  avgOrder:2425 },
    { month:'Oct 2024', revenue:71400,  orders:30, newCustomers:8,  avgOrder:2380 },
    { month:'Nov 2024', revenue:89600,  orders:38, newCustomers:12, avgOrder:2358 },
    { month:'Dec 2024', revenue:124500, orders:52, newCustomers:18, avgOrder:2394 },
    { month:'Jan 2025', revenue:98400,  orders:41, newCustomers:10, avgOrder:2400 },
  ]));

  console.log('✅ Dummy data loaded! Refresh the page.');
  alert('✅ Dummy data load ho gaya! Ab page refresh karein.');
}
