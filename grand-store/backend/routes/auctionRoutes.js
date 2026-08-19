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

// Vendor
router.post('/', protect, auctionController.submitLot);
router.get('/vendor/lots', protect, auctionController.getVendorLots);

// Admin
router.get('/admin/lots', protect, auctionController.getAdminPendingLots);
router.get('/admin/all', protect, auctionController.getAllLots);
router.put('/:id/approve', protect, auctionController.approveLot);
router.put('/:id/close', protect, auctionController.closeAuction);

module.exports = router;

