const cron = require('node-cron');
const AuctionLot = require('../models/AuctionLot');
const { closeAuctionInternal } = require('../controllers/auctionController');

// Run every minute to check for expired auctions
const startAuctionCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // 1. Close any active/upcoming auctions whose end time has passed.
      const expiredLots = await AuctionLot.find({
        status: { $in: ['live', 'upcoming'] },
        endDate: { $lte: now }
      });

      if (expiredLots.length > 0) {
        console.log(`Found ${expiredLots.length} expired auctions. Closing...`);
        for (const lot of expiredLots) {
          try {
            await closeAuctionInternal(lot._id);
            console.log(`Successfully closed auction for lot ${lot._id}`);
          } catch (err) {
            console.error(`Error closing auction for lot ${lot._id}:`, err.message);
          }
        }
      }

      // 2. Start only upcoming auctions that still have a valid future end time.
      const startedLots = await AuctionLot.updateMany(
        { status: 'upcoming', startDate: { $lte: now }, endDate: { $gt: now } },
        { $set: { status: 'live' } }
      );
      if (startedLots.modifiedCount > 0) {
        console.log(`Started ${startedLots.modifiedCount} upcoming auctions.`);
      }
    } catch (error) {
      console.error('Error running auction cron job:', error.message);
    }
  });

  console.log('Auction cron jobs scheduled.');
};

module.exports = startAuctionCronJobs;
