const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({ role: { $in: ['vendor_active', 'vendor_pending', 'vendor_approved_unpaid'] } });
  console.log('Users:', users.map(u => ({ id: u._id, name: u.name, role: u.role })));

  const vendors = await Vendor.find();
  console.log('Vendors:', vendors.map(v => ({ _id: v._id, userId: v.userId, businessName: v.businessInfo?.legalName })));
  
  const idToCheck = '6a83fa7e3b2661aa93c5132f';
  console.log('ID in question:', idToCheck);
  
  process.exit(0);
});
