const REPORT_GOLD = 'C9A35B';
const REPORT_DARK = '17130D';
const REPORT_LIGHT = 'F5F1E8';
const REPORT_MUTED = '7C7468';
const CURRENCY_FORMAT = '"R" #,##0.00;[Red]("R" #,##0.00);-';

const numberValue = (value) => Number(value || 0);
const dateValue = (value) => (value ? new Date(value) : null);
const vendorPayout = (order) => (order.vendorPayables || [])
  .reduce((sum, payable) => sum + numberValue(payable.netPayable), 0);
const shippingCost = (order) => numberValue(order.shippingCost);
const actualShippingCost = (order) => (order.shipments || [])
  .reduce((sum, shipment) => sum + numberValue(shipment.actualShippingCost), 0);

function styleDataSheet(worksheet, title, headers, rows, currencyColumns = []) {
  const lastColumn = String.fromCharCode(64 + headers.length);
  worksheet.mergeCells(`A1:${lastColumn}1`);
  worksheet.getCell('A1').value = title;
  worksheet.getCell('A1').font = { name: 'Aptos Display', size: 18, bold: true, color: { argb: REPORT_LIGHT } };
  worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REPORT_DARK } };
  worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells(`A2:${lastColumn}2`);
  worksheet.getCell('A2').value = `Generated ${new Date().toLocaleString('en-ZA')} · The Grand Store accountant export`;
  worksheet.getCell('A2').font = { name: 'Aptos', size: 9, color: { argb: REPORT_MUTED } };
  worksheet.getRow(2).height = 20;

  worksheet.addRow([]);
  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REPORT_GOLD } };
    cell.alignment = { vertical: 'middle' };
  });

  rows.forEach((row) => worksheet.addRow(row));
  worksheet.autoFilter = { from: 'A4', to: `${lastColumn}4` };
  worksheet.views = [{ state: 'frozen', ySplit: 4 }];
  worksheet.showGridLines = false;

  for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.height = 21;
    row.eachCell((cell, columnNumber) => {
      cell.font = { name: 'Aptos', size: 9, color: { argb: '29251F' } };
      cell.alignment = { vertical: 'middle' };
      cell.border = { bottom: { style: 'hair', color: { argb: 'E5DED2' } } };
      if (rowNumber % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FAF8F4' } };
      }
      if (currencyColumns.includes(columnNumber)) {
        cell.numFmt = CURRENCY_FORMAT;
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
    });
  }

  worksheet.columns.forEach((column, index) => {
    const headerLength = String(headers[index] || '').length;
    let maxLength = headerLength;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value instanceof Date ? 12 : String(cell.value ?? '').length;
      maxLength = Math.max(maxLength, value);
    });
    column.width = Math.min(Math.max(maxLength + 2, 12), 34);
  });
}

