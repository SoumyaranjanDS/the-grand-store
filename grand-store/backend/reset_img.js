const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const products = await Product.find({ 
    id: { $in: ['prod_1787654842540_619', 'prod_1787654841808_342', 'd5970438-e05c-4f5d-afaa-ad952ce06661'] }
  });
  for (const p of products) {
    if (p.image && p.image.includes('e_background_removal')) {
      p.image = p.image.replace('e_background_removal/', '');
      await p.save();
      console.log('Reset image for:', p.name);
    } else {
      console.log('Already reset for:', p.name);
    }
  }
  mongoose.disconnect();
}).catch(console.error);
