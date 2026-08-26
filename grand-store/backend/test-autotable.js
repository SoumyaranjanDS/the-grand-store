const autoTable = require('jspdf-autotable');
console.log(typeof autoTable);
console.log(Object.keys(autoTable));
if (typeof autoTable !== 'function' && autoTable.default) {
  console.log('default is type:', typeof autoTable.default);
}