export async function buildAccountingWorkbook(data) {
  const ExcelModule = await import('exceljs/dist/exceljs.min.js');
  const ExcelJS = ExcelModule.default || ExcelModule;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'The Grand Store';
  workbook.company = 'The Grand Store';
  workbook.subject = 'Accountant financial and transaction report';
  workbook.created = new Date();
  workbook.modified = new Date();

  const {
    metrics = {},
    transactions = [],
    shopOrders = [],
    auctionOrders = [],
    eventBookings = [],
    vendorPayments = [],
  } = data;

  const summary = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  summary.mergeCells('A1:D1');
  summary.getCell('A1').value = 'THE GRAND STORE · FINANCIAL REPORT';
  summary.getCell('A1').font = { name: 'Aptos Display', size: 20, bold: true, color: { argb: REPORT_LIGHT } };
  summary.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REPORT_DARK } };
  summary.getCell('A1').alignment = { vertical: 'middle' };
  summary.getRow(1).height = 36;
  summary.mergeCells('A2:D2');
  summary.getCell('A2').value = `Snapshot generated ${new Date().toLocaleString('en-ZA')}`;
  summary.getCell('A2').font = { name: 'Aptos', size: 10, color: { argb: REPORT_MUTED } };
  summary.addRow([]);
  summary.addRow(['Metric', 'Amount / Count', 'Definition', 'Source']);
  const summaryRows = [
    ['Total processed sales', numberValue(metrics.totalProcessed), 'Cleared customer payments', 'Transaction ledger'],
    ['Platform commission', numberValue(metrics.totalPlatformRevenue), 'Cleared Grand Store commissions', 'Transaction ledger'],
    ['VAT collected', numberValue(metrics.totalVatCollected), 'Cleared VAT entries', 'Transaction ledger'],
    ['Pending vendor payables', numberValue(metrics.totalPendingPayables), 'Pending payout entries', 'Transaction ledger'],
    ['Retail orders exported', shopOrders.length, 'Retail purchase records in this workbook', 'Retail Orders'],
    ['Auction orders exported', auctionOrders.length, 'Auction payment records in this workbook', 'Auction Orders'],
    ['Event bookings exported', eventBookings.length, 'Event booking records in this workbook', 'Event Bookings'],
    ['Transactions exported', transactions.length, 'Ledger entries in this workbook', 'Transactions'],
  ];
  summaryRows.forEach((row) => summary.addRow(row));
  const summaryHeader = summary.getRow(4);
  summaryHeader.eachCell((cell) => {
    cell.font = { name: 'Aptos', size: 10, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REPORT_GOLD } };
  });
  for (let rowNumber = 5; rowNumber <= 8; rowNumber += 1) summary.getCell(`B${rowNumber}`).numFmt = CURRENCY_FORMAT;
  summary.columns = [{ width: 28 }, { width: 20 }, { width: 37 }, { width: 22 }];
  summary.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];

  const retailSheet = workbook.addWorksheet('Retail Orders');
  styleDataSheet(retailSheet, 'Retail Order Detail', [
    'Order Ref', 'Invoice', 'Date', 'Customer', 'Customer Email', 'Payment Method', 'Payment Status',
    'Products', 'Shipping Charged', 'Actual Shipping', 'Shipping Margin', 'VAT', 'Duties', 'Taxes',
    'Customs Fees', 'Gateway Fee', 'Total Paid', 'Commission', 'Vendor Payout', 'Delivery Status',
  ], shopOrders.map((order) => {
    const charged = shippingCost(order);
    const actual = actualShippingCost(order);
    return [
      order.orderId || order.transactionId || order._id,
      order.invoiceNumber || '',
      dateValue(order.createdAt),
      order.user?.name || '',
      order.user?.email || '',
      order.paymentMethod || '',
      order.paymentStatus || '',
      numberValue(order.subTotal),
      charged,
      actual,
      charged - actual,
      numberValue(order.vatAmount),
      numberValue(order.importDuties),
      numberValue(order.importTaxes),
      numberValue(order.customsFees),
      numberValue(order.gatewayFeeAmount),
      numberValue(order.totalPrice),
      numberValue(order.commissionAmount),
      vendorPayout(order),
      order.isDelivered ? 'Delivered' : 'Open',
    ];
  }), [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);

  const auctionSheet = workbook.addWorksheet('Auction Orders');
  styleDataSheet(auctionSheet, 'Auction Order Detail', [
    'Order Ref', 'Date', 'Buyer', 'Buyer Email', 'Payment Status', 'Hammer Price', 'VAT',
    'Buyer Paid', 'Commission', 'Vendor Payout',
  ], auctionOrders.map((order) => [
    order.transactionId || order.orderId || order._id,
    dateValue(order.createdAt),
    order.user?.name || '',
    order.user?.email || '',
    order.paymentStatus || '',
    numberValue(order.subTotal),
    numberValue(order.vatAmount),
    numberValue(order.totalPrice),
    numberValue(order.commissionAmount),
    vendorPayout(order),
  ]), [6, 7, 8, 9, 10]);

  const eventsSheet = workbook.addWorksheet('Event Bookings');
  styleDataSheet(eventsSheet, 'Event Booking Detail', [
    'Booking Ref', 'Date', 'Customer', 'Customer Email', 'Payment Status', 'Subtotal', 'VAT',
    'Customer Paid', 'Commission', 'Organizer Payout',
  ], eventBookings.map((booking) => [
    booking.gsReference || booking.ticketId || booking._id,
    dateValue(booking.bookingDate || booking.createdAt),
    booking.user?.name || '',
    booking.user?.email || '',
    booking.paymentStatus || '',
    numberValue(booking.subTotal),
    numberValue(booking.vatAmount),
    numberValue(booking.totalPrice),
    numberValue(booking.commissionAmount),
    numberValue(booking.organizerPayable),
  ]), [6, 7, 8, 9, 10]);

  const vendorSheet = workbook.addWorksheet('Vendor Payments');
  styleDataSheet(vendorSheet, 'Vendor Registration Payments', [
    'Reference', 'Date', 'Vendor', 'Vendor Email', 'Amount', 'Gateway', 'Status', 'Description',
  ], vendorPayments.map((transaction) => [
    transaction.gsReference || transaction.reference || transaction._id,
    dateValue(transaction.createdAt || transaction.date),
    transaction.user?.name || transaction.customer?.name || '',
    transaction.user?.email || transaction.customer?.email || '',
    numberValue(transaction.amount),
    transaction.gateway || '',
    transaction.status || '',
    transaction.description || '',
  ]), [5]);

  const transactionSheet = workbook.addWorksheet('Transactions');
  styleDataSheet(transactionSheet, 'Master Transaction Ledger', [
    'GS Reference', 'Date', 'Type', 'Module', 'Status', 'Currency', 'Gross Amount', 'Net Amount',
    'Gateway', 'Gateway Transaction', 'Description',
  ], transactions.map((transaction) => [
    transaction.gsReference || transaction.reference || transaction._id,
    dateValue(transaction.createdAt),
    transaction.type || '',
    transaction.module || '',
    transaction.status || '',
    transaction.currency || 'ZAR',
    numberValue(transaction.amount),
    numberValue(transaction.netAmount),
    transaction.gateway || '',
    transaction.gatewayTransactionId || '',
    transaction.description || '',
  ]), [7, 8]);

  [retailSheet, auctionSheet, eventsSheet, vendorSheet, transactionSheet].forEach((worksheet) => {
    worksheet.getColumn(3).numFmt = 'yyyy-mm-dd';
  });
  retailSheet.getColumn(3).numFmt = 'yyyy-mm-dd';
  auctionSheet.getColumn(2).numFmt = 'yyyy-mm-dd';
  eventsSheet.getColumn(2).numFmt = 'yyyy-mm-dd';
  vendorSheet.getColumn(2).numFmt = 'yyyy-mm-dd';
  transactionSheet.getColumn(2).numFmt = 'yyyy-mm-dd';

  return workbook;
}

export async function downloadAccountingWorkbook(data) {
  const workbook = await buildAccountingWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `grand-store-accounting-${stamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
