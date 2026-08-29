const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../../frontend/public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.xlsx') && f !== 'grandstore_whisky_final_country_subcategory_brand.xlsx');

for (const file of files) {
  const filePath = path.join(publicDir, file);
  console.log(`\n--- Reading ${file} ---`);
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    
    // Print rows 0 to 4 to understand the header structure
    for (let i = 0; i < 5; i++) {
      console.log(`Row ${i}:`, rawData[i]);
    }
  } catch(e) {
    console.error(`Error reading ${file}:`, e.message);
  }
}
