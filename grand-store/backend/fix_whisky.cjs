const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/';

mongoose.connect(MONGO_URI).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const vino = await Product.findOne({ name: /whisky tona/i });
  vino.image = '/uploads/image-1787035951544.jpg'; await vino.save(); console.log('Fixed image');

  const allProducts = await Product.find().sort({ createdAt: -1 });
  console.log('\nTOTAL PRODUCTS:', allProducts.length);
  allProducts.forEach((p, idx) => {
    console.log(`[${idx + 1}] ID: ${p._id} | Name: ${p.name} | CreatedAt: ${p.createdAt}`);
  });

  mongoose.disconnect();
}).catch(console.error);
