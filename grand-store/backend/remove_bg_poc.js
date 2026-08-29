require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { removeBackground } = require('@imgly/background-removal-node');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function processProducts() {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const products = await Product.find({ 
    id: { $in: ['prod_1787654842540_619', 'prod_1787654841808_342', 'd5970438-e05c-4f5d-afaa-ad952ce06661'] }
  });

  console.log(`Found ${products.length} products to process.`);

  for (const product of products) {
    console.log(`Processing: ${product.name} [${product.image}]`);
    try {
      const blob = await removeBackground(product.image);
      const buffer = Buffer.from(await blob.arrayBuffer());
      
      const filename = `bg-removed-${product._id}.png`;
      const filepath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filepath, buffer);
      
      const newImageUrl = `/uploads/${filename}`;
      await Product.updateOne({ _id: product._id }, { 
        $set: { 
          image: newImageUrl, 
          backgroundRemovalStatus: 'completed',
          originalImage: product.originalImage || product.image
        } 
      });
      console.log(`Success: saved to ${newImageUrl}`);
    } catch (err) {
      console.error(`Error processing ${product.name}:`, err.message);
    }
  }
  
  mongoose.disconnect();
}

processProducts().catch(console.error);
