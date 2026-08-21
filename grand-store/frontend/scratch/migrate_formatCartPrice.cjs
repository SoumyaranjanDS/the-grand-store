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
  
  // E.g., {formatCartPrice(cartTotal)} -> <Price amount={cartTotal} />
  // Note: we can match formatCartPrice(...)
  const regex = /\{?formatCartPrice\(([^)]+)\)\}?/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, (match, amount) => {
      // Return the JSX instead of the function call
      return `<Price amount={${amount}} />`;
    });
  }

  // Also replace inline formatCartPrice(val) without braces (e.g. inside string interpolation)
  const regex2 = /formatCartPrice\(([^)]+)\)/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, `<Price amount={$1} />`);
  }

  if (content !== originalContent) {
    // Add import if not present
    if (!content.includes('import Price')) {
      const importRegex = /import\s+.*?;?\n/g;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      
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
