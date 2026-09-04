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

      // 2. Start only upcoming auctions that still have a valid future end time and notify all users
      const upcomingToLive = await AuctionLot.find({
        status: 'upcoming',
        startDate: { $lte: now },
        endDate: { $gt: now }
      });

      if (upcomingToLive.length > 0) {
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        const users = await User.find({ isEmailVerified: true }).select('_id');

        for (const lot of upcomingToLive) {
          lot.status = 'live';
          await lot.save();
          console.log(`Started upcoming auction: Lot ${lot.lotNumber || ''} (${lot.title})`);

          if (users.length > 0) {
            const notifs = users.map(u => ({
              recipient: u._id,
              recipientType: 'customer',
              title: `🔥 Auction Now Live: ${lot.title}`,
              message: `The bidding floor for Lot ${lot.lotNumber ? `#${lot.lotNumber}` : ''} ("${lot.title}") is officially open! Place your opening offer now.`,
              type: 'auction',
              link: `/auction/${lot._id}`,
              metadata: { lotId: lot._id }
            }));
            await Notification.insertMany(notifs).catch(e => console.error('Failed to dispatch lot live notifications:', e));
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
