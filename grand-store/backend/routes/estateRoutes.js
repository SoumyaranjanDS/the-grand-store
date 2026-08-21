const express = require('express');
const router = express.Router();
const {
  listEstates,
  getEstate,
  getMyProfile,
  upsertMyProfile,
  togglePublish,
  toggleFollow,
} = require('../controllers/estateController');

const { protect } = require('../middleware/authMiddleware');

// Inline vendor role check (project has no separate vendorMiddleware file)
const isVendor = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor_active' || req.user.role === 'vendor_pending')) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Vendors only.' });
};

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `estate-${Date.now()}${path.extname(file.originalname)}`); }
});
const upload = multer({ storage });

// ─── Vendor (authenticated) ─── must come BEFORE /:slug wildcard ─────────────
router.get('/vendor/my-profile', protect, isVendor, getMyProfile);
router.post('/vendor/my-profile', protect, isVendor, upsertMyProfile);
router.patch('/vendor/my-profile/publish', protect, isVendor, togglePublish);

// Image upload route
router.post('/vendor/upload-images', protect, isVendor, upload.array('images', 4), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const urls = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
  res.json({ urls });
});

// ─── Customer (authenticated) — Follow/Unfollow ──────────────────────────────
router.post('/:id/follow', protect, toggleFollow);

// ─── Public — list and single estate (wildcard last) ─────────────────────────
router.get('/', listEstates);
router.get('/:slug', getEstate);

module.exports = router;

