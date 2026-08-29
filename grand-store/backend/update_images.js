const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function updateImages() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });

  const updates = [
    {
      id: 'd5970438-e05c-4f5d-afaa-ad952ce06661',
      image: '/uploads/product-del-maguey-las-milpas.png'
    },
    {
      id: 'prod_1787654841808_342',
      image: '/uploads/product-aberlour-18.png'
    },
    {
      id: 'prod_1787654842540_619',
      image: '/uploads/product-ardbeg-dolce.png'
    }
  ];

  for (const update of updates) {
    const result = await Product.updateOne(
      { id: update.id },
      { $set: { image: update.image, backgroundRemovalStatus: 'complete' } }
    );
    console.log(`Updated ${update.id}: ${result.modifiedCount > 0 ? 'Success' : 'Not found/Unchanged'}`);
  }

  process.exit(0);
}

updateImages();
