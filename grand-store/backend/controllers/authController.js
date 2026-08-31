const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const axios = require('axios');

const normalizeReferralCode = (value) => String(value || '').trim().toUpperCase();

const generateUniqueReferralCode = async () => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    if (!await User.exists({ referralCode: code })) return code;
  }
  throw new Error('Unable to generate a unique referral code');
};

const findReferrer = async (value) => {
  const code = normalizeReferralCode(value);
  if (!code) return null;
  return User.findOne({ referralCode: code }).select('_id name referralCode');
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };
  res.status(statusCode).cookie('jwt', token, options).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    referralCode: user.referralCode,
    rewardBalance: user.rewardBalance || 0,
    totalReferrals: user.totalReferrals || 0,
    hasReferrer: Boolean(user.referredBy),
    mustChangePassword: user?.mustChangePassword
  });
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  res.status(200).json({ success: true, message: 'User logged out' });
};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // `referredBy` was briefly used by the frontend. Accept it as a backwards-
    // compatible alias while keeping referralCode as the public API contract.
    const submittedReferralCode = req.body.referralCode ?? req.body.referredBy;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let referredBy = null;
    if (normalizeReferralCode(submittedReferralCode)) {
      const referringUser = await findReferrer(submittedReferralCode);
      if (!referringUser) {
        return res.status(400).json({ message: 'Referral code is invalid or no longer active' });
      }
      referredBy = referringUser._id;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newReferralCode = await generateUniqueReferralCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy
    });

    if (user) {
      // Send welcome email (non-blocking)
      const { sendEmail } = require('../utils/emailService');
      const { welcomeEmailTemplate } = require('../utils/emailTemplates');
      sendEmail({
        to: user.email,
        subject: 'Welcome to The Grand Store',
        html: welcomeEmailTemplate(user.name)
      }).catch(err => console.error('Failed to send welcome email:', err));

      sendTokenResponse(user, 201, res);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      sendTokenResponse(user, 200, res);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      if (!user.referralCode) {
        user.referralCode = await generateUniqueReferralCode();
        await user.save();
      }
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      // Note: Email cannot be changed
      // user.email = req.body.email || user.email;

      if (req.body.password) {
        if (user.password) {
          // Strict validation: Must provide currentPassword to change password
          if (!req.body.currentPassword) {
            return res.status(400).json({ message: 'Current password is required to change password' });
          }
          
          const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
          if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
          }
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      sendTokenResponse(updatedUser, 200, res);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Perform the deletion
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'User profile successfully deleted' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ message: 'Server error while deleting profile' });
  }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { token, role = 'customer' } = req.body;
    const submittedReferralCode = req.body.referralCode ?? req.body.referredBy;
    
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    let payload;
    if (token.startsWith('ya29.')) {
      // It's an access token
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      payload = data;
    } else {
      // It's an ID token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    }

    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists without googleId, link it
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      
      // We don't overwrite the role if it's already a vendor, unless requested by the frontend
      // But if the frontend passes 'vendor_pending' and they are 'customer', we can upgrade them.
      if (role === 'vendor_pending' && user.role === 'customer') {
        user.role = 'vendor_pending';
        await user.save();
      }
    } else {
      let referredBy = null;
      if (normalizeReferralCode(submittedReferralCode)) {
        const referringUser = await findReferrer(submittedReferralCode);
        if (!referringUser) {
          return res.status(400).json({ message: 'Referral code is invalid or no longer active' });
        }
        referredBy = referringUser._id;
      }

      const newReferralCode = await generateUniqueReferralCode();

      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        role: role,
        referralCode: newReferralCode,
        referredBy
        // password is required: false in schema, so we can omit it
      });

      // Send welcome email (non-blocking)
      const { sendEmail } = require('../utils/emailService');
      const { welcomeEmailTemplate } = require('../utils/emailTemplates');
      sendEmail({
        to: user.email,
        subject: 'Welcome to The Grand Store',
        html: welcomeEmailTemplate(user.name)
      }).catch(err => console.error('Failed to send welcome email:', err));
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};

// @desc    Get the logged-in user's referral dashboard and current program rules
// @route   GET /api/auth/referrals
// @access  Private
const getReferralSummary = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const PlatformSettings = require('../models/PlatformSettings');
    const user = await User.findById(req.user._id).select(
      'referralCode referredBy rewardBalance totalReferrals'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.referralCode) {
      user.referralCode = await generateUniqueReferralCode();
      await user.save();
    }

    const referredUsers = await User.find({ referredBy: user._id })
      .select('name createdAt')
      .sort({ createdAt: -1 })
      .lean();
    const referredUserIds = referredUsers.map((referredUser) => referredUser._id);
    const paidUserIds = referredUserIds.length
      ? await Order.distinct('user', { user: { $in: referredUserIds }, isPaid: true })
      : [];
    const paidUserIdSet = new Set(paidUserIds.map((id) => id.toString()));
    const successfulReferrals = referredUsers.filter((referredUser) => (
      paidUserIdSet.has(referredUser._id.toString())
    )).length;

    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});
    const ownPaidOrders = await Order.countDocuments({ user: user._id, isPaid: true });

    res.json({
      referralCode: user.referralCode,
      rewardBalance: Math.max(0, Number(user.rewardBalance) || 0),
      totalSignups: referredUsers.length,
      successfulReferrals,
      pendingReferrals: Math.max(0, referredUsers.length - successfulReferrals),
      welcomeDiscountEligible: Boolean(user.referredBy) && ownPaidOrders === 0,
      program: {
        rewardAmount: settings.referralRewardAmount,
        rewardType: settings.referralRewardType,
        welcomeDiscount: settings.referralWelcomeDiscount,
        welcomeDiscountType: settings.referralWelcomeDiscountType
      },
      referrals: referredUsers.slice(0, 20).map((referredUser) => ({
        id: referredUser._id,
        name: referredUser.name,
        joinedAt: referredUser.createdAt,
        status: paidUserIdSet.has(referredUser._id.toString()) ? 'successful' : 'pending'
      }))
    });
  } catch (error) {
    console.error('Get Referral Summary Error:', error);
    res.status(500).json({ message: 'Server error loading referral details' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  googleAuth,
  getReferralSummary,
};
