const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Order = require("../models/Order");
const AuctionLot = require("../models/AuctionLot");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");

const STAFF_ROLES = ["accountant", "product_manager", "admin"];

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $nin: ["admin", "super_admin", ...STAFF_ROLES] } });
    const totalVendors = await Vendor.countDocuments({ status: "approved" });
    const pendingVendors = await Vendor.countDocuments({
      status: "pending_approval",
    });

    // Revenue calculations could be complex, doing a simple sum of completed orders
    const orders = await Order.find({ isPaid: true });
    const totalOrderRevenue = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0,
    );
    const totalOrderCommission = orders.reduce(
      (sum, order) => sum + (order.commissionAmount || 0),
      0,
    );

    const bookings = await Booking.find({ paymentStatus: "Paid" });
    const totalBookingRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0,
    );
    const totalBookingCommission = bookings.reduce(
      (sum, b) => sum + (b.commissionAmount || 0),
      0,
    );

    const auctions = await AuctionLot.find({
      status: "sold",
      paymentStatus: "Paid",
    });
    const totalAuctionRevenue = auctions.reduce(
      (sum, a) => sum + (a.totalPaidByBuyer || 0),
      0,
    );
    const totalAuctionCommission = auctions.reduce(
      (sum, a) => sum + (a.commissionAmount || 0),
      0,
    );

    const totalRevenue =
      totalOrderRevenue + totalBookingRevenue + totalAuctionRevenue;
    const totalCommission =
      totalOrderCommission + totalBookingCommission + totalAuctionCommission;

    res.json({
      totalUsers,
      totalVendors,
      pendingVendors,
      totalRevenue,
      totalCommission,
      breakdown: {
        shop: { revenue: totalOrderRevenue, commission: totalOrderCommission },
        events: {
          revenue: totalBookingRevenue,
          commission: totalBookingCommission,
        },
        auctions: {
          revenue: totalAuctionRevenue,
          commission: totalAuctionCommission,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $nin: ["admin", "super_admin", ...STAFF_ROLES] } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


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
    if (!/^\S+@\S+\.\S+$/.test(email)) {
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

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get one vendor application
// @route   GET /api/admin/vendors/:id
// @access  Private/Admin
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("userId", "name email role isEmailVerified createdAt")
      .lean();

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.json(vendor);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Vendor not found" });
    }
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update vendor status (Approve / Reject)
// @route   PUT /api/admin/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status, reason, registrationFee } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (!["approved", "pending_approval", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    vendor.status = status;
    if (registrationFee !== undefined) {
      vendor.registrationFee = registrationFee;
    }
    // We could store the rejection reason in the vendor model if we add a field for it
    await vendor.save();

    // Update user role based on status
    const user = await User.findById(vendor.userId);
    if (user) {
      if (status === "approved") {
        user.role = "vendor_approved_unpaid";
      } else if (status === "rejected") {
        user.role = "vendor_rejected";
      } else if (status === "suspended") {
        user.role = "customer";
      }
      await user.save();
    }

    // Send email notification
    try {
      const { sendEmail } = require('../utils/emailService');
      const { vendorApprovalTemplate, genericNotificationTemplate } = require('../utils/emailTemplates');
      
      if (user) {
        if (status === "approved") {
          await sendEmail({
            to: user.email,
            subject: 'Your Vendor Account is Approved',
            html: vendorApprovalTemplate(user.name, vendor.registrationFee)
          });
        } else if (status === "rejected") {
          await sendEmail({
            to: user.email,
            subject: 'Update on your Vendor Application',
            html: genericNotificationTemplate(
              'Application Update',
              `Dear ${user.name}, your application to become a vendor has been reviewed. Unfortunately, we are unable to approve your application at this time. Reason: ${reason || 'Not specified'}.`
            )
          });
        }
      }
    } catch (err) {
      console.error('Failed to send vendor status email:', err);
    }

    res.json({ message: `Vendor marked as ${status}`, vendor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get pending bank transfers
// @route   GET /api/admin/bank-transfers
// @access  Private/Admin
const getPendingBankTransfers = async (req, res) => {
  try {
    const [orders, eventBookings] = await Promise.all([
      Order.find({
        paymentMethod: "Bank Transfer",
        paymentStatus: { $ne: "Pending" },
      })
        .populate("user", "name email")
        .sort({ updatedAt: -1 })
        .lean(),
      Booking.find({
        paymentMethod: "Bank Transfer",
        bankTransferStatus: { $in: ["Awaiting_Approval", "Approved", "Rejected"] },
      })
        .populate("user", "name email")
        .populate("event", "title")
        .sort({ bookingDate: -1 })
        .lean(),
    ]);

    const shopRecords = orders.map((order) => {
      const isAuction = order.orderItems?.some((item) =>
        item.name?.toLowerCase().includes("auction lot") || item.category === "Auction"
      );
      return {
        ...order,
        recordType: isAuction ? "auction" : "shop",
        recordLabel: isAuction ? "Auction lot" : "Shop order",
        reviewStatus: order.paymentStatus,
      };
    });
    const eventRecords = eventBookings.map((booking) => ({
      ...booking,
      recordType: "event",
      recordLabel: "Event ticket",
      orderId: booking.gsReference || booking.ticketId,
      createdAt: booking.bookingDate,
      reviewStatus: booking.bankTransferStatus,
    }));

    res.json([...shopRecords, ...eventRecords].sort((a, b) => (
      new Date(b.updatedAt || b.proofSubmittedAt || b.createdAt) -
      new Date(a.updatedAt || a.proofSubmittedAt || a.createdAt)
    )));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Send payment reminder to unpaid vendor
// @route   POST /api/admin/vendors/:id/remind-payment
// @access  Private/Super Admin
const remindVendorPayment = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('userId', 'email name');
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.paymentStatus === 'paid') {
      return res.status(400).json({ message: "Vendor has already paid" });
    }

    vendor.paymentReminderSent = true;
    await vendor.save();

    // Send reminder email
    const { sendEmail } = require('../utils/emailService');
    const fee = vendor.registrationFee || 2500;
    
    try {
      await sendEmail({
        to: vendor.userId.email,
        subject: 'Action Required: Pay Registration Fee to Activate Store',
        html: `
          <h3>Action Required: Store Activation Pending</h3>
          <p>Hi ${vendor.userId.name || 'Vendor'},</p>
          <p>Your application to become a vendor on The Grand Store was approved!</p>
          <p>To activate your store and start listing products, you need to pay the registration fee of R${fee}.</p>
          <p>Please log in to your dashboard and complete the payment to activate your account.</p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send reminder email to vendor:', emailErr);
    }

    res.json({ message: "Payment reminder sent successfully", vendor });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateVendorPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.paymentStatus = paymentStatus;
    await vendor.save();
    if (paymentStatus === 'paid') {
      const user = await User.findById(vendor.userId);
      if (user) {
        user.role = 'vendor_active';
        await user.save();
      }
    }
    res.json({ message: 'Payment status updated', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllVendors,
  getVendorById,
  updateVendorStatus,
  remindVendorPayment,
  getPendingBankTransfers,
  getStaffAccounts,
  updateStaffCredentials,
  createStaffAccount,
  updateVendorPaymentStatus,
};
