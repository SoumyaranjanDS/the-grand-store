const fs = require('fs');
const file = 'grand-store/frontend/src/components/Header.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// The error is around line 403 (index 402).
// Let's find the second set of extra tags:
// </AnimatePresence>
//    </motion.div>
//  )}
// </AnimatePresence>
// </div>
let index = -1;
for (let i = 350; i < lines.length; i++) {
  if (lines[i].includes('</motion.div>') && lines[i+1].includes(')}')) {
     if (lines[i-1].includes('</AnimatePresence>') && lines[i+2].includes('</AnimatePresence>')) {
        index = i;
        break;
     }
  }
}

if (index !== -1) {
  lines.splice(index, 3);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log("Lines removed at index " + index);
} else {
  console.log("Could not find lines to remove!");
}
