const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority";

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function verifyVendorEmail() {
  await mongoose.connect(MONGO_URI);
  const User = require('./models/User');
  
  const user = await User.findOneAndUpdate(
    { email: 'vendor@grandstore.com' },
    { isEmailVerified: true },
    { new: true }
  );

  if (user) {
    console.log(`Successfully verified email for ${user.email}`);
  } else {
    console.log(`User vendor@grandstore.com not found.`);
  }

  mongoose.disconnect();
}

verifyVendorEmail();
