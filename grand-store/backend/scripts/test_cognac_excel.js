const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../frontend/public/grandstore_cognac_corrected_current.xlsx');

try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
  // Print rows 0 to 4 to understand the header structure
  for (let i = 0; i < 5; i++) {
    console.log(`Row ${i}:`, rawData[i]);
  }
} catch(e) {
  console.error(`Error reading file:`, e.message);
}
