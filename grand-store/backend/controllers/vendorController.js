const Vendor = require('../models/Vendor');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.registerFullVendor = async (req, res) => {
  try {
    const { vendorType, accountInfo, businessInfo, kycInfo, taxInfo, licenceInfo, customsInfo, bankingInfo, productCategories, deliveryInfo, agreements, credentialsInfo, marketInfo, logisticsInfo, storyInfo } = req.body;

    let user;

    // Check if token is provided
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (err) {
        // Token invalid or expired, continue as unauthenticated
      }
    }

    if (!user) {
      if (!accountInfo || !accountInfo.email) {
        return res.status(400).json({ message: 'Account information is required' });
      }

      user = await User.findOne({ email: accountInfo.email });

      if (!user) {
        if (!accountInfo.password) {
          return res.status(400).json({ message: 'Password is required for new accounts' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(accountInfo.password, salt);

        // Create new user if they don't exist
        user = await User.create({
          name: accountInfo.name,
          email: accountInfo.email,
          password: hashedPassword,
          role: 'vendor_pending'
        });
      } else {
        // If user exists, verify password before giving access to update their account
        if (!accountInfo.password) {
          return res.status(401).json({ message: 'Account exists. Please provide your password to proceed.' });
        }
        const isMatch = await bcrypt.compare(accountInfo.password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Account already exists. Invalid password provided.' });
        }

        // If password matches, update their role
        user.role = 'vendor_pending';
        await user.save();
      }
    } else {
      // User was authenticated via token, just update their role
      user.role = 'vendor_pending';
      await user.save();
    }

    // Check if vendor application already exists for this user
    let vendor = await Vendor.findOne({ userId: user._id });
    if (vendor) {
      // Overwrite existing application
      vendor.vendorType = vendorType || 'local';
      vendor.businessInfo = businessInfo || {};
      vendor.bankingInfo = bankingInfo || {};
      vendor.productCategories = productCategories || [];
      vendor.agreements = { ...agreements, acceptedAt: Date.now() };
      
      if (vendorType === 'international') {
        vendor.credentialsInfo = credentialsInfo || {};
        vendor.marketInfo = marketInfo || {};
        vendor.logisticsInfo = logisticsInfo || {};
        vendor.storyInfo = storyInfo || {};
      } else {
        vendor.kycInfo = kycInfo || {};
        vendor.taxInfo = taxInfo || {};
        vendor.licenceInfo = licenceInfo || {};
        vendor.customsInfo = customsInfo || {};
        vendor.deliveryInfo = deliveryInfo || {};
      }
      
      vendor.status = 'pending_approval';
      vendor.onboardingStep = vendorType === 'international' ? 9 : 10;
      await vendor.save();
    } else {
      // Create new vendor application
      const vendorData = {
        userId: user._id,
        vendorType: vendorType || 'local',
        businessInfo: businessInfo || {},
        bankingInfo: bankingInfo || {},
        productCategories: productCategories || [],
        agreements: { ...agreements, acceptedAt: Date.now() },
        status: 'pending_approval',
        onboardingStep: vendorType === 'international' ? 9 : 10
      };
      
      if (vendorType === 'international') {
        vendorData.credentialsInfo = credentialsInfo || {};
        vendorData.marketInfo = marketInfo || {};
        vendorData.logisticsInfo = logisticsInfo || {};
        vendorData.storyInfo = storyInfo || {};
      } else {
        vendorData.kycInfo = kycInfo || {};
        vendorData.taxInfo = taxInfo || {};
        vendorData.licenceInfo = licenceInfo || {};
        vendorData.customsInfo = customsInfo || {};
        vendorData.deliveryInfo = deliveryInfo || {};
      }
      
      vendor = await Vendor.create(vendorData);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOnboardingProgress = async (req, res) => {
  try {
    let vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      // Create initial draft if not exists
      vendor = await Vendor.create({ userId: req.user._id, status: 'draft' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.saveOnboardingProgress = async (req, res) => {
  try {
    const { step, data } = req.body;
    let vendor = await Vendor.findOne({ userId: req.user._id });
    
    if (!vendor) {
      vendor = new Vendor({ userId: req.user._id });
    }

    // Determine which nested object to update based on the step
    switch (step) {
      case 2:
        vendor.businessInfo = { ...vendor.businessInfo, ...data };
        break;
      case 3:
        vendor.kycInfo = { ...vendor.kycInfo, ...data };
        break;
      case 4:
        vendor.taxInfo = { ...vendor.taxInfo, ...data };
        break;
      case 5:
        vendor.licenceInfo = { ...vendor.licenceInfo, ...data };
        break;
      case 6:
        vendor.customsInfo = { ...vendor.customsInfo, ...data };
        break;
      case 7:
        vendor.bankingInfo = { ...vendor.bankingInfo, ...data };
        break;
      case 8:
        vendor.productCategories = data.categories || [];
        break;
      case 9:
        vendor.deliveryInfo = { ...vendor.deliveryInfo, ...data };
        break;
      case 10:
        vendor.agreements = { ...vendor.agreements, ...data, acceptedAt: Date.now() };
        break;
    }

    vendor.onboardingStep = Math.max(vendor.onboardingStep, step + 1);
    await vendor.save();
    
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Include file metadata so the onboarding UI can identify and label the
    // selected document without relying only on the generated Cloudinary URL.
    res.json({
      url: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitApplication = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor application not found' });
    }

    if (vendor.status === 'approved') {
      return res.status(400).json({ message: 'Vendor is already approved' });
    }

    vendor.status = 'pending_approval';
    await vendor.save();

    // Update the user's role to indicate they are pending
    await User.findByIdAndUpdate(req.user._id, { role: 'vendor_pending' });

    res.json({ message: 'Application submitted successfully', vendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role !== 'vendor_approved_unpaid') {
      return res.status(400).json({ message: 'User is not in the correct state to apply a coupon' });
    }

    const VendorCoupon = require('../models/VendorCoupon');
    const coupon = await VendorCoupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or inactive coupon code' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Update Vendor
    const vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });

    const freeMonths = coupon.freeMonths || 1;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + freeMonths);

    vendor.couponUsed = coupon.code;
    vendor.freeTrialExpiry = expiryDate;
    vendor.trialStatus = 'active';
    vendor.paymentStatus = 'paid'; // Treat as paid while trial is active
    await vendor.save();

    // Update User Role
    user.role = 'vendor_active';
    await user.save();

    // Increment coupon usage
    coupon.usedCount += 1;
    await coupon.save();

    res.json({ message: 'Coupon applied successfully. Trial is now active.', freeTrialExpiry: expiryDate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.processVendorPayment = async (vendorId) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      console.error(`Vendor not found for payment processing: ${vendorId}`);
      return;
    }

    vendor.paymentStatus = 'paid';
    await vendor.save();

    const user = await User.findById(vendor.userId);
    if (user && user.role === 'vendor_approved_unpaid') {
      user.role = 'vendor_active';
      await user.save();
    }
    
    // Create Transaction record
    const Transaction = require('../models/Transaction');
    if (Transaction) {
      await Transaction.create({
        user: vendor.userId,
        orderId: vendor._id, // Using vendor ID as reference
        amount: vendor.registrationFee || 0,
        type: 'Payment',
        status: 'Completed',
        reference: `VND-${vendor._id}`,
        gateway: 'PayFast',
        date: new Date()
      });
    }

  } catch (error) {
    console.error('Error processing vendor payment:', error);
  }
};

exports.getStoreProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor application not found' });
    }
    res.json({
      businessName: vendor.businessInfo?.legalName || '',
      logoUrl: vendor.businessInfo?.logoUrl || '',
      bannerUrl: vendor.businessInfo?.bannerUrl || '',
      story: vendor.businessInfo?.story || '',
      vendorId: vendor.userId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStoreProfile = async (req, res) => {
  try {
    const { businessName, logoUrl, bannerUrl, story } = req.body;
    let vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor application not found' });
    }

    if (!vendor.businessInfo) vendor.businessInfo = {};
    if (businessName !== undefined) vendor.businessInfo.legalName = businessName;
    if (logoUrl !== undefined) vendor.businessInfo.logoUrl = logoUrl;
    if (bannerUrl !== undefined) vendor.businessInfo.bannerUrl = bannerUrl;
    if (story !== undefined) vendor.businessInfo.story = story;

    await vendor.save();
    res.json({ message: 'Store profile updated successfully', businessInfo: vendor.businessInfo });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
