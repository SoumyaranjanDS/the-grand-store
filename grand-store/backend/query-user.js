require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    const standardUri = 'mongodb://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@ac-ysvl7nq-shard-00-00.8snrppp.mongodb.net:27017,ac-ysvl7nq-shard-00-01.8snrppp.mongodb.net:27017,ac-ysvl7nq-shard-00-02.8snrppp.mongodb.net:27017/?ssl=true&replicaSet=atlas-ysvl7nq-shard-0&authSource=admin';
    await mongoose.connect(standardUri);
    const user = await User.findOne({ name: /df nokh/i });
    if (user) {
      console.log(`User found: ${user.name}, Role: ${user.role}, ID: ${user._id}`);
      // Change his role to customer
      user.role = 'customer';
      await user.save();
      console.log('User role updated to customer.');
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
})();
