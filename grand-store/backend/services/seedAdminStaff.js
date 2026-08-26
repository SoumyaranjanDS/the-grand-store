const bcrypt = require('bcryptjs');
const User = require('../models/User');

const STAFF_ACCOUNTS = [
  {
    staffKey: 'accountant',
    role: 'accountant',
    name: process.env.ACCOUNTANT_NAME || 'Grand Store Accountant',
    email: process.env.ACCOUNTANT_EMAIL || 'accountant@grandstore.com',
    password: process.env.ACCOUNTANT_PASSWORD || 'Accountant@GrandStore2026!',
  },
  {
    staffKey: 'product_manager',
    role: 'product_manager',
    name: process.env.PRODUCT_MANAGER_NAME || 'Grand Store Product Manager',
    email: process.env.PRODUCT_MANAGER_EMAIL || 'productmanager@grandstore.com',
    password: process.env.PRODUCT_MANAGER_PASSWORD || 'Products@GrandStore2026!',
  },
];

async function seedAdminStaff() {
  for (const definition of STAFF_ACCOUNTS) {
    const normalizedEmail = definition.email.trim().toLowerCase();
    let user = await User.findOne({ staffKey: definition.staffKey });

    if (!user) {
      user = await User.findOne({
        $or: [
          { role: definition.role },
          { email: normalizedEmail },
        ],
      });
    }

    if (!user) {
      const password = await bcrypt.hash(definition.password, 12);
      await User.create({
        name: definition.name,
        email: normalizedEmail,
        password,
        role: definition.role,
        staffKey: definition.staffKey,
        mustChangePassword: true,
      });
      console.log(`Seeded ${definition.role} staff account: ${normalizedEmail}`);
      continue;
    }

    let changed = false;
    if (user.role !== definition.role) {
      user.role = definition.role;
      changed = true;
    }
    if (user.staffKey !== definition.staffKey) {
      user.staffKey = definition.staffKey;
      changed = true;
    }
    if (!user.password) {
      user.password = await bcrypt.hash(definition.password, 12);
      user.mustChangePassword = true;
      changed = true;
    }

    if (changed) {
      await user.save();
    }
  }
}

module.exports = seedAdminStaff;
