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
      
      // 1. Remove font-script tailwind class
      content = content.replace(/\bfont-script\b/g, '');
      // Clean up multiple spaces that might result from removal
      content = content.replace(/className="([^"]+)"/g, (match, classes) => {
        const cleaned = classes.replace(/\s+/g, ' ').trim();
        return cleaned ? `className="${cleaned}"` : '';
      });

      // 2. Remove style={{ fontFamily: "'Dancing Script', cursive" }}
      // Note: regex can be tricky with exact spacing, we'll try to match the common pattern
      content = content.replace(/style=\{\{\s*fontFamily:\s*['"](?:Dancing Script|['"]Dancing Script['"])['"],\s*cursive['"]\s*\}\}/g, '');
      content = content.replace(/style=\{\{\s*fontFamily:\s*"'Dancing Script', cursive"\s*\}\}/g, '');
      
      // Some components might have: const scriptFont = { fontFamily: "'Dancing Script', cursive" }; and style={scriptFont}
      content = content.replace(/const scriptFont = \{ fontFamily: "'Dancing Script', cursive" \};\s*/g, '');
      content = content.replace(/style=\{scriptFont\}/g, '');

      // Clean up empty lines that might have been left over
      content = content.replace(/className=""/g, '');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done removing script fonts.');
