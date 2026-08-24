const fs = require('fs');
const file = 'grand-store/frontend/src/components/Header.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// The lines causing the error are at index 329, 330, 331 (which is lines 330, 331, 332 in the 1-indexed file)
// Let's just remove them.
lines.splice(329, 3);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log("Lines removed!");
