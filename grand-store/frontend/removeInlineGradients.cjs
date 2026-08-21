const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // text gradients
      content = content.replace(/bg-gradient-to-r\s+from-\[[^\]]+\]\s+(?:via-\[[^\]]+\]\s+)?to-\[[^\]]+\]\s+(?:bg-clip-text\s+text-transparent|text-transparent\s+bg-clip-text)/g, 'text-[#c9a35b]');
      
      // bg gradients (not text)
      // Look for bg-gradient-to-r followed by gold-like colors, NOT text-transparent
      // We will just replace specific known gold gradients to be safe
      const goldBgPatterns = [
        /bg-gradient-to-r\s+from-\[#b58b38\]\s+via-\[#e6c97a\]\s+to-\[#b58b38\]/g,
        /bg-gradient-to-r\s+from-\[#c9a35b\]\s+to-\[#e1bd70\]/g,
        /bg-gradient-to-r\s+from-\[#c9a84c\]\s+via-\[#f0d080\]\s+to-\[#b8860b\]/g
      ];

      for (const pattern of goldBgPatterns) {
        content = content.replace(pattern, 'bg-[#c9a35b]');
      }

      // Cleanup duplicate classes if they exist after replacement
      content = content.replace(/\btext-\[#c9a35b\]\s+text-\[#c9a35b\]\b/g, 'text-[#c9a35b]');
      content = content.replace(/\bbg-\[#c9a35b\]\s+bg-\[#c9a35b\]\b/g, 'bg-[#c9a35b]');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated inline gradients: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done removing inline golden gradients.');
