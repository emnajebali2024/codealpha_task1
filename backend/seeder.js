const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const Product = require('./models/Product');
const User    = require('./models/User');

const products = [
  {
    name: 'Apple iPhone 15 Pro Max', price: 1199.99, originalPrice: 1299.99,
    category: 'Electronics', brand: 'Apple', featured: true, stock: 50,
    ratings: 4.8, numReviews: 124,
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80'],
    description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and pro camera system.',
    tags: ['smartphone','apple','iphone','5g']
  },
  {
    name: 'Samsung Galaxy S24 Ultra', price: 1099.99, originalPrice: 1199.99,
    category: 'Electronics', brand: 'Samsung', featured: true, stock: 35,
    ratings: 4.7, numReviews: 89,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80'],
    description: 'Built-in S Pen, 200MP camera, Galaxy AI. The ultimate Android experience.',
    tags: ['smartphone','samsung','android']
  },
  {
    name: 'Sony WH-1000XM5 Headphones', price: 279.99, originalPrice: 349.99,
    category: 'Electronics', brand: 'Sony', featured: true, stock: 80,
    ratings: 4.9, numReviews: 256,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
    description: 'Industry-leading noise canceling with 30h battery life and crystal clear call quality.',
    tags: ['headphones','sony','wireless','noise-canceling']
  },
  {
    name: 'MacBook Pro 16" M3 Pro', price: 2499.99, originalPrice: 2699.99,
    category: 'Electronics', brand: 'Apple', featured: true, stock: 20,
    ratings: 4.9, numReviews: 67,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'],
    description: 'M3 Pro chip delivers breakthrough performance with up to 22 hours battery life.',
    tags: ['laptop','apple','macbook','m3']
  },
  {
    name: 'Nike Air Max 270', price: 129.99, originalPrice: 159.99,
    category: 'Clothing', brand: 'Nike', featured: false, stock: 100,
    ratings: 4.5, numReviews: 340,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    description: 'Nike\'s largest heel Air unit yet. Engineered for all-day comfortable movement.',
    tags: ['shoes','nike','sneakers','sports']
  },
  {
    name: 'PlayStation 5 Console', price: 499.99, originalPrice: 599.99,
    category: 'Electronics', brand: 'Sony', featured: true, stock: 10,
    ratings: 4.9, numReviews: 512,
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80'],
    description: 'Next-gen gaming with ultra-high speed SSD, DualSense controller, and 4K gaming.',
    tags: ['gaming','playstation','sony','console']
  },
  {
    name: 'LG OLED C3 55" 4K TV', price: 1299.99, originalPrice: 1799.99,
    category: 'Electronics', brand: 'LG', featured: true, stock: 15,
    ratings: 4.8, numReviews: 95,
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80'],
    description: 'Self-lit OLED pixels for perfect blacks. Powered by α9 AI Processor Gen6.',
    tags: ['tv','oled','4k','lg']
  },
  {
    name: 'Adidas Ultraboost 23', price: 179.99, originalPrice: 199.99,
    category: 'Sports', brand: 'Adidas', featured: false, stock: 60,
    ratings: 4.6, numReviews: 178,
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80'],
    description: 'Responsive Boost cushioning. PRIMEKNIT+ upper. Built for performance running.',
    tags: ['shoes','adidas','running','sports']
  },
  {
    name: 'iPad Pro 12.9" M2', price: 1099.99, originalPrice: 1199.99,
    category: 'Electronics', brand: 'Apple', featured: false, stock: 30,
    ratings: 4.8, numReviews: 143,
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80'],
    description: 'Liquid Retina XDR display, M2 chip, Apple Pencil & Magic Keyboard compatible.',
    tags: ['tablet','apple','ipad','m2']
  },
  {
    name: 'Dyson V15 Detect Absolute', price: 699.99, originalPrice: 799.99,
    category: 'Home & Garden', brand: 'Dyson', featured: false, stock: 25,
    ratings: 4.7, numReviews: 67,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    description: 'Laser reveals hidden dust. Auto-adjusts suction to surface type.',
    tags: ['vacuum','dyson','home','cleaning']
  },
  {
    name: "Levi's 501 Original Jeans", price: 69.99, originalPrice: 89.99,
    category: 'Clothing', brand: "Levi's", featured: false, stock: 150,
    ratings: 4.4, numReviews: 892,
    images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&q=80'],
    description: 'The original blue jean since 1873. Button-fly, straight-leg, iconic.',
    tags: ['jeans','levis','clothing','fashion']
  },
  {
    name: 'Canon EOS R6 Mark II', price: 2499.99, originalPrice: 2799.99,
    category: 'Electronics', brand: 'Canon', featured: false, stock: 12,
    ratings: 4.8, numReviews: 43,
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'],
    description: 'Full-frame mirrorless, 40fps continuous shooting, outstanding AF performance.',
    tags: ['camera','canon','mirrorless','photography']
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️  Cleared existing data');

    await User.create({
      name: 'Admin ShopNova', email: 'admin@shopnova.com',
      password: 'admin123456', role: 'admin'
    });
    console.log('👤 Admin created: admin@shopnova.com / admin123456');

    await Product.insertMany(products);
    console.log(`📦 ${products.length} products seeded`);

    console.log('\n🎉 Database seeded! Run: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedDB();