const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: './.env' });

const eraseRecord = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const email = 'dfnokh@gmail.com';
    const user = await User.findOne({ email });

    if (user) {
      console.log(`Found user ${email} with ID ${user._id}. Deleting...`);
      await User.deleteOne({ _id: user._id });
      
      const deletedVendor = await Vendor.deleteMany({ userId: user._id });
      console.log(`Deleted ${deletedVendor.deletedCount} associated vendor records.`);
      
      console.log('User and related vendor records completely erased.');
    } else {
      console.log(`User ${email} not found.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

eraseRecord();
