const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && ['admin', 'super_admin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Administrator access is required' });
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ message: 'You do not have permission to access this resource' });
};

const superAdmin = requireRoles('admin', 'super_admin');
const financeStaff = requireRoles('admin', 'super_admin', 'accountant');
const productStaff = requireRoles('admin', 'super_admin', 'product_manager');

module.exports = { protect, admin, requireRoles, superAdmin, financeStaff, productStaff };
