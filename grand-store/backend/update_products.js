require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const Attribute = require('./models/Attribute');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const csvDir = path.join(__dirname, '../../products_csv');
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.xlsx'));

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const file of files) {
    console.log(`Processing file: ${file}`);
    const workbook = xlsx.readFile(path.join(csvDir, file));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Data actually starts at row 3 (which is index 2 if 0-indexed).
    // Data actually starts at row index 3
    const data = xlsx.utils.sheet_to_json(sheet, { range: 3 });
    
    for (const row of data) {
      const productName = row['Product Name'];
      if (!productName) continue;

      const flavorStr = row['Flavor Profile'];
      const pairingStr = row['Food Pairing'];
      
      const flavorNames = flavorStr && typeof flavorStr === 'string' ? flavorStr.split(',').map(s => s.trim()) : [];
      const pairingNames = pairingStr && typeof pairingStr === 'string' ? pairingStr.split(',').map(s => s.trim()) : [];

      // Map names to attribute values
      const flavorProfile = [];
      for (const name of flavorNames) {
        let attr = await Attribute.findOne({ name: name, type: 'flavor' });
        if (!attr) {
          const value = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          attr = new Attribute({ name, value, type: 'flavor', icon: 'Sparkles' });
          await attr.save();
        }
        flavorProfile.push(attr.value);
      }

      const foodPairing = [];
      for (const name of pairingNames) {
        let attr = await Attribute.findOne({ name: name, type: 'pairing' });
        if (!attr) {
          const value = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          attr = new Attribute({ name, value, type: 'pairing', icon: 'Utensils' });
          await attr.save();
        }
        foodPairing.push(attr.value);
      }

      if (flavorProfile.length > 0 || foodPairing.length > 0) {
        const product = await Product.findOne({ name: productName });
        if (product) {
          product.flavorProfile = flavorProfile;
          product.foodPairing = foodPairing;
          await product.save();
          updatedCount++;
        } else {
          notFoundCount++;
          // console.log(`Not found in DB: ${productName}`);
        }
      }
    }
  }

  console.log(`Finished. Updated: ${updatedCount}, Not found: ${notFoundCount}`);
  await mongoose.disconnect();
}

main().catch(console.error);
