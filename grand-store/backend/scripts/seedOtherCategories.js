require('dotenv').config({ path: '../.env' });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const Product = require('../models/Product');
const fs = require('fs');

const publicDir = path.join(__dirname, '../../frontend/public');
const filesToProcess = [
  'grandstore_beer_cider_rtd_corrected_subcategories.xlsx',
  'grandstore_champagne_corrected_subcategories.xlsx',
  'grandstore_cognac_corrected_subcategories.xlsx',
  'grandstore_spirits_corrected_subcategories.xlsx'
];

const splitStr = (str) => {
  if (!str) return [];
  return String(str).split(',').map(s => s.trim()).filter(s => s);
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for bulk seeding.");

    let totalUpdated = 0;
    let totalInserted = 0;

    for (const file of filesToProcess) {
      const filePath = path.join(publicDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found, skipping: ${file}`);
        continue;
      }
      
      console.log(`\nProcessing file: ${file}`);
      
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      
      const headers = rawData[3];
      if (!headers || headers[0] !== 'Product Name') {
        console.error(`Unexpected header structure in ${file}. Skipping.`);
        continue;
      }

      const dataRows = rawData.slice(4);
      
      for (const row of dataRows) {
        if (!row[0]) continue; // Skip if no Product Name

        const productData = {
          name: row[0] || '',
          category: row[1] || '',
          subcategory: row[2] || '',
          country: row[3] || '',
          description: row[4] || '',
          price: row[5] || '0',
          tags: splitStr(row[6]),
          tastingNotes: splitStr(row[7]),
          flavorProfile: splitStr(row[8]),
          foodPairing: splitStr(row[9]),
          image: row[11] || '',
          gallery: [row[12], row[13], row[14], row[15]].filter(Boolean),
          brand: row[16] || '',
          size: row[17] || ''
        };

        const result = await Product.findOneAndUpdate(
          { name: productData.name },
          { 
            $set: productData,
            $setOnInsert: { id: crypto.randomUUID() }
          },
          { upsert: true, returnDocument: 'before' }
        );

        if (!result) {
          totalInserted++;
        } else {
          totalUpdated++;
        }
      }
    }

    console.log(`\nBulk Seeding Complete!`);
    console.log(`Total Products Updated: ${totalUpdated}`);
    console.log(`Total Products Inserted: ${totalInserted}`);
    process.exit(0);

  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
}

seed();
