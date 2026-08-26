const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/office/store-new/grand-store/frontend/src/features/admin/AdminProducts.jsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  "if (!user || user.role !== 'admin') {",
  "if (!user || !['admin', 'super_admin', 'product_manager'].includes(user.role)) {"
);

fs.writeFileSync(filePath, code);
console.log('Fixed AdminProducts.jsx');
