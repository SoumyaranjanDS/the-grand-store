const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

// Make sure to use the correct MongoDB URI
// It looks like the new URI from migrateDb.js is: mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/
// const uri = process.env.MONGO_URI || 'mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/';

const newWines = [
  {
    id: '105',
    name: 'Kanonkop Paul Sauer 2019',
    type: 'Wine',
    category: 'Wine',
    country: 'South Africa',
    brand: 'Kanonkop',
    size: '750 ML',
    price: 'R1250',
    image: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=1974&auto=format&fit=crop',
    description: 'A classic Bordeaux blend from Stellenbosch, offering deep layers of dark fruit, cedar, and elegant tannins.',
    featured: true,
    stock: 25,
    averageRating: 4.8,
    reviewCount: 42
  },
  {
    id: '106',
    name: 'Opus One 2018',
    type: 'Wine',
    category: 'Wine',
    country: 'United States',
    brand: 'Opus One',
    size: '750 ML',
    price: 'R8500',
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=1974&auto=format&fit=crop',
    description: 'The iconic Napa Valley blend. Silky, powerful, and aromatic with cassis, black cherry, and subtle vanilla.',
    featured: true,
    stock: 12,
    averageRating: 4.9,
    reviewCount: 115
  },
  {
    id: '107',
    name: 'Catena Zapata Malbec Argentino 2020',
    type: 'Wine',
    category: 'Wine',
    country: 'Argentina',
    brand: 'Catena Zapata',
    size: '750 ML',
    price: 'R2100',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2070&auto=format&fit=crop',
    description: 'An epic Malbec that tells the story of Argentina. Rich, concentrated blackberry fruit with profound minerality.',
    featured: true,
    stock: 30,
    averageRating: 4.7,
    reviewCount: 89
  },
  {
    id: '108',
    name: 'Almaviva 2019',
    type: 'Wine',
    category: 'Wine',
    country: 'Chile',
    brand: 'Almaviva',
    size: '750 ML',
    price: 'R3800',
    image: 'https://images.unsplash.com/photo-1565985834958-38da0db1b858?q=80&w=2070&auto=format&fit=crop',
    description: 'A magnificent Chilean Bordeaux-style blend from Puente Alto, balancing ripe fruit with incredible tension and elegance.',
    featured: true,
    stock: 18,
    averageRating: 4.8,
    reviewCount: 56
  },
  {
    id: '109',
    name: 'Cloudy Bay Sauvignon Blanc 2022',
    type: 'Wine',
    category: 'Wine',
    country: 'New Zealand',
    brand: 'Cloudy Bay',
    size: '750 ML',
    price: 'R750',
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1915&auto=format&fit=crop',
    description: 'The defining Marlborough Sauvignon Blanc. Vibrant, expressive, and intensely aromatic with passionfruit and lime.',
    featured: true,
    stock: 45,
    averageRating: 4.6,
    reviewCount: 230
  }
];

async function seedGlobalWines() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    for (const wine of newWines) {
      // Check if product already exists
      const existing = await Product.findOne({ name: wine.name });
      if (!existing) {
        await Product.create(wine);
        console.log(`Added ${wine.name}`);
      } else {
        console.log(`${wine.name} already exists.`);
      }
    }
    
    console.log('Finished adding global wines.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedGlobalWines();
