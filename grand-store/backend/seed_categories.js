const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = "mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority";

const storeCategories = [
  'Whisky', 'Wine', 'Champagne', 'Cognac', 'Brandy',
  'Gin', 'Liqueur', 'Rum', 'Tequila', 'Vodka',
  'Ciders', 'Spirits', 'Scotch'
];

async function seedCategories() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const Category = require('./models/Category');

  for (const catName of storeCategories) {
    const exists = await Category.findOne({ name: catName });
    if (!exists) {
      await Category.create({
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: `Premium ${catName}`,
        isActive: true
      });
      console.log(`Created category: ${catName}`);
    } else {
      console.log(`Category already exists: ${catName}`);
    }
  }

  console.log("Seeding complete.");
  mongoose.disconnect();
}

seedCategories();
