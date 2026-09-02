const fs = require('fs');
let raw = fs.readFileSync('categories_ipv4.json');
let text = raw.toString('utf16le');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const data = JSON.parse(text);
const cats = data.data || data;
cats.forEach(c => {
  if (['Whisky', 'Tequila', 'Brandy'].includes(c.name)) {
    console.log(`\n--- ${c.name} ---`);
    console.log(JSON.stringify(c.brandLogos, null, 2));
  }
});
