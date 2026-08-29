const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

// Wait, the env has the correct MONGO_URI
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const product = await Product.findOne({ id: '19237880-fc11-41f9-9df0-3cfced3b2adc' }) 
                || await Product.findOne({ _id: '19237880-fc11-41f9-9df0-3cfced3b2adc' })
                || await Product.findOne({ name: /Balblair/i });
                
  if (product) {
    console.log(`Found product: ${product.name}`);
    console.log(`Current stock: ${product.stock}`);
    
    // Update stock to 10
    await Product.updateOne({ _id: product._id }, { $set: { stock: 10 } });
    console.log(`Successfully updated stock to 10.`);
  } else {
    console.log(`Product not found.`);
  }

  mongoose.disconnect();
}).catch(console.error);
