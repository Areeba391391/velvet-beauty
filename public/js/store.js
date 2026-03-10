/* ============================================================
   VELVET BEAUTY — store.js  (Central Brain)
   All localStorage operations, seed data, auth, cart,
   wishlist, orders, reviews, customers, analytics, helpers
   ============================================================ */

// ── Keys ─────────────────────────────────────────────────────
const KEYS = {
  session:   'vb_session',
  products:  'vb_products',
  orders:    'vb_orders',
  customers: 'vb_customers',
  reviews:   'vb_reviews',
  cart:      'vb_cart',
  wishlist:  'vb_wishlist',
  users:     'vb_users',
  analytics: 'vb_analytics',
  settings:  'vb_settings',
  promo:     'vb_promo',
};

// ── DB helpers ───────────────────────────────────────────────
const DB = {
  get:    k       => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k,v)   => localStorage.setItem(k, JSON.stringify(v)),
  remove: k       => localStorage.removeItem(k),
};

// ── Seed data (called once on first load) ────────────────────
function seedIfNeeded() {
  if (DB.get(KEYS.products)) return; // already seeded

  // Products (20 items)
  DB.set(KEYS.products, [
    { id:'p1',  name:'Velvet Red Matte Lipstick',       category:'Lips',     price:1499, origPrice:1999, image:'https://placehold.co/400x300/E91E8C/ffffff?text=Velvet+Red', rating:4.9, reviews:42, stock:45, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:['#C62828','#B71C1C','#880E4F','#E91E8C'], desc:'Long-lasting, intensely pigmented matte lipstick for a bold look.' },
    { id:'p2',  name:'Rose Nude Lip Gloss',             category:'Lips',     price:899,  origPrice:1199, image:'https://placehold.co/400x300/F8BBD0/C2185B?text=Rose+Nude', rating:4.7, reviews:28, stock:60, badge:'new',        bestseller:false, isNew:true,  active:true, shades:['#FFCDD2','#F48FB1','#F06292','#E91E8C'], desc:'Sheer, hydrating gloss with a gorgeous rose-nude finish.' },
    { id:'p3',  name:'Berry Stain Liquid Lip',          category:'Lips',     price:1299, origPrice:null, image:'https://placehold.co/400x300/880E4F/ffffff?text=Berry+Stain', rating:4.6, reviews:19, stock:38, badge:'',           bestseller:false, isNew:false, active:true, shades:['#880E4F','#AD1457','#C2185B'], desc:'All-day wear liquid lip stain in rich berry tones.' },
    { id:'p4',  name:'Classic Red Lip Liner',           category:'Lips',     price:599,  origPrice:799,  image:'https://placehold.co/400x300/D32F2F/ffffff?text=Lip+Liner', rating:4.5, reviews:15, stock:80, badge:'sale',       bestseller:false, isNew:false, active:true, shades:['#D32F2F','#B71C1C','#C62828'], desc:'Define and shape your lips with our long-wear liner.' },
    { id:'p5',  name:'Plum Satin Lipstick',             category:'Lips',     price:1199, origPrice:1499, image:'https://placehold.co/400x300/6A1B9A/ffffff?text=Plum+Satin', rating:4.8, reviews:33, stock:52, badge:'hot',        bestseller:true,  isNew:false, active:true, shades:['#6A1B9A','#7B1FA2','#8E24AA','#AB47BC'], desc:'Silky satin finish lipstick in a stunning plum shade.' },
    { id:'p6',  name:'Flawless Glow Foundation',        category:'Face',     price:2499, origPrice:2999, image:'https://placehold.co/400x300/FDDCBC/C9956C?text=Foundation', rating:4.8, reviews:55, stock:30, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:['#FDDCBC','#F5CBA7','#E8B89A','#D4956A','#C0784A'], desc:'Full coverage, skin-loving foundation with SPF 20.' },
    { id:'p7',  name:'Velvet Setting Powder',           category:'Face',     price:1799, origPrice:null, image:'https://placehold.co/400x300/FDE8F3/E91E8C?text=Powder', rating:4.6, reviews:21, stock:42, badge:'new',        bestseller:false, isNew:true,  active:true, shades:[], desc:'Finely milled setting powder for a flawless, matte finish.' },
    { id:'p8',  name:'Dewy Skin BB Cream',              category:'Face',     price:1599, origPrice:1999, image:'https://placehold.co/400x300/F5CBA7/C9956C?text=BB+Cream', rating:4.5, reviews:18, stock:55, badge:'',           bestseller:false, isNew:false, active:true, shades:['#FDDCBC','#F5CBA7','#D4956A'], desc:'Lightweight BB cream that hydrates and evens skin tone.' },
    { id:'p9',  name:'Radiance Primer',                 category:'Face',     price:1299, origPrice:1699, image:'https://placehold.co/400x300/FFF0F8/E91E8C?text=Primer', rating:4.4, reviews:12, stock:48, badge:'sale',       bestseller:false, isNew:false, active:true, shades:[], desc:'Smoothing primer that blurs pores and preps skin for makeup.' },
    { id:'p10', name:'Smoke & Sultry Eye Palette',      category:'Eyes',     price:2999, origPrice:3999, image:'https://placehold.co/400x300/4A1A40/F472B6?text=Eye+Palette', rating:4.9, reviews:67, stock:25, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:[], desc:'12-shade eyeshadow palette with mattes, shimmers & glitters.' },
    { id:'p11', name:'Volumizing Mascara',              category:'Eyes',     price:1099, origPrice:1399, image:'https://placehold.co/400x300/1A0A12/E91E8C?text=Mascara', rating:4.7, reviews:44, stock:70, badge:'hot',        bestseller:true,  isNew:false, active:true, shades:[], desc:'Dramatic volume and length with our waterproof formula.' },
    { id:'p12', name:'Kohl Kajal Eyeliner',             category:'Eyes',     price:699,  origPrice:899,  image:'https://placehold.co/400x300/1A0A12/ffffff?text=Kajal', rating:4.6, reviews:38, stock:90, badge:'',           bestseller:false, isNew:false, active:true, shades:[], desc:'Intensely black kohl kajal for bold, smudge-proof definition.' },
    { id:'p13', name:'Glitter Eye Topper',              category:'Eyes',     price:899,  origPrice:null, image:'https://placehold.co/400x300/E8C5A8/C9956C?text=Glitter', rating:4.3, reviews:9,  stock:35, badge:'new',        bestseller:false, isNew:true,  active:true, shades:['#F5C518','#E91E8C','#C9956C','#6B2D5E'], desc:'Sparkling glitter topper for a show-stopping eye look.' },
    { id:'p14', name:'Peachy Blush',                    category:'Cheeks',   price:1199, origPrice:1499, image:'https://placehold.co/400x300/FFCCBC/E91E8C?text=Blush', rating:4.7, reviews:26, stock:44, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:['#FFAB91','#FF8A65','#F4511E'], desc:'Silky smooth blush powder for a natural, sun-kissed glow.' },
    { id:'p15', name:'Rose Gold Highlight',             category:'Cheeks',   price:1599, origPrice:1999, image:'https://placehold.co/400x300/C9956C/ffffff?text=Highlight', rating:4.8, reviews:31, stock:38, badge:'hot',        bestseller:false, isNew:false, active:true, shades:[], desc:'Luxurious rose gold highlighter for blinding, metallic glow.' },
    { id:'p16', name:'Bronzer & Contour Duo',           category:'Cheeks',   price:1899, origPrice:2399, image:'https://placehold.co/400x300/A0522D/ffffff?text=Bronzer', rating:4.5, reviews:17, stock:29, badge:'',           bestseller:false, isNew:false, active:true, shades:[], desc:'Sculpt and bronze with our buildable contour and bronzer duo.' },
    { id:'p17', name:'Vitamin C Brightening Serum',     category:'Skincare', price:2999, origPrice:3999, image:'https://placehold.co/400x300/FFF9C4/F5C518?text=Vit+C+Serum', rating:4.9, reviews:58, stock:22, badge:'bestseller', bestseller:true,  isNew:false, active:true, shades:[], desc:'Powerful Vitamin C serum that brightens and evens skin tone.' },
    { id:'p18', name:'Rose Hydrating Face Mist',        category:'Skincare', price:1299, origPrice:1599, image:'https://placehold.co/400x300/FCE4EC/E91E8C?text=Face+Mist', rating:4.6, reviews:23, stock:60, badge:'new',        bestseller:false, isNew:true,  active:true, shades:[], desc:'Refreshing rose water mist for instant hydration on the go.' },
    { id:'p19', name:'Retinol Night Cream',             category:'Skincare', price:3499, origPrice:4499, image:'https://placehold.co/400x300/E8EAF6/3F51B5?text=Night+Cream', rating:4.8, reviews:35, stock:18, badge:'hot',        bestseller:false, isNew:false, active:true, shades:[], desc:'Anti-aging retinol cream for smoother, firmer skin overnight.' },
    { id:'p20', name:'Hyaluronic Acid Moisturiser',     category:'Skincare', price:2199, origPrice:2799, image:'https://placehold.co/400x300/E3F2FD/1565C0?text=Moisturiser', rating:4.7, reviews:41, stock:35, badge:'',          bestseller:true,  isNew:false, active:true, shades:[], desc:'Deep hydration moisturiser with 3-layer hyaluronic acid.' },
  ]);

  // Customers (8)
  DB.set(KEYS.customers, [
    { id:'c1', name:'Sara Khan',     email:'sara@example.com',    phone:'0301-1234567', city:'Karachi',    type:'vip',     totalOrders:5, totalSpent:12450, joinDate:'2024-08-15' },
    { id:'c2', name:'Ayesha Malik',  email:'ayesha@example.com',  phone:'0312-2345678', city:'Lahore',     type:'vip',     totalOrders:4, totalSpent:9800,  joinDate:'2024-09-22' },
    { id:'c3', name:'Nadia Ahmed',   email:'nadia@example.com',   phone:'0323-3456789', city:'Islamabad',  type:'regular', totalOrders:2, totalSpent:4200,  joinDate:'2024-11-05' },
    { id:'c4', name:'Fatima Raza',   email:'fatima@example.com',  phone:'0334-4567890', city:'Rawalpindi', type:'regular', totalOrders:3, totalSpent:6750,  joinDate:'2024-10-18' },
    { id:'c5', name:'Zara Butt',     email:'zara@example.com',    phone:'0345-5678901', city:'Faisalabad', type:'new',     totalOrders:1, totalSpent:2499,  joinDate:'2025-01-10' },
    { id:'c6', name:'Hira Shahid',   email:'hira@example.com',    phone:'0346-6789012', city:'Multan',     type:'new',     totalOrders:1, totalSpent:1899,  joinDate:'2025-01-20' },
    { id:'c7', name:'Mariam Baig',   email:'mariam@example.com',  phone:'0347-7890123', city:'Karachi',    type:'regular', totalOrders:2, totalSpent:3600,  joinDate:'2024-12-02' },
    { id:'c8', name:'Saba Iqbal',    email:'saba@example.com',    phone:'0348-8901234', city:'Lahore',     type:'vip',     totalOrders:6, totalSpent:15200, joinDate:'2024-07-30' },
  ]);

  // Orders (8)
  DB.set(KEYS.orders, [
    { id:'VB-10001', customerId:'c1', customerName:'Sara Khan',    items:[{id:'p1',name:'Velvet Red Matte Lipstick',qty:2,price:1499,image:'https://placehold.co/48x48/E91E8C/ffffff?text=VB'},{id:'p17',name:'Vitamin C Brightening Serum',qty:1,price:2999,image:'https://placehold.co/48x48/F5C518/ffffff?text=VB'}], subtotal:5997, discount:0, deliveryFee:0, total:5997, status:'delivered',  deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-05', address:'House 12, DHA Phase 5, Karachi' },
    { id:'VB-10002', customerId:'c2', customerName:'Ayesha Malik', items:[{id:'p10',name:'Smoke & Sultry Eye Palette',qty:1,price:2999,image:'https://placehold.co/48x48/4A1A40/ffffff?text=VB'},{id:'p6',name:'Flawless Glow Foundation',qty:1,price:2499,image:'https://placehold.co/48x48/FDDCBC/C9956C?text=VB'}], subtotal:5498, discount:550, deliveryFee:0, total:4948, status:'delivered',  deliveryType:'express',  paymentMethod:'easypaisa', date:'2025-01-08', address:'24 Gulberg III, Lahore' },
    { id:'VB-10003', customerId:'c3', customerName:'Nadia Ahmed',  items:[{id:'p5',name:'Plum Satin Lipstick',qty:1,price:1199,image:'https://placehold.co/48x48/6A1B9A/ffffff?text=VB'},{id:'p14',name:'Peachy Blush',qty:1,price:1199,image:'https://placehold.co/48x48/FFCCBC/E91E8C?text=VB'}], subtotal:2398, discount:0, deliveryFee:200, total:2598, status:'shipped',   deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-14', address:'F-7/2, Islamabad' },
    { id:'VB-10004', customerId:'c4', customerName:'Fatima Raza',  items:[{id:'p19',name:'Retinol Night Cream',qty:1,price:3499,image:'https://placehold.co/48x48/E8EAF6/3F51B5?text=VB'}], subtotal:3499, discount:525, deliveryFee:0, total:2974, status:'processing', deliveryType:'standard', paymentMethod:'jazzcash',  date:'2025-01-18', address:'Raja Market, Rawalpindi' },
    { id:'VB-10005', customerId:'c5', customerName:'Zara Butt',    items:[{id:'p6',name:'Flawless Glow Foundation',qty:1,price:2499,image:'https://placehold.co/48x48/FDDCBC/C9956C?text=VB'}], subtotal:2499, discount:0, deliveryFee:0, total:2499, status:'processing', deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-19', address:'Peoples Colony, Faisalabad' },
    { id:'VB-10006', customerId:'c8', customerName:'Saba Iqbal',   items:[{id:'p1',name:'Velvet Red Matte Lipstick',qty:1,price:1499,image:'https://placehold.co/48x48/E91E8C/ffffff?text=VB'},{id:'p11',name:'Volumizing Mascara',qty:2,price:1099,image:'https://placehold.co/48x48/1A0A12/E91E8C?text=VB'},{id:'p15',name:'Rose Gold Highlight',qty:1,price:1599,image:'https://placehold.co/48x48/C9956C/ffffff?text=VB'}], subtotal:5296, discount:1059, deliveryFee:0, total:4237, status:'shipped',   deliveryType:'express',  paymentMethod:'bank',      date:'2025-01-20', address:'Model Town, Lahore' },
    { id:'VB-10007', customerId:'c6', customerName:'Hira Shahid',  items:[{id:'p16',name:'Bronzer & Contour Duo',qty:1,price:1899,image:'https://placehold.co/48x48/A0522D/ffffff?text=VB'}], subtotal:1899, discount:0, deliveryFee:200, total:2099, status:'processing', deliveryType:'standard', paymentMethod:'cod',       date:'2025-01-21', address:'Bosan Road, Multan' },
    { id:'VB-10008', customerId:'c7', customerName:'Mariam Baig',  items:[{id:'p18',name:'Rose Hydrating Face Mist',qty:2,price:1299,image:'https://placehold.co/48x48/FCE4EC/E91E8C?text=VB'},{id:'p20',name:'Hyaluronic Acid Moisturiser',qty:1,price:2199,image:'https://placehold.co/48x48/E3F2FD/1565C0?text=VB'}], subtotal:4797, discount:0, deliveryFee:0, total:4797, status:'delivered',  deliveryType:'standard', paymentMethod:'easypaisa', date:'2025-01-22', address:'PECHS, Karachi' },
  ]);

  // Reviews (7)
  DB.set(KEYS.reviews, [
    { id:'r1', productId:'p1',  customerId:'c1', customerName:'Sara K.',    rating:5, title:'Absolutely love this!',    text:'Best lipstick I have ever bought. The color is exactly as shown and it lasts all day!', date:'2025-01-06', helpful:12 },
    { id:'r2', productId:'p1',  customerId:'c8', customerName:'Saba I.',    rating:5, title:'Perfect red!',              text:'This is my HG red lipstick. Creamy, pigmented and long-lasting. Highly recommend!', date:'2025-01-21', helpful:8 },
    { id:'r3', productId:'p6',  customerId:'c2', customerName:'Ayesha M.',  rating:5, title:'Flawless coverage',         text:'This foundation is incredible. Medium to full coverage, blends beautifully and does not oxidize. I am obsessed!', date:'2025-01-09', helpful:15 },
    { id:'r4', productId:'p10', customerId:'c2', customerName:'Ayesha M.',  rating:5, title:'Stunning palette!',         text:'The pigmentation is insane! Every shade is buttery smooth. This palette has everything you need for a smoky eye.', date:'2025-01-09', helpful:20 },
    { id:'r5', productId:'p17', customerId:'c1', customerName:'Sara K.',    rating:5, title:'Glowing skin in 2 weeks',   text:'I have been using this serum for 2 weeks and my skin is noticeably brighter. The formula absorbs quickly too.', date:'2025-01-06', helpful:18 },
    { id:'r6', productId:'p5',  customerId:'c4', customerName:'Fatima R.',  rating:4, title:'Beautiful colour',          text:'Love the plum shade! Slightly drying after 6 hours but the colour payoff is amazing. Would buy again.', date:'2025-01-19', helpful:5 },
    { id:'r7', productId:'p19', customerId:'c4', customerName:'Fatima R.',  rating:5, title:'Night-time miracle cream',  text:'Woke up with softer skin after the first use. This retinol cream is gentle yet effective. Love it!', date:'2025-01-19', helpful:9 },
  ]);

  // Analytics (6 months)
  DB.set(KEYS.analytics, [
    { month:'Aug 2024', revenue:42500,  orders:18, newCustomers:5, avgOrder:2361 },
    { month:'Sep 2024', revenue:58200,  orders:24, newCustomers:7, avgOrder:2425 },
    { month:'Oct 2024', revenue:71400,  orders:30, newCustomers:8, avgOrder:2380 },
    { month:'Nov 2024', revenue:89600,  orders:38, newCustomers:12, avgOrder:2358 },
    { month:'Dec 2024', revenue:124500, orders:52, newCustomers:18, avgOrder:2394 },
    { month:'Jan 2025', revenue:98400,  orders:41, newCustomers:10, avgOrder:2400 },
  ]);

  // Users (seed owner + employee)
  DB.set(KEYS.users, [
    { id:'u0', email:'owner@velvetbeauty.pk',    password:'owner123',    role:'owner',    name:'Velvet Owner',   phone:'' },
    { id:'u1', email:'employee@velvetbeauty.pk', password:'emp123',      role:'employee', name:'Staff Member',   phone:'' },
  ]);

  // Settings
  DB.set(KEYS.settings, { empCode:'EMP2025', ownerCode:'OWNER2025', freeDeliveryMin:2000, deliveryFee:200 });

  // Promo Banner
  DB.set(KEYS.promo, {
    active:      true,
    eyebrow:     '⚡ Limited Time Offer',
    title:       'Up to 40% Off Bestsellers',
    desc:        "Don't miss our biggest beauty sale. Shop your favourites at incredible prices before they're gone!",
    code:        'BEAUTY20',
    codePct:     '20',
    ctaText:     'Shop Sale Now',
    ctaLink:     'shop.html?sale=true',
    countdownHours: 8,
  });
}

// ── Auth ─────────────────────────────────────────────────────
const VBAuth = {
  login(email, password, role, accessCode) {
    const settings = DB.get(KEYS.settings) || { empCode:'EMP2025', ownerCode:'OWNER2025' };
    const users    = DB.get(KEYS.users) || [];
    const customers = DB.get(KEYS.customers) || [];

    // Validate access code for staff
    if (role === 'employee' && accessCode !== settings.empCode)   return { ok:false, error:'Invalid employee access code.' };
    if (role === 'owner'    && accessCode !== settings.ownerCode) return { ok:false, error:'Invalid owner access code.' };

    // Staff login (from users table)
    if (role === 'employee' || role === 'owner') {
      const user = users.find(u => u.email === email && u.password === password && u.role === role);
      if (!user) return { ok:false, error:'Invalid email or password.' };
      const session = { id:user.id, email:user.email, name:user.name, role:user.role };
      DB.set(KEYS.session, session);
      return { ok:true, session };
    }

    // Customer login
    const user = users.find(u => u.email === email && u.password === password && u.role === 'customer');
    if (!user) return { ok:false, error:'Invalid email or password.' };
    const session = { id:user.id, email:user.email, name:user.name, role:'customer' };
    DB.set(KEYS.session, session);
    return { ok:true, session };
  },

  register(data) {
    const { firstName, lastName, email, phone, password, role, accessCode } = data;
    const settings = DB.get(KEYS.settings) || { empCode:'EMP2025', ownerCode:'OWNER2025' };
    const users    = DB.get(KEYS.users) || [];

    // Validate access code
    if (role === 'employee' && accessCode !== settings.empCode)   return { ok:false, error:'Invalid employee access code.' };
    if (role === 'owner'    && accessCode !== settings.ownerCode) return { ok:false, error:'Invalid owner access code.' };

    // Check duplicate
    if (users.find(u => u.email === email)) return { ok:false, error:'An account with this email already exists.' };

    const fullName = `${firstName} ${lastName}`.trim();
    const id = 'u' + Date.now();
    const newUser = { id, email, password, role, name:fullName, phone:phone||'' };
    users.push(newUser);
    DB.set(KEYS.users, users);

    // If customer, also add to customers table
    if (role === 'customer') {
      const customers = DB.get(KEYS.customers) || [];
      customers.push({ id:'c'+Date.now(), name:fullName, email, phone:phone||'', city:'', type:'new', totalOrders:0, totalSpent:0, joinDate:new Date().toISOString().slice(0,10) });
      DB.set(KEYS.customers, customers);
    }

    const session = { id, email, name:fullName, role };
    DB.set(KEYS.session, session);
    return { ok:true, session };
  },

  logout() { DB.remove(KEYS.session); },

  session() { return DB.get(KEYS.session); },

  guard(allowedRoles) {
    const session = DB.get(KEYS.session);
    if (!session) {
      // If guarding staff roles, go to dashboard login
      const isStaffOnly = allowedRoles && allowedRoles.every(r => r === 'owner' || r === 'employee');
      window.location.href = isStaffOnly ? 'dashboard-login.html' : 'login.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      const isStaffOnly = allowedRoles.every(r => r === 'owner' || r === 'employee');
      window.location.href = isStaffOnly ? 'dashboard-login.html' : 'login.html';
      return null;
    }
    return session;
  },
};

// ── Products ─────────────────────────────────────────────────
const VBProducts = {
  getAll()        { return DB.get(KEYS.products) || []; },
  getActive()     { return this.getAll().filter(p => p.active); },
  getById(id)     { return this.getAll().find(p => p.id === id); },
  getByCat(cat)   { return this.getActive().filter(p => p.category.toLowerCase() === cat.toLowerCase()); },
  getBest()       { return this.getActive().filter(p => p.bestseller); },
  getNew()        { return this.getActive().filter(p => p.isNew); },
  search(q)       { const s = q.toLowerCase(); return this.getActive().filter(p => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)); },
  save(products)  { DB.set(KEYS.products, products); },
  add(data) {
    const products = this.getAll();
    const newP = { id:'p'+Date.now(), ...data, reviews:0, active:true };
    products.push(newP);
    this.save(products);
    return newP;
  },
  update(id, data) {
    const products = this.getAll();
    const i = products.findIndex(p => p.id === id);
    if (i < 0) return null;
    products[i] = { ...products[i], ...data };
    this.save(products);
    return products[i];
  },
  delete(id) {
    const products = this.getAll().filter(p => p.id !== id);
    this.save(products);
  },
  toggleActive(id) {
    const p = this.getById(id);
    if (!p) return;
    this.update(id, { active: !p.active });
  },
};

// ── Cart ──────────────────────────────────────────────────────
const VBCart = {
  get()          { return DB.get(KEYS.cart) || []; },
  save(cart)     { DB.set(KEYS.cart, cart); this.updateBadge(); },
  count()        { return this.get().reduce((s,i) => s + i.qty, 0); },
  total()        { return this.get().reduce((s,i) => s + i.price * i.qty, 0); },

  add(product, qty=1) {
    const cart = this.get();
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty += qty;
    else cart.push({ id:product.id, name:product.name, price:product.price, image:product.image, category:product.category, qty });
    this.save(cart);
  },

  remove(id)     { this.save(this.get().filter(i => i.id !== id)); },

  updateQty(id, qty) {
    if (qty < 1) { this.remove(id); return; }
    const cart = this.get();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = qty; this.save(cart); }
  },

  clear() { this.save([]); },

  totals(couponCode) {
    const subtotal = this.total();
    const settings = DB.get(KEYS.settings) || { freeDeliveryMin:2000, deliveryFee:200 };
    const coupons  = { VELVET10:0.10, BEAUTY20:0.20, VIP30:0.30, FIRST15:0.15 };
    const discRate = couponCode ? (coupons[couponCode.toUpperCase()] || 0) : 0;
    const discount = Math.round(subtotal * discRate);
    const afterDisc = subtotal - discount;
    const deliveryFee = afterDisc >= settings.freeDeliveryMin ? 0 : settings.deliveryFee;
    return { subtotal, discount, deliveryFee, total: afterDisc + deliveryFee, discRate };
  },

  updateBadge() {
    const count = this.count();
    document.querySelectorAll('#cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
};

// ── Wishlist ──────────────────────────────────────────────────
const VBWish = {
  get()        { return DB.get(KEYS.wishlist) || []; },
  save(list)   { DB.set(KEYS.wishlist, list); this.updateBadge(); },
  has(id)      { return this.get().includes(id); },
  count()      { return this.get().length; },

  toggle(id) {
    const list = this.get();
    const i    = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else        list.push(id);
    this.save(list);
    return i < 0; // true = added
  },

  remove(id)  { this.save(this.get().filter(i => i !== id)); },

  moveAll() {
    const ids = this.get();
    ids.forEach(id => {
      const p = VBProducts.getById(id);
      if (p) VBCart.add(p, 1);
    });
    this.save([]);
  },

  updateBadge() {
    const count = this.count();
    document.querySelectorAll('#wishlist-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
};

// ── Orders ────────────────────────────────────────────────────
const VBOrders = {
  getAll()     { return DB.get(KEYS.orders) || []; },
  getById(id)  { return this.getAll().find(o => o.id === id); },
  save(orders) { DB.set(KEYS.orders, orders); },

  place(orderData) {
    const orders = this.getAll();
    const id = 'VB-' + (10000 + orders.length + 1);
    const order = { id, date: new Date().toISOString().slice(0,10), status:'processing', ...orderData };
    orders.unshift(order);
    this.save(orders);

    // Update customer stats
    const session = VBAuth.session();
    if (session && session.role === 'customer') {
      const customers = DB.get(KEYS.customers) || [];
      const c = customers.find(c => c.email === session.email);
      if (c) {
        c.totalOrders = (c.totalOrders || 0) + 1;
        c.totalSpent  = (c.totalSpent  || 0) + order.total;
        if (c.totalSpent > 8000) c.type = 'vip';
        else if (c.totalOrders > 1) c.type = 'regular';
        DB.set(KEYS.customers, customers);
      }
    }
    return order;
  },

  updateStatus(id, status) {
    const orders = this.getAll();
    const o = orders.find(o => o.id === id);
    if (o) { o.status = status; this.save(orders); }
  },

  delete(id) { this.save(this.getAll().filter(o => o.id !== id)); },
};

// ── Reviews ───────────────────────────────────────────────────
const VBReviews = {
  getAll()          { return DB.get(KEYS.reviews) || []; },
  getByProduct(pid) { return this.getAll().filter(r => r.productId === pid); },
  save(reviews)     { DB.set(KEYS.reviews, reviews); },

  add(data) {
    const reviews = this.getAll();
    const review  = { id:'r'+Date.now(), date:new Date().toISOString().slice(0,10), helpful:0, ...data };
    reviews.unshift(review);
    this.save(reviews);
    // Update product rating
    const prodReviews = this.getByProduct(data.productId);
    if (prodReviews.length) {
      const avg = prodReviews.reduce((s,r) => s + r.rating, 0) / prodReviews.length;
      VBProducts.update(data.productId, { rating: Math.round(avg*10)/10, reviews: prodReviews.length });
    }
    return review;
  },

  delete(id) { this.save(this.getAll().filter(r => r.id !== id)); },

  helpful(id) {
    const reviews = this.getAll();
    const r = reviews.find(r => r.id === id);
    if (r) { r.helpful = (r.helpful||0) + 1; this.save(reviews); }
  },
};

// ── Customers ─────────────────────────────────────────────────
const VBCustomers = {
  getAll()        { return DB.get(KEYS.customers) || []; },
  getById(id)     { return this.getAll().find(c => c.id === id); },
  save(customers) { DB.set(KEYS.customers, customers); },
  add(data)       { const list = this.getAll(); list.push({ id:'c'+Date.now(), ...data }); this.save(list); },
  update(id, data) {
    const list = this.getAll();
    const i = list.findIndex(c => c.id === id);
    if (i >= 0) { list[i] = { ...list[i], ...data }; this.save(list); }
  },
  delete(id)      { this.save(this.getAll().filter(c => c.id !== id)); },
};

// ── Staff Users (Owner / Employee accounts) ───────────────────
const VBUsers = {
  getAll()        { return (DB.get(KEYS.users) || []).filter(u => u.role !== 'customer'); },
  getAllWithCustomers() { return DB.get(KEYS.users) || []; },
  getById(id)     { return (DB.get(KEYS.users) || []).find(u => u.id === id); },
  save(users)     { DB.set(KEYS.users, users); },

  add(data) {
    const all = DB.get(KEYS.users) || [];
    if (all.find(u => u.email === data.email)) return { ok:false, error:'Email already exists.' };
    const user = { id:'u'+Date.now(), createdAt: new Date().toISOString().slice(0,10), ...data };
    all.push(user);
    this.save(all);
    return { ok:true, user };
  },

  update(id, data) {
    const all = DB.get(KEYS.users) || [];
    const i = all.findIndex(u => u.id === id);
    if (i < 0) return;
    // Don't allow email duplication
    if (data.email && all.find(u => u.email === data.email && u.id !== id)) return;
    all[i] = { ...all[i], ...data };
    this.save(all);
    // Also update session if editing self
    const session = DB.get(KEYS.session);
    if (session && session.id === id) {
      DB.set(KEYS.session, { ...session, name:all[i].name, email:all[i].email });
    }
  },

  delete(id) {
    const all = DB.get(KEYS.users) || [];
    // Protect the owner account from deleting itself if only one owner
    const owners = all.filter(u => u.role === 'owner');
    const target = all.find(u => u.id === id);
    if (target?.role === 'owner' && owners.length <= 1) return { ok:false, error:'Cannot delete the only owner account.' };
    this.save(all.filter(u => u.id !== id));
    return { ok:true };
  },
};

// ── Promo Banner ──────────────────────────────────────────────
const VBPromo = {
  defaults: {
    active:true, eyebrow:'⚡ Limited Time Offer', title:'Up to 40% Off Bestsellers',
    desc:"Don't miss our biggest beauty sale. Shop your favourites at incredible prices before they're gone!",
    code:'BEAUTY20', codePct:'20', ctaText:'Shop Sale Now', ctaLink:'shop.html?sale=true', countdownHours:8,
  },
  get()       { return DB.get(KEYS.promo) || this.defaults; },
  save(promo) { DB.set(KEYS.promo, promo); },
};

// ── Analytics ─────────────────────────────────────────────────
const VBAnalytics = {
  // Compute real monthly analytics from orders
  get() {
    const orders = VBOrders.getAll().filter(o => o.status !== 'cancelled');
    const customers = VBCustomers.getAll();
    const monthMap = {};

    orders.forEach(o => {
      if (!o.date) return;
      const d = new Date(o.date);
      const key = d.toLocaleString('en-PK', { month:'short', year:'numeric' });
      if (!monthMap[key]) monthMap[key] = { month:key, revenue:0, orders:0, newCustomers:0, avgOrder:0, _ts: d.getTime() };
      monthMap[key].revenue += (o.total || 0);
      monthMap[key].orders  += 1;
    });

    // Count new customers per month
    customers.forEach(c => {
      if (!c.joinDate) return;
      const d = new Date(c.joinDate);
      const key = d.toLocaleString('en-PK', { month:'short', year:'numeric' });
      if (monthMap[key]) monthMap[key].newCustomers += 1;
    });

    const result = Object.values(monthMap)
      .sort((a,b) => a._ts - b._ts)
      .map(m => ({ ...m, avgOrder: m.orders ? Math.round(m.revenue / m.orders) : 0 }));

    // If no real orders yet, fall back to seed analytics
    if (!result.length) return DB.get(KEYS.analytics) || [];
    return result;
  },

  summary() {
    const orders    = VBOrders.getAll().filter(o => o.status !== 'cancelled');
    const totalRev  = orders.reduce((s,o) => s + (o.total||0), 0);
    const reviews   = VBReviews.getAll();
    const avgRating = reviews.length ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
    const data      = this.get();
    const avgMonthly = data.length ? Math.round(totalRev / data.length) : 0;
    return { totalRev, totalOrders: orders.length, avgMonthly, avgRating };
  },
};

// ── Toast ─────────────────────────────────────────────────────
const VBToast = {
  show(msg, type='info', duration=3000) {
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'💜' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]||'💬'}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },
};

// ── Modal ─────────────────────────────────────────────────────
const VBModal = {
  open(id)  { const el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow='hidden'; } },
  close(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow=''; } },
  confirm(msg, onYes) {
    document.getElementById('confirm-msg').textContent = msg;
    const btn = document.getElementById('confirm-yes');
    btn.onclick = () => { this.close('confirm-modal'); onYes(); };
    this.open('confirm-modal');
  },
};

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── Navbar helpers ────────────────────────────────────────────
function initNav() {
  seedIfNeeded();
  updateNavUser();
  VBCart.updateBadge();
  VBWish.updateBadge();

  // Show dashboard link for staff only
  const session = VBAuth.session();
  if (session && (session.role === 'owner' || session.role === 'employee')) {
    document.querySelectorAll('#nav-dashboard-link, #mob-dashboard-link').forEach(el => {
      if (el) el.style.display = '';
    });
  }

  // Scroll behaviour (transparent → solid)
  const navbar = document.getElementById('navbar');
  if (navbar && navbar.classList.contains('transparent')) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Hamburger
  const ham = document.getElementById('nav-hamburger');
  const mob = document.getElementById('mobile-menu');
  if (ham && mob) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
  }

  // Active link
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href')?.split('?')[0].split('/').pop();
    if (href === path) a.classList.add('active');
    else if (path === '' && href === 'index.html') a.classList.add('active');
  });
}

