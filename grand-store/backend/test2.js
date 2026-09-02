const fs = require('fs');
let raw = fs.readFileSync('categories_ipv4.json');
let text = raw.toString('utf16le');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const data = JSON.parse(text);
const cats = data.data || data;
const names = cats.map(c => c.name);
console.log(names);
