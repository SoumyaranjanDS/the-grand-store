const mongoose = require('mongoose');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://localhost:27017/grandstore')
  .then(async () => {
    console.log('Connected to DB');
    
    const eventId = '6a854852cb4a2139af093498';
    const vendorId = '6a82d851cc54cc42c87abf81';
    
    // Upsert Event
    const event = await Event.findByIdAndUpdate(eventId, {
      _id: eventId,
      title: 'Grand Macallan Masterclass',
      type: 'Whisky Experience',
      format: 'Physical',
      date: new Date('2026-10-15'),
      startTime: '18:00',
      endTime: '21:00',
      location: 'The Grand Cellar',
      city: 'Cape Town',
      description: 'An exclusive journey through Macallan.',
      hostName: 'James Macallan',
      capacity: 50,
      vendorId: vendorId,
      approvalStatus: 'approved',
      ticketTiers: [
        {
          name: 'VIP',
          price: 1500,
          quantity: 50,
          sold: 2,
          benefits: ['Front row', 'Extra tasting']
        }
      ]
    }, { upsert: true, new: true });
    
    // Clear old bookings for this event just in case
    await Booking.deleteMany({ event: eventId });
    
    // Create bookings
    await Booking.create([
      {
        user: '6a82b65b02f90b75bff8b311', // Test User
        event: eventId,
        vendor: vendorId,
        ticketType: 'VIP',
        quantity: 1,
        totalPrice: 1500,
        ticketId: 'TKT-TESTUSER-0001',
        ticketStatus: 'Valid'
      },
      {
        user: '6a82d851cc54cc42c87abf82', // Customer User
        event: eventId,
        vendor: vendorId,
        ticketType: 'VIP',
        quantity: 1,
        totalPrice: 1500,
        ticketId: 'TKT-CUSTUSER-0002',
        ticketStatus: 'Used'
      }
    ]);
    
    console.log('Seeded event and bookings successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
