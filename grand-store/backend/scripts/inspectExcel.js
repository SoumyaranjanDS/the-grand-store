const xlsx = require('xlsx');
const path = require('path');

const files = [
  'grandstore_beer_cider_rtd_with_country.xlsx',
  'grandstore_champagne_with_country.xlsx',
  'grandstore_spirits_with_country.xlsx',
  'grandstore_whisky_with_country.xlsx'
];

const dir = path.join(__dirname, '../../frontend/public/assets');

for (const file of files) {
  const filePath = path.join(dir, file);
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    console.log(`\n--- ${file} ---`);
    console.log(`Rows: ${data.length}`);
    for (let i = 0; i < 5; i++) {
      console.log(`Row ${i}:`, data[i]);
    }
  } catch (err) {
    console.error(`Error reading ${file}: ${err.message}`);
  }
}
