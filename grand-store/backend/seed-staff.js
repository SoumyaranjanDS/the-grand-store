const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = "mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  kycVerified: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const passwordHash = await bcrypt.hash("Password123!", 12);

    const accountant = await User.findOneAndUpdate(
      { email: "accountant@grandstore.com" },
      {
        name: "Admin Accountant",
        password: passwordHash,
        role: "accountant",
        mustChangePassword: false,
        kycVerified: true
      },
      { upsert: true, new: true }
    );
    console.log("Accountant created:", accountant.email);

    const productManager = await User.findOneAndUpdate(
      { email: "pm@grandstore.com" },
      {
        name: "Admin Product Manager",
        password: passwordHash,
        role: "product_manager",
        mustChangePassword: false,
        kycVerified: true
      },
      { upsert: true, new: true }
    );
    console.log("Product Manager created:", productManager.email);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

seed();
