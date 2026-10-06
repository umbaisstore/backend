import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Review from './models/Review.js';

const INITIAL_PRODUCTS = [
  {
    id: 'milestone',
    cat: 'Perfume',
    name: 'UMBAIS Milestone Eau de Parfum – 50ML',
    short: 'A Scent Beyond Boundaries',
    price: 4500,
    badge: 'Flagship',
    imgs: ['p_a', 'p_b', 'p_c', 'p_d', 'p_e', 'p_f', 'p_g'],
    desc: 'UMBAIS Milestone Eau de Parfum ek premium fragrance hai jo elegance, confidence aur lasting freshness ko represent karti hai. Iska sophisticated character everyday wear se lekar special occasions tak ke liye suitable hai. Comes in deep forest-green packaging with gold crest and charm.',
    pills: ['50ML', 'Eau de Parfum', 'For Him', 'Cash on Delivery', 'Premium Fragrance'],
    spec: [
      ['Size', '50ML'],
      ['Type', 'Eau de Parfum'],
      ['Category', 'Premium Fragrance'],
      ['Gender', 'For Him'],
      ['Payment', 'Cash on Delivery (COD) Available'],
      ['Delivery Time', '2–4 Business Days']
    ],
    hl: [
      ['✨', 'Premium Eau de Parfum'],
      ['🌿', 'Sophisticated & elegant fragrance'],
      ['⏱️', 'Long-lasting performance (10+ hours)'],
      ['👔', 'Perfect for everyday & special occasions'],
      ['🎁', 'Luxury bottle & gift packaging'],
      ['💵', 'Cash on Delivery All Over Pakistan']
    ],
    inStock: true
  },
  {
    id: 'classic-gold',
    cat: 'Watches',
    name: 'UMBAIS Classic Gold Leather Watch',
    short: 'Quartz · Black dial · Date',
    price: 8500,
    badge: 'Watch',
    imgs: ['w1a', 'w1b', 'w1c', 'w1d'],
    desc: 'A gold-tone case on a black croco-texture leather strap, with a sunray black dial and a date window. Refined enough for the boardroom, easy enough for every day. Complete in luxury UMBAIS watch box.',
    pills: ['Quartz', 'Gold-tone case', 'Leather strap', 'Date window', 'Cash on Delivery'],
    spec: [
      ['Movement', 'Quartz'],
      ['Case', 'Gold-tone'],
      ['Strap', 'Black croco-embossed leather'],
      ['Dial', 'Black sunray with date'],
      ['Gender', 'For Him'],
      ['Payment', 'Cash on Delivery (COD) Available']
    ],
    hl: [
      ['⌚', 'Precision Quartz movement'],
      ['🟡', 'Gold-tone case'],
      ['🖤', 'Black leather strap'],
      ['📅', 'Date window'],
      ['🎁', 'Premium box packaging'],
      ['💵', 'Cash on Delivery']
    ],
    inStock: true
  },
  {
    id: 'two-tone-automatic',
    cat: 'Watches',
    name: 'UMBAIS Two-Tone Automatic Watch',
    short: 'Automatic · Sapphire crystal · 100M',
    price: 14500,
    badge: 'Watch',
    imgs: ['w2a', 'w2b', 'w2c'],
    desc: 'A two-tone steel and gold bracelet with a black sunray dial. Automatic movement, sapphire crystal and 100M water resistance, built for people who value precision and prestige.',
    pills: ['Automatic', 'Sapphire crystal', '100M / 330FT', 'Two-tone', 'Cash on Delivery'],
    spec: [
      ['Movement', 'Automatic'],
      ['Crystal', 'Scratch-resistant Sapphire'],
      ['Water resistance', '100M / 330FT'],
      ['Bracelet', 'Two-tone stainless steel and gold'],
      ['Gender', 'For Him'],
      ['Payment', 'Cash on Delivery (COD) Available']
    ],
    hl: [
      ['⚙️', 'Automatic movement'],
      ['💎', 'Sapphire crystal'],
      ['🌊', '100M / 330FT water resistance'],
      ['📅', 'Date window'],
      ['💵', 'Cash on Delivery']
    ],
    inStock: true
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Muhammad Hamza',
    city: 'Lahore',
    product: 'Milestone Eau de Parfum',
    rating: 5,
    date: '2 days ago',
    comment: 'The scent projection and longevity is unreal! Lasts well over 10 hours on clothes. Packaging bohot premium hai aur Cash on Delivery 2 din me pohanch gaya. Highly recommended!',
    status: 'approved'
  },
  {
    id: 'rev-2',
    name: 'Bilal Tariq',
    city: 'Islamabad',
    product: 'Two-Tone Automatic Watch',
    rating: 5,
    date: '5 days ago',
    comment: 'SubhanAllah, the weight and craftsmanship of this watch is top-notch. Sapphire crystal shines beautifully. Cash on delivery se mangwaya tha, courier ko parcel check kar k pay kiya.',
    status: 'approved'
  },
  {
    id: 'rev-3',
    name: 'Usman Shah',
    city: 'Karachi',
    product: 'Milestone Eau de Parfum',
    rating: 5,
    date: '1 week ago',
    comment: 'Milestone is pure luxury. Office wear k liye best fragrance hai, compliments zaroor miltay hain. Bottle k sath gold charm ka touch bohot classy hai.',
    status: 'approved'
  },
  {
    id: 'rev-4',
    name: 'Ayesha Khan',
    city: 'Sialkot',
    product: 'Classic Gold Leather Watch',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Ordered as an anniversary gift for my husband. The green velvet box and gold finish are magnificent. Very fast delivery and prompt customer service on WhatsApp.',
    status: 'approved'
  }
];

export async function seedDatabase() {
  try {
    // 1. Seed Admin in Admin collection & User collection
    const adminCount = await Admin.countDocuments();
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await Admin.create({
        username: adminUsername,
        password: hashedPassword
      });
      console.log(`[Seed] Created default Admin account: '${adminUsername}' / '${adminPassword}'`);
    }

    // Ensure Admin is in User collection with role: 'admin'
    const adminUser = await User.findOne({ 
      $or: [{ email: 'admin@umbias.com' }, { email: 'admin' }, { role: 'admin' }] 
    });
    if (!adminUser) {
      await User.create({
        name: 'UMBAIS Administrator',
        email: 'admin@umbias.com',
        password: adminPassword,
        phone: '0300 0000000',
        city: 'Headquarters',
        address: 'UMBAIS Luxury House',
        role: 'admin'
      });
      console.log(`[Seed] Created default Admin in Users collection (email: admin@umbias.com / pass: ${adminPassword})`);
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`[Seed] Seeded ${INITIAL_PRODUCTS.length} initial products into MongoDB.`);
    }

    // 3. Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany(INITIAL_REVIEWS);
      console.log(`[Seed] Seeded ${INITIAL_REVIEWS.length} initial reviews into MongoDB.`);
    }
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
}
