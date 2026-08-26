require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  const { processOrderPayment } = require('./controllers/orderController');
  
  const orderId = '6a8e8d2d88e9e9f54e121aa6'; // The recent unpaid order
  console.log(`Processing payment for order ${orderId}...`);
  try {
    await processOrderPayment(orderId);
    console.log('Payment processed and email sent successfully!');
  } catch (e) {
    console.error('Failed to process payment:', e);
  }
  
  await mongoose.disconnect();
}

main();
