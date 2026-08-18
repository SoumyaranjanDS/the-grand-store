const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getContextPath(filePath) {
    const depth = filePath.replace(srcDir, '').split(path.sep).length - 2;
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    return prefix + 'context/ProductContext';
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove products from data.js import
    if (content.match(/import\s+\{.*?\bproducts\b.*?\}\s+from\s+['"].*?data['"]/)) {
        content = content.replace(/(import\s+\{)(.*?)(\bproducts\b\s*,?\s*)(.*?)(\}\s+from\s+['"].*?data['"])/g, (match, p1, p2, p3, p4, p5) => {
            const newImport = p2 + p4;
            if (newImport.trim() === '') return ''; // Removed only import
            if (newImport.trim().endsWith(',')) return p1 + newImport.slice(0, -1).trim() + ' ' + p5;
            return p1 + newImport + p5;
        });

        // Add ProductContext import
        const contextImportPath = getContextPath(filePath).replace(/\\/g, '/');
        content = `import { useProducts } from '${contextImportPath}'\n` + content;

        // Add const { products } = useProducts() inside the component
        // Finding the component function is tricky. We'll look for `function ComponentName` or `const ComponentName = (`
        content = content.replace(/(export\s+default\s+function\s+\w+\s*\(.*?\)\s*\{|function\s+\w+\s*\(.*?\)\s*\{|const\s+\w+\s*=\s*\(.*?\)\s*=>\s*\{)/g, (match) => {
            return match + '\n  const { products } = useProducts();\n';
        });

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Refactored:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
