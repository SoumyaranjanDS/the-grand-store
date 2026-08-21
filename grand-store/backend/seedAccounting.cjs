require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const SystemCode = require('./models/SystemCode');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/";

const seedSystemCodes = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding SystemCodes...');

    const codes = [
      { module: 'Shop / Marketplace', code: 'SHP', description: 'Normal product sales' },
      { module: 'Auction', code: 'AUC', description: 'Auction bids and payments' },
      { module: 'Events', code: 'EVT', description: 'Event bookings' },
      { module: 'Vendor', code: 'VND', description: 'Vendor registrations and subscriptions' },
      { module: 'Global / International', code: 'GLO', description: 'International wine purchases' },
      { module: 'Wine Estate', code: 'EST', description: 'Wine estate experiences' },
      { module: 'Trade', code: 'TRD', description: 'Wholesale and trade' },
      { module: 'Shipping', code: 'SHP_DEL', description: 'Shipping operations' },
      { module: 'Refund', code: 'RFD', description: 'Refunds' },
      { module: 'Commission', code: 'COM', description: 'Vendor commissions' }
    ];

    for (const item of codes) {
      await SystemCode.findOneAndUpdate(
        { code: item.code },
        item,
        { upsert: true, new: true }
      );
    }
    
    console.log('System codes successfully seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding system codes:', error);
    process.exit(1);
  }
};

seedSystemCodes();
