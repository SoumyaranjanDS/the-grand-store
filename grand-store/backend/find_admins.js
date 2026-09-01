const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = "mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  email: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function findAdmins() {
  await mongoose.connect(MONGO_URI);
  const admins = await User.find({ role: 'admin' });
  const superAdmins = await User.find({ role: 'super_admin' });
  console.log('Admins:', admins.map(u => u.email));
  console.log('Super Admins:', superAdmins.map(u => u.email));
  mongoose.disconnect();
}

findAdmins();
