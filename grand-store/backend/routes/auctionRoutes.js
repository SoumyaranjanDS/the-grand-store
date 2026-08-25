const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/', auctionController.getAuctionLots);
router.get('/:id', auctionController.getLotDetails);

// Authenticated
router.post('/:id/bid', protect, auctionController.placeBid);
router.post('/:id/watchlist', protect, auctionController.toggleWatchlist);
router.post('/:id/pay', protect, auctionController.payAuction);
router.get('/user/dashboard', protect, auctionController.getUserBids);

const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// Vendor
router.post('/', protect, upload.array('images', 5), auctionController.submitLot);
router.get('/vendor/lots', protect, auctionController.getVendorLots);
router.put('/:id/resubmit', protect, auctionController.resubmitLot);

// Admin
router.get('/admin/lots', protect, auctionController.getAdminPendingLots);
router.get('/admin/all', protect, auctionController.getAllLots);
router.put('/:id/approve', protect, auctionController.approveLot);
router.put('/:id/close', protect, auctionController.closeAuction);

module.exports = router;

