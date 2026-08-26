require('dotenv').config();
const { generateOrderReceiptBuffer } = require('./utils/pdfService');

const mockOrder = {
  _id: '1234567890',
  invoiceNumber: 'INV-123',
  totalPrice: 1000,
  taxPrice: 150,
  shippingPrice: 50,
  createdAt: new Date(),
  items: [
    { name: 'Test Product', quantity: 1, price: 1000 }
  ],
  shippingAddress: {
    address: '123 Test St',
    city: 'Test City',
    postalCode: '1234',
    country: 'South Africa'
  }
};
const mockUser = {
  name: 'Test User',
  email: 'test@example.com'
};

generateOrderReceiptBuffer(mockOrder, mockUser).then(buffer => {
  console.log('Successfully generated PDF of size', buffer.length);
}).catch(console.error);
