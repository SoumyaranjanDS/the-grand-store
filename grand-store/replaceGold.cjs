const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Replace text-[var(--color-gold)] and text-[#c9a35b] with text-gold-gradient
      content = content.replace(/text-\[var\(--color-gold\)\].*?(?=[ "'])/g, 'text-gold-gradient');
      content = content.replace(/text-\[#c9a35b\].*?(?=[ "'])/g, 'text-gold-gradient');
      
      // Replace bg-[var(--color-gold)] and bg-[#c9a35b] when NOT followed by / (opacity)
      // e.g. bg-[var(--color-gold)]/10 should not be replaced. 
      // We can use a regex negative lookahead for \/
      content = content.replace(/bg-\[var\(--color-gold\)\](?!\/)/g, 'bg-gold-gradient');
      content = content.replace(/bg-\[#c9a35b\](?!\/)/g, 'bg-gold-gradient');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'frontend', 'src'));
console.log('Done replacing golden colors.');
