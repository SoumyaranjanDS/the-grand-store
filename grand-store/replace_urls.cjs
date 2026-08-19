const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
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

const files = walk('frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace single-quoted strings
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
  // Replace double-quoted strings
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
  // Replace backticked strings
  content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');
  // Replace direct URL in src attributes like src={`http://localhost:5000${product.image}`}
  // Wait, if it's already inside a template literal and not at the start, e.g., `http://localhost:5000${event.image}`
  // The above regex /`http:\/\/localhost:5000([^`]*)`/g handles it correctly by capturing the rest inside the backticks.

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done!');
