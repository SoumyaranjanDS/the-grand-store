require('dotenv').config();
const mongoose = require('mongoose');
const { processEventPayment } = require('./controllers/eventControllerV2');
const Booking = require('./models/Booking');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const bookingId = '6a968d3b1da81bc4c2b7f115';
    
    console.log('Fetching booking...');
    const b = await Booking.findById(bookingId);
    console.log('Booking vendor:', b.vendor);
    
    console.log('Running processEventPayment...');
    const result = await processEventPayment(bookingId, {
      gatewayTransactionId: 'TEST-12345',
    });
    
    console.log('Result:', result);
  } catch (err) {
    console.error('Error running processEventPayment:', err);
  } finally {
    mongoose.disconnect();
  }
})();
