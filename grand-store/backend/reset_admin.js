const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = "mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function setAdminPassword() {
  await mongoose.connect(MONGO_URI);
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  await User.findOneAndUpdate(
    { email: 'admin@grandstore.com' },
    { password: passwordHash, role: 'admin', isEmailVerified: true },
    { upsert: true }
  );
  console.log("Password reset for admin@grandstore.com to Admin123!");
  mongoose.disconnect();
}

setAdminPassword();
