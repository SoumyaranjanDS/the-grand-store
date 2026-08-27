require('dotenv').config({ path: '../.env' });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const Product = require('../models/Product');

const files = [
  'grandstore_beer_cider_rtd_with_country.xlsx',
  'grandstore_champagne_with_country.xlsx',
  'grandstore_spirits_with_country.xlsx',
  'grandstore_whisky_with_country.xlsx'
];

const dir = path.join(__dirname, '../../frontend/public/assets');

const splitStr = (str) => {
  if (!str) return [];
  return String(str).split(',').map(s => s.trim()).filter(s => s);
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Upsert seeding.");

    let totalUpdated = 0;
    let totalInserted = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      console.log(`Processing file: ${file}`);
      
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      // Read starting from row index 3 (4th row) to skip title/desc
      // Note: xlsx.utils.sheet_to_json doesn't natively skip rows if they are empty unless specified. 
      // A safe way is to read as array of arrays, slice, then map to headers.
      const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      
      // row index 3 is headers (0-indexed)
      const headers = rawData[3];
      if (!headers || headers[0] !== 'Product Name') {
        console.error(`Unexpected header structure in ${file}. Skipping.`);
        continue;
      }

      // row index 4 onwards is data
      const dataRows = rawData.slice(4);
      
      for (const row of dataRows) {
        if (!row[0]) continue; // Skip empty rows

        const productData = {
          name: row[0],
          category: row[1] || '',
          subcategory: row[2] || '',
          country: row[3] || '',
          description: row[4] || '',
          price: row[5] || '0',
          tags: splitStr(row[6]),
          tastingNotes: splitStr(row[7]),
          flavorProfile: splitStr(row[8]),
          foodPairing: splitStr(row[9]),
          // row[10] is International Export
          image: row[11] || '',
          gallery: [row[12], row[13], row[14], row[15]].filter(Boolean),
          brand: row[16] || '',
          size: row[17] || ''
        };

        // Upsert by name
        const result = await Product.findOneAndUpdate(
          { name: productData.name },
          { 
            $set: productData,
            $setOnInsert: { id: crypto.randomUUID() }
          },
          { upsert: true, new: false }
        );

        if (!result) {
          totalInserted++;
        } else {
          totalUpdated++;
        }
      }
      console.log(`Finished ${file}.`);
    }

    console.log(`\nSeeding Complete!`);
    console.log(`Total Products Updated: ${totalUpdated}`);
    console.log(`Total Products Inserted: ${totalInserted}`);
    process.exit(0);

  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
