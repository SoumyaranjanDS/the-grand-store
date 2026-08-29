require('dotenv').config({ path: '../.env' });
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const crypto = require('crypto');
const Product = require('../models/Product');

const filePath = path.join(__dirname, '../../frontend/public/grandstore_cognac_corrected_current.xlsx');

const splitStr = (str) => {
  if (!str) return [];
  return String(str).split(',').map(s => s.trim()).filter(s => s);
};

// Clean country string e.g. "France Cognac" -> "France"
const cleanCountry = (country, category) => {
  if (!country) return '';
  let cleaned = String(country).trim();
  if (category && cleaned.toLowerCase().endsWith(category.toLowerCase())) {
    cleaned = cleaned.substring(0, cleaned.length - category.length).trim();
  }
  return cleaned;
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for new Cognac seeding.");

    let totalUpdated = 0;
    let totalInserted = 0;

    console.log(`Processing file: ${filePath}`);
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    
    // row index 3 is headers
    const headers = rawData[3];
    if (!headers || !headers.includes('Product Name')) {
      console.error(`Unexpected header structure. Skipping.`, headers);
      process.exit(1);
    }

    const dataRows = rawData.slice(4);
    
    for (const row of dataRows) {
      if (!row[4]) continue; // Skip empty rows (Product Name is at index 4)

      const categoryStr = row[0] || '';
      
      const productData = {
        category: categoryStr,
        country: cleanCountry(row[1], categoryStr),
        subcategory: row[2] || '',
        brand: row[3] || '',
        name: row[4],
        description: row[5] || '',
        price: row[6] || '0',
        tags: splitStr(row[7]),
        tastingNotes: splitStr(row[8]),
        flavorProfile: splitStr(row[9]),
        foodPairing: splitStr(row[10]),
        // row[11] is International Export
        image: row[12] || '',
        gallery: [row[13], row[14], row[15], row[16]].filter(Boolean),
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

    console.log(`\nSeeding Complete!`);
    console.log(`Total Products Updated: ${totalUpdated}`);
    console.log(`Total Products Inserted: ${totalInserted}`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
