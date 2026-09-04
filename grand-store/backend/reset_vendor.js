const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority";

async function setVendorPassword() {
  await mongoose.connect(MONGO_URI);
  const User = require('./models/User');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Vendor123!", salt);

  const user = await User.findOneAndUpdate(
    { email: 'vendor@grandstore.com' },
    { password: passwordHash, role: 'vendor_active', isEmailVerified: true },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`Password reset for ${user.email} to Vendor123!`);
  await mongoose.disconnect();
}

setVendorPassword();
