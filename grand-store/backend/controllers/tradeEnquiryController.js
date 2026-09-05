const TradeEnquiry = require('../models/TradeEnquiry');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new trade enquiry
// @route   POST /api/trade-enquiries
// @access  Public (No login required)
const createEnquiry = async (req, res) => {
  try {
    const { fullname, email, phone, companyname, website, message, source } = req.body;

    // Honeypot check
    if (website) {
      return res.status(200).json({ success: true, message: 'Enquiry received' });
    }

    if (!fullname || !email) {
      return res.status(400).json({ success: false, message: 'Please provide both your name and email address.' });
    }

    const enquiry = await TradeEnquiry.create({
      fullname,
      email,
      phone,
      companyname,
      message,
      source: source || 'enquiry'
    });

    // Notify all admin users
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        const sourceLabel = source === 'app_promo' ? 'Homepage Form' : source === 'contact' ? 'Contact Form' : 'Trade Enquiry';
        const notifs = admins.map(adminUser => ({
          recipient: adminUser._id,
          recipientType: 'admin',
          title: `New Message (${sourceLabel})`,
          message: `${fullname} (${email}) sent a message: "${message ? (message.length > 80 ? message.slice(0, 80) + '...' : message) : 'No message provided'}"`,
          type: 'system',
          link: '/admin/trade-enquiries',
          metadata: { enquiryId: enquiry._id, email, phone, source }
        }));
        await Notification.insertMany(notifs);
      }
    } catch (notifErr) {
      console.warn('Failed to dispatch admin notification for enquiry:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent directly to the Grand Store admin team.',
      data: enquiry
    });
  } catch (error) {
    console.error('Error creating trade enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all trade enquiries
// @route   GET /api/trade-enquiries
// @access  Private/Admin
const getAdminEnquiries = async (req, res) => {
  try {
    const enquiries = await TradeEnquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching trade enquiries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update trade enquiry status
// @route   PUT /api/trade-enquiries/:id/status
// @access  Private/Admin
const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const enquiry = await TradeEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    enquiry.status = status;
    const updatedEnquiry = await enquiry.save();

    res.status(200).json({
      success: true,
      data: updatedEnquiry
    });
  } catch (error) {
    console.error('Error updating trade enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createEnquiry,
  getAdminEnquiries,
  updateEnquiryStatus
};
