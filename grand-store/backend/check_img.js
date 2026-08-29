const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const p = await Product.findOne({ id: 'prod_1787655329691_777' }).lean();
  console.log(p ? p : 'No product found');
  mongoose.disconnect();
}).catch(console.error);
