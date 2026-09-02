const fs = require('fs');
const data = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
const cats = data.map(c => ({ name: c.name, numLogos: c.brandLogos ? c.brandLogos.length : 0 }));
console.log(cats);
