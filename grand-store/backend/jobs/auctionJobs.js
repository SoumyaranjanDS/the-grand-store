const cron = require('node-cron');
const AuctionLot = require('../models/AuctionLot');
const { closeAuctionInternal } = require('../controllers/auctionController');

// Run every minute to check for expired auctions
const startAuctionCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // 1. Find all upcoming auctions where startDate has passed and make them live
      const startedLots = await AuctionLot.updateMany(
        { status: 'upcoming', startDate: { $lte: new Date() } },
        { $set: { status: 'live' } }
      );
      if (startedLots.modifiedCount > 0) {
        console.log(`Started ${startedLots.modifiedCount} upcoming auctions.`);
      }

      // 2. Find all live auctions where endDate has passed
      const expiredLots = await AuctionLot.find({
        status: 'live',
        endDate: { $lt: new Date() }
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
    } catch (error) {
      console.error('Error running auction cron job:', error.message);
    }
  });

  console.log('Auction cron jobs scheduled.');
};

module.exports = startAuctionCronJobs;
