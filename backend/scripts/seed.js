const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

const products = [
  {
    name: 'Premium Basmati Rice Seeds (10kg)',
    description: 'High-yield, aromatic long-grain Basmati rice seeds. Certified organic and pest-resistant. Ideal for northern plains.',
    price: 1250,
    oldPrice: 1500,
    discount: '16%',
    brand: 'AgriGrow',
    category: 'Seeds',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
    stock: 500,
    negotiable: true
  },
  {
    name: 'Organic NPK Fertilizer (25kg)',
    description: 'Balanced Nitrogen, Phosphorus, and Potassium blend for all-round crop growth. 100% natural ingredients.',
    price: 850,
    oldPrice: 999,
    discount: '15%',
    brand: 'BioSoil',
    category: 'Fertilizers',
    images: ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80'],
    stock: 200,
    negotiable: true
  },
  {
    name: 'Electric Battery Sprayer (16L)',
    description: 'Dual-mode manual and battery-operated sprayer. Ergonomic design with adjustable nozzles for precise application.',
    price: 3200,
    oldPrice: 4500,
    discount: '29%',
    brand: 'FarmTools',
    category: 'Tools',
    images: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'],
    stock: 50,
    negotiable: true
  },
  {
    name: 'Hybrid Tomato Seeds (100g)',
    description: 'F1 Hybrid seeds for firm, red tomatoes. High resistance to leaf curl virus. 90% germination rate.',
    price: 450,
    oldPrice: 600,
    discount: '25%',
    brand: 'SeedPro',
    category: 'Seeds',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'],
    stock: 1000,
    negotiable: false
  },
  {
    name: 'Drip Irrigation Kit (1 Acre)',
    description: 'Complete drip irrigation system including main pipes, laterals, drippers, and connectors. Saves up to 60% water.',
    price: 12000,
    oldPrice: 15000,
    discount: '20%',
    brand: 'WaterWise',
    category: 'Machinery',
    images: ['https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80'],
    stock: 15,
    negotiable: true
  },
  {
    name: 'Organic Vermicompost (50kg)',
    description: 'Premium quality earthworm-processed organic manure. Rich in micronutrients and beneficial microbes.',
    price: 600,
    oldPrice: 750,
    discount: '20%',
    brand: 'EarthSafe',
    category: 'Fertilizers',
    images: ['https://images.unsplash.com/photo-1621460244081-64bb09055433?auto=format&fit=crop&w=800&q=80'],
    stock: 300,
    negotiable: true
  },
  {
    name: 'Heavy Duty Garden Trowel',
    description: 'Stainless steel trowel with comfortable wooden handle. Rust-resistant and durable for all soil types.',
    price: 299,
    oldPrice: 499,
    discount: '40%',
    brand: 'AgriGear',
    category: 'Tools',
    images: ['https://images.unsplash.com/photo-1617576621334-9721666838a1?auto=format&fit=crop&w=800&q=80'],
    stock: 100,
    negotiable: false
  },
  {
    name: 'Fresh Alphonso Mangoes (5kg)',
    description: 'Export-quality, naturally ripened Alphonso mangoes from Ratnagiri. Sweet, pulpy, and aromatic.',
    price: 1800,
    oldPrice: 2200,
    discount: '18%',
    brand: 'FruitHub',
    category: 'Organic Produce',
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80'],
    stock: 40,
    negotiable: true
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zylora');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing data.');

    // Create a seller
    const seller = await User.create({
      name: 'Agri Business Center',
      email: 'seller@zylora.com',
      password: 'password123',
      role: 'seller',
      businessName: 'Agri Business Center',
      gstin: '24AAAAA0000A1Z5'
    });
    console.log('Created seller user.');

    // Create a buyer
    const buyer = await User.create({
      name: 'Prashant Parmar',
      email: 'buyer@zylora.com',
      password: 'password123',
      role: 'buyer',
      addresses: [
        {
          name: 'Prashant Parmar',
          mobile: '9876543210',
          pincode: '400001',
          address: 'Flat 101, Blue Skies Bldg, Linking Road, Mumbai',
          selected: true,
          type: 'Home'
        }
      ]
    });
    console.log('Created buyer user.');

    // Add seller ID to products
    const productsWithSeller = products.map(p => ({
      ...p,
      seller: seller._id
    }));

    await Product.insertMany(productsWithSeller);
    console.log(`Seeded ${productsWithSeller.length} products.`);

    console.log('Data seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
