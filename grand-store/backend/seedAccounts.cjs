const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Vendor = require('./models/Vendor');

// Must match User.js schema locally
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor_pending', 'vendor_active', 'admin'], default: 'customer' },
});

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    // Connect to actual database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected to', process.env.MONGO_URI.split('@')[1] || process.env.MONGO_URI);

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      { name: 'Admin User', email: 'admin@grandstore.com', password: passwordHash, role: 'admin' },
      { name: 'Vendor User', email: 'vendor@grandstore.com', password: passwordHash, role: 'vendor_active' },
      { name: 'Customer User', email: 'customer@grandstore.com', password: passwordHash, role: 'customer' }
    ];

    let vendorUserId = null;

    for (let u of users) {
      const existing = await User.findOne({ email: u.email });
      let savedUser;
      if (!existing) {
        savedUser = await User.create(u);
        console.log(`Created ${u.role}: ${u.email}`);
      } else {
        existing.role = u.role;
        existing.password = passwordHash;
        savedUser = await existing.save();
        console.log(`Updated ${u.role}: ${u.email}`);
      }
      
      if (u.email === 'vendor@grandstore.com') {
        vendorUserId = savedUser._id;
      }
    }

    if (vendorUserId) {
      const vendorData = {
        userId: vendorUserId,
        onboardingStep: 10,
        status: 'approved',
        businessInfo: {
          legalName: 'Grand Vendor Ltd',
          tradingName: 'Grand Vendor',
          registrationNumber: 'REG123456',
          businessType: 'Private Company',
          address: '123 Vendor Street, Cape Town',
        },
        taxInfo: {
          taxNumber: 'TAX09876',
          vatNumber: 'VAT123456'
        },
        productCategories: ['Whisky', 'Wine'],
      };

      const existingVendor = await Vendor.findOne({ userId: vendorUserId });
      if (!existingVendor) {
        await Vendor.create(vendorData);
        console.log('Created Vendor profile for vendor@grandstore.com');
      } else {
        await Vendor.updateOne({ userId: vendorUserId }, vendorData);
        console.log('Updated Vendor profile for vendor@grandstore.com');
      }
    }

    console.log('Test accounts and data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
