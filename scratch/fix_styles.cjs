const fs = require('fs');
const file = 'grand-store/frontend/src/styles.css';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/[^\x00-\x7F]/g, ''); // Remove non-ascii
// Remove trailing null bytes or empty spaces that cause syntax error
content = content.replace(/\s+$/, '');
fs.writeFileSync(file, content, 'utf8');
