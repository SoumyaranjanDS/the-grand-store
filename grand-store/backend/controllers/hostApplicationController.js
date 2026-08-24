const crypto       = require('crypto');
const bcrypt       = require('bcryptjs');
const nodemailer   = require('nodemailer');
const HostApplication = require('../models/HostApplication');
const User            = require('../models/User');

// ── Email helper ──────────────────────────────────────────────────────────────
const { sendEmail } = require('../utils/emailService');
const { hostApplicationApprovalTemplate, hostApplicationRejectionTemplate } = require('../utils/emailTemplates');

const sendCredentialsEmail = async (to, name, username, password, type) => {
  try {
    await sendEmail({
      to,
      subject: `Your Grand Store ${type === 'auction' ? 'Auction' : 'Event'} Host credentials`,
      html: hostApplicationApprovalTemplate(name, username, password, type)
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
};

// ── Public — Submit application (no auth required) ────────────────────────────
const submitApplication = async (req, res) => {
  try {
    const app = await HostApplication.create(req.body);
    res.status(201).json({ message: 'Application submitted successfully.', id: app._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Admin — List all applications ────────────────────────────────────────────
const listApplications = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;
    const apps = await HostApplication.find(filter)
      .populate('generatedUserId', 'name email role')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — Get single application ──────────────────────────────────────────
const getApplication = async (req, res) => {
  try {
    const app = await HostApplication.findById(req.params.id)
      .populate('generatedUserId', 'name email role')
      .populate('approvedBy', 'name');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — Approve application ──────────────────────────────────────────────
const approveApplication = async (req, res) => {
  try {
    const app = await HostApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status === 'approved') {
      return res.status(400).json({ message: 'Already approved' });
    }

    const { allowedHostLimit = 0 } = req.body;
    const role = app.type === 'auction' ? 'auction_host' : 'event_host';
    let user = await User.findOne({ email: app.applicantEmail });
    let plainPassword = null;
    let isNewUser = false;
    let emailSent = false;

    if (!user) {
      // Generate a secure random password for new user
      plainPassword = crypto.randomBytes(6).toString('base64').slice(0, 10);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Create the host user
      user = await User.create({
        name:     app.applicantName,
        email:    app.applicantEmail,
        password: hashedPassword,
        role,
        allowedHostLimit: Number(allowedHostLimit),
      });
      isNewUser = true;
    } else {
      // User exists, update role if they are a customer or pending vendor
      if (user.role === 'customer' || user.role === 'vendor_pending') {
        user.role = role;
      }
      user.allowedHostLimit = Number(allowedHostLimit);
      await user.save();
    }

    // Update application record
    app.status           = 'approved';
    app.generatedUserId  = user._id;
    app.generatedUsername= app.applicantEmail;
    if (isNewUser) {
      app.generatedPassword = plainPassword;
    }
    app.approvedAt       = new Date();
    app.approvedBy       = req.user._id;
    await app.save();

    // Attempt to email credentials if it's a new user
    if (isNewUser) {
      emailSent = await sendCredentialsEmail(
        app.applicantEmail,
        app.applicantName,
        app.applicantEmail,
        plainPassword,
        app.type
      );
      if (emailSent) {
        app.credentialsSent = true;
        await app.save();
      }
    }

    res.json({
      message: isNewUser ? 'Application approved. Credentials generated.' : 'Application approved. Existing account updated.',
      credentials: {
        username: app.applicantEmail,
        password: isNewUser ? plainPassword : '(User already has an account)',
      },
      emailSent: !!emailSent,
      application: app,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — Reject application ───────────────────────────────────────────────
const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const app = await HostApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    app.status         = 'rejected';
    app.rejectedAt     = new Date();
    app.rejectedReason = reason || 'No reason provided';
    await app.save();

    // Send Rejection Email
    try {
      await sendEmail({
        to: app.applicantEmail,
        subject: `Update on your ${app.type === 'auction' ? 'Auction' : 'Event'} Host Application`,
        html: hostApplicationRejectionTemplate(app.applicantName, app.type, app.rejectedReason)
      });
    } catch (err) {
      console.error('Failed to send application rejection email:', err);
    }

    res.json({ message: 'Application rejected.', application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Admin — Revoke host access (delete the generated user) ───────────────────
const revokeAccess = async (req, res) => {
  try {
    const app = await HostApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.generatedUserId) {
      await User.findByIdAndDelete(app.generatedUserId);
    }
    app.status          = 'rejected';
    app.generatedUserId = null;
    app.rejectedAt      = new Date();
    app.rejectedReason  = 'Access revoked by admin';
    await app.save();
    res.json({ message: 'Host access revoked successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitApplication,
  listApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  revokeAccess,
};
