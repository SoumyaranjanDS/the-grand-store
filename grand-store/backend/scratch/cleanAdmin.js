const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = path.resolve('c:/office/store-new/grand-store/backend/controllers/adminController.js');

// Reset to git pristine
execSync('git checkout -- ' + filePath, { cwd: 'c:/office/store-new/grand-store/backend' });

let code = fs.readFileSync(filePath, 'utf8');

// Insert bcrypt and STAFF_ROLES
code = code.replace(
  'const Booking = require("../models/Booking");',
  'const Booking = require("../models/Booking");\nconst bcrypt = require("bcryptjs");\n\nconst STAFF_ROLES = ["accountant", "product_manager"];'
);

// Update getDashboardStats
code = code.replace(
  '{ role: { $ne: "admin" } }',
  '{ role: { $nin: ["admin", "super_admin", ...STAFF_ROLES] } }'
);

// Update getAllUsers
code = code.replace(
  '{ role: { $ne: "admin" } }',
  '{ role: { $nin: ["admin", "super_admin", ...STAFF_ROLES] } }'
);

const staffMethods = `
// @desc    Get seeded admin staff accounts
// @route   GET /api/admin/staff
// @access  Private/Super Admin
const getStaffAccounts = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: STAFF_ROLES } })
      .select("name email role staffKey mustChangePassword updatedAt")
      .sort({ role: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a seeded staff member's login credentials
// @route   PUT /api/admin/staff/:id
// @access  Private/Super Admin
const updateStaffCredentials = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff || !STAFF_ROLES.includes(staff.role)) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (password && password.length < 10) {
      return res.status(400).json({ message: "New passwords must be at least 10 characters" });
    }

    const duplicate = await User.findOne({ email, _id: { $ne: staff._id } });
    if (duplicate) {
      return res.status(409).json({ message: "That email address is already in use" });
    }

    staff.name = name;
    staff.email = email;
    if (password) {
      staff.password = await bcrypt.hash(password, 12);
      staff.mustChangePassword = false;
    }

    await staff.save();
    res.json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      staffKey: staff.staffKey,
      mustChangePassword: staff.mustChangePassword,
      updatedAt: staff.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new staff account
// @route   POST /api/admin/staff
// @access  Private/Super Admin
const createStaffAccount = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, role, and password are required" });
    }
    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }
    if (password.length < 10) {
      return res.status(400).json({ message: "Passwords must be at least 10 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "That email address is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const staffKey = role + '_' + Date.now();

    const newStaff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      staffKey,
      mustChangePassword: true
    });

    res.status(201).json({
      _id: newStaff._id,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      staffKey: newStaff.staffKey,
      mustChangePassword: newStaff.mustChangePassword,
      createdAt: newStaff.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
`;

code = code.replace(
  '// @desc    Get all vendors',
  staffMethods + '\n// @desc    Get all vendors'
);

// Replace module exports completely
const newExports = `module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllVendors,
  updateVendorStatus,
  getPendingBankTransfers,
  getStaffAccounts,
  updateStaffCredentials,
  createStaffAccount,
};`;

code = code.replace(/module\.exports = {[^}]+};/m, newExports);

fs.writeFileSync(filePath, code);
console.log('cleanAdmin executed successfully!');
