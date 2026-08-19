const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById, getVendorEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for event images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.route('/')
  .post(protect, upload.single('image'), createEvent)
  .get(getEvents);

router.route('/vendor')
  .get(protect, getVendorEvents);

router.route('/:id')
  .get(getEventById);

module.exports = router;
