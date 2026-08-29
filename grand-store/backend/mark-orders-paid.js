require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function markPaid() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Order.updateMany(
    { paymentStatus: { $in: ['Pending', 'Awaiting_Approval'] } },
    { $set: { paymentStatus: 'Paid', isPaid: true, paidAt: new Date(), status: 'Processing' } }
  );
  console.log(`Updated ${result.modifiedCount} orders to Paid.`);
  process.exit(0);
}

markPaid();
