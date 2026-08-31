require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');

const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ referralCode: { $exists: false } });
    console.log(`Found ${users.length} users without a referral code.`);

    for (let user of users) {
      let code;
      let isUnique = false;
      while (!isUnique) {
        code = generateReferralCode();
        const existing = await User.findOne({ referralCode: code });
        if (!existing) {
          isUnique = true;
        }
      }
      user.referralCode = code;
      await user.save();
      console.log(`Generated code ${code} for user ${user.email}`);
    }

    console.log('Finished generating referral codes.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
