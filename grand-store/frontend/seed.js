import mongoose from 'mongoose';
import { products } from './src/data.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load backend .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  description: String,
  price: String,
  image: String,
  featured: Boolean,
  options: [String],
  tags: [String],
  tastingNotes: [String],
  stock: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await Product.deleteMany();
    console.log('Existing products cleared');

    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
