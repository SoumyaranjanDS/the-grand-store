const fs = require('fs');
const path = require('path');

const dir = 'c:\\office\\store-new\\TheGrandStore\\source\\components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    if (content.includes('grandstore.co.za/api')) {
        // Add import if not present and if there are actual replacements
        if (!content.includes('API_BASE')) {
            // Find the last import statement
            const importRegex = /import .* from ['"][^'"]+['"];?/g;
            let lastImportMatch;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                lastImportMatch = match;
            }
            
            if (lastImportMatch) {
                const insertPos = lastImportMatch.index + lastImportMatch[0].length;
                content = content.slice(0, insertPos) + '\nimport { API_BASE } from "../resources/data/Constants";' + content.slice(insertPos);
            } else {
                content = 'import { API_BASE } from "../resources/data/Constants";\n' + content;
            }
        }
        
        // Replace "http://grandstore.co.za/api/..." and "https://..." with `${API_BASE}/...`
        content = content.replace(/["']https?:\/\/grandstore\.co\.za\/api([^"']*)["']/g, '`${API_BASE}$1`');
        modified = true;
    }
    
    // Also fix the login/logout in Home.js and LoginScreen.js where they might use fetch directly with a string literal
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
