const fs = require('fs');
const path = require('path');

const filePath = path.resolve('c:/office/store-new/grand-store/backend/controllers/productController.js');
let code = fs.readFileSync(filePath, 'utf8');

// In createProduct
code = code.replace(
  "if (req.user.role !== 'vendor_active' && req.user.role !== 'admin') {",
  "if (!['vendor_active', 'admin', 'super_admin', 'product_manager'].includes(req.user.role)) {"
);
code = code.replace(
  "vendorId: req.user.role === 'admin' ? null : req.user._id,",
  "vendorId: ['admin', 'super_admin', 'product_manager'].includes(req.user.role) ? null : req.user._id,"
);

// In updateProduct
code = code.replace(
  "if (req.user.role !== 'admin' && product.vendorId?.toString() !== req.user._id.toString()) {",
  "if (!['admin', 'super_admin', 'product_manager'].includes(req.user.role) && product.vendorId?.toString() !== req.user._id.toString()) {"
);

// In deleteProduct
code = code.replace(
  "if (req.user.role !== 'admin' && product.vendorId?.toString() !== req.user._id.toString()) {",
  "if (!['admin', 'super_admin', 'product_manager'].includes(req.user.role) && product.vendorId?.toString() !== req.user._id.toString()) {"
);

fs.writeFileSync(filePath, code);
console.log('Fixed productController.js for product_manager');
