const TradeEnquiry = require('../models/TradeEnquiry');

// @desc    Create a new trade enquiry
// @route   POST /api/trade-enquiries
// @access  Public
const createEnquiry = async (req, res) => {
  try {
    const { fullname, email, phone, companyname, website, message, source } = req.body;

    // Honeypot check
    if (website) {
      return res.status(200).json({ success: true, message: 'Enquiry received' });
    }

    const enquiry = await TradeEnquiry.create({
      fullname,
      email,
      phone,
      companyname,
      message,
      source: source || 'enquiry'
    });

    res.status(201).json({
      success: true,
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
