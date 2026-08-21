const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace R{...} and R {...}
  // We want to capture the content inside the curly braces
  // E.g., R{product.price} -> <Price amount={product.price} />
  const regex1 = /R\s*\{([^}]+)\}/g;
  
  if (regex1.test(content)) {
    content = content.replace(regex1, '<Price amount={$1} />');
  }

  // Replace static amounts like R500 or R2,500 or R 500
  // Note: Only if not already inside an attribute or string. 
  // Let's do a simple regex for >R\s*([0-9,]+)< and >R\s*([0-9,]+) 
  // e.g. >R2,500< -> ><Price amount={2500} /><
  const regex2 = />\s*R\s*([0-9,]+(?:\.[0-9]+)?)\s*</g;
  if (regex2.test(content)) {
    content = content.replace(regex2, (match, amount) => {
      const num = parseFloat(amount.replace(/,/g, ''));
      return `><Price amount={${num}} /><`;
    });
  }

  // Same for just R500 without tags, but only if preceded by space or quote or tag
  const regex3 = /([>'"\s])R\s*([0-9,]+(?:\.[0-9]+)?)([<'"\s])/g;
  if (regex3.test(content)) {
    content = content.replace(regex3, (match, pre, amount, post) => {
      // Don't replace if it's part of a URL or something
      if (pre === '"' || pre === "'") return match;
      const num = parseFloat(amount.replace(/,/g, ''));
      return `${pre}<Price amount={${num}} />${post}`;
    });
  }

  if (content !== originalContent) {
    // Add import if not present
    if (!content.includes('import Price')) {
      // Find the last import statement
      const importRegex = /import\s+.*?;?\n/g;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      
      // Calculate relative path to components/ui/Price
      const fileDir = path.dirname(file);
      const pricePath = path.join(srcDir, 'components', 'ui', 'Price');
      let relativePath = path.relative(fileDir, pricePath).replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      
      const importStatement = `import Price from '${relativePath}';\n`;
      content = content.slice(0, lastIndex) + importStatement + content.slice(lastIndex);
    }
    
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${changedFiles} files.`);
