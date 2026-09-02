const fs = require('fs');
let raw = fs.readFileSync('categories_ipv4.json');
let text = raw.toString('utf16le');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const data = JSON.parse(text);
const cats = data.data || data; // handle different payload structs
if (Array.isArray(cats)) {
  cats.forEach(c => console.log(`Category: ${c.name} - Logos: ${c.brandLogos ? c.brandLogos.length : 0}`));
}