function updateNavUser() {
  const session = VBAuth.session();
  const accountBtn = document.getElementById('account-btn');
  const dropdown   = document.getElementById('user-dropdown');
  const mobLink    = document.getElementById('mob-account-link');

  if (!session) {
    if (accountBtn) accountBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    if (dropdown)   dropdown.innerHTML = '';
    if (mobLink)    mobLink.textContent = 'Login / Register';
    return;
  }

  // Replace account btn with user pill
  if (accountBtn) {
    const pill = document.createElement('div');
    pill.className = 'nav-user-pill';
    pill.id = 'nav-user-pill';
    pill.innerHTML = `<div class="nav-avatar">${session.name.charAt(0).toUpperCase()}</div><span class="nav-user-name">${session.name.split(' ')[0]}</span>`;
    pill.onclick = () => toggleUserDropdown();
    accountBtn.parentNode.replaceChild(pill, accountBtn);
  }

  if (mobLink) mobLink.textContent = session.name;

  // Dropdown menu
  if (dropdown) {
    const dashLink = session.role === 'owner'    ? '<a class="nav-dropdown-item" href="dashboard-owner.html">Owner Dashboard</a>'
                   : session.role === 'employee' ? '<a class="nav-dropdown-item" href="dashboard-emp.html">Employee Dashboard</a>'
                   : '<a class="nav-dropdown-item" href="#">My Orders</a>';
    dropdown.innerHTML = `
      <div class="nav-dropdown-head">
        <div class="nav-dropdown-name">${session.name}</div>
        <div class="nav-dropdown-email">${session.email}</div>
      </div>
      ${dashLink}
      <a class="nav-dropdown-item" href="wishlist.html">💝 Wishlist</a>
      <div class="nav-dropdown-sep"></div>
      <button class="nav-dropdown-item danger" onclick="logoutUser()">🚪 Logout</button>
    `;
  }
}

function toggleUserDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('open');
  document.addEventListener('click', function handler(e) {
    if (!e.target.closest('.nav-dropdown-wrap')) {
      if (dd) dd.classList.remove('open');
      document.removeEventListener('click', handler);
    }
  });
}

function logoutUser() {
  VBAuth.logout();
  window.location.href = 'login.html';
}

// ── Product Card builder ──────────────────────────────────────
// SVG icon set (inline)
const ICONS = {
  heart:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFill: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  eye:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  link:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  cart:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
};

function vbCard(product, animDelay=0) {
  const inWish  = VBWish.has(product.id);
  const badgeMap = { bestseller:'badge-bestseller', sale:'badge-sale', hot:'badge-hot', new:'badge-new' };
  const badgeHtml = product.badge ? `<span class="pc-badge ${badgeMap[product.badge]||''}">${product.badge}</span>` : '';
  const origHtml  = product.origPrice ? `<span class="pc-price-was">Rs. ${product.origPrice.toLocaleString()}</span>` : '';
  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5-Math.round(product.rating));
  return `
    <div class="product-card" style="animation-delay:${animDelay}s;" data-id="${product.id}">
      <div class="pc-img">
        ${badgeHtml}
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300/FDE8F3/E91E8C?text=VB'"/>
        <div class="pc-actions">
          <button class="pc-action-btn ${inWish?'active':''}" title="${inWish?'Remove from Wishlist':'Add to Wishlist'}" onclick="vbToggleWish('${product.id}',this)">
            ${inWish ? ICONS.heartFill : ICONS.heart}
          </button>
          <button class="pc-action-btn" title="Quick View" onclick="vbQuickView('${product.id}')">
            ${ICONS.eye}
          </button>
          <a class="pc-action-btn" title="View Details" href="product-detail.html?id=${product.id}">
            ${ICONS.link}
          </a>
        </div>
      </div>
      <div class="pc-body">
        <div class="pc-cat">${product.category}</div>
        <a class="pc-name" href="product-detail.html?id=${product.id}">${product.name}</a>
        <div class="pc-stars">
          <span class="stars">${stars}</span>
          <span class="stars-count">(${product.reviews||0})</span>
        </div>
        <div class="pc-footer">
          <div class="pc-price">
            <span class="pc-price-now">Rs. ${product.price.toLocaleString()}</span>
            ${origHtml}
          </div>
          <button class="pc-add-btn" title="Add to Cart" onclick="vbAddToCart('${product.id}')" style="font-size:0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

function vbToggleWish(id, btn) {
  const session = VBAuth.session();
  if (!session) { VBToast.show('Please login to save to wishlist','warning'); window.location.href='login.html'; return; }
  const added = VBWish.toggle(id);
  if (btn) {
    btn.innerHTML = added ? ICONS.heartFill : ICONS.heart;
    btn.classList.toggle('active', added);
    btn.title = added ? 'Remove from Wishlist' : 'Add to Wishlist';
  }
  // Update all cards showing this product
  document.querySelectorAll(`[data-id="${id}"] .pc-action-btn[title*="ishlist"]`).forEach(b => {
    b.innerHTML = VBWish.has(id) ? ICONS.heartFill : ICONS.heart;
    b.classList.toggle('active', VBWish.has(id));
  });
  VBToast.show(added ? 'Added to wishlist' : 'Removed from wishlist', added?'success':'info');
}

function vbAddToCart(id) {
  const session = VBAuth.session();
  if (!session) { VBToast.show('Please login to add to cart','warning'); window.location.href='login.html'; return; }
  const p = VBProducts.getById(id);
  if (!p) return;
  VBCart.add(p);
  VBToast.show(`${p.name} added to cart 🛒`, 'success');
}

function vbQuickView(id) {
  const p = VBProducts.getById(id);
  if (!p) return;
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5-Math.round(p.rating));
  document.getElementById('qv-name').textContent  = p.name;
  document.getElementById('qv-name2').textContent = p.name;
  document.getElementById('qv-img').src           = p.image;
  document.getElementById('qv-img').alt           = p.name;
  document.getElementById('qv-cat').textContent   = p.category;
  document.getElementById('qv-stars').textContent = `${stars} (${p.reviews||0} reviews)`;
  document.getElementById('qv-desc').textContent  = p.desc || '';
  document.getElementById('qv-price-now').textContent = `Rs. ${p.price.toLocaleString()}`;
  document.getElementById('qv-price-was').textContent = p.origPrice ? `Rs. ${p.origPrice.toLocaleString()}` : '';
  document.getElementById('qv-add-btn').onclick    = () => { vbAddToCart(id); VBModal.close('quickview-modal'); };
  document.getElementById('qv-detail-btn').href    = `product-detail.html?id=${id}`;
  VBModal.open('quickview-modal');
}

// ── Helpers ───────────────────────────────────────────────────
function fmtPrice(n)  { return 'Rs. ' + Number(n).toLocaleString(); }
function fmtDate(d)   { return new Date(d).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' }); }
function avatarBg(name) {
  const colors = ['#E91E8C','#6B2D5E','#C9956C','#2D8A4E','#2E6DA4','#C9880A','#C0392B'];
  let h = 0; for (const c of (name||'?')) h = (h + c.charCodeAt(0)) % colors.length;
  return colors[h];
}
function starsHtml(rating) {
  const r = Math.round(rating);
  return '★'.repeat(r) + '☆'.repeat(5-r);
}
function statusBadge(status) {
  const map = { processing:'s-processing', shipped:'s-shipped', delivered:'s-delivered', cancelled:'s-cancelled' };
  return `<span class="status-badge ${map[status]||''}"><span class="status-dot"></span>${status}</span>`;
}
function typeBadge(type) {
  const map = { vip:'s-vip', regular:'s-regular', new:'s-new' };
  return `<span class="status-badge ${map[type]||''}">${type}</span>`;
}

// ── Init ──────────────────────────────────────────────────────
seedIfNeeded();
