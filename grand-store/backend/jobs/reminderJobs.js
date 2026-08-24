const cron = require('node-cron');
const Booking = require('../models/Booking');
const AuctionLot = require('../models/AuctionLot');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { eventReminderTemplate, auctionReminderTemplate } = require('../utils/emailTemplates');

const startReminderJobs = () => {
  // Run daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('Running daily reminder jobs...');
      const now = new Date();
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

      // 1. Event Reminders
      const upcomingBookings = await Booking.find({ paymentStatus: 'Paid' })
        .populate({
          path: 'event',
          match: { date: { $gte: tomorrowStart, $lt: tomorrowEnd } }
        })
        .populate('user');

      let eventsReminded = 0;
      for (const booking of upcomingBookings) {
        if (booking.event && booking.user) {
          try {
            await sendEmail({
              to: booking.user.email,
              subject: `Reminder: ${booking.event.title} is coming up!`,
              html: eventReminderTemplate(
                booking.user.name,
                booking.event.title,
                booking.event.date,
                booking.event.startTime,
                booking.event.location
              )
            });
            eventsReminded++;
          } catch (err) {
            console.error(`Error sending event reminder to ${booking.user.email}:`, err.message);
          }
        }
      }
      if (eventsReminded > 0) console.log(`Sent ${eventsReminded} event reminders.`);

      // 2. Auction Reminders
      const upcomingAuctions = await AuctionLot.find({
        startDate: { $gte: tomorrowStart, $lt: tomorrowEnd },
        status: { $in: ['upcoming', 'live'] }
      });

      let auctionsReminded = 0;
      for (const auction of upcomingAuctions) {
        const usersWatching = await User.find({ auctionWatchlist: auction._id });
        for (const user of usersWatching) {
          try {
            await sendEmail({
              to: user.email,
              subject: `Reminder: Auction for ${auction.title} is starting soon!`,
              html: auctionReminderTemplate(
                user.name,
                auction.title,
                auction.startDate,
                auction.lotNumber || 'N/A'
              )
            });
            auctionsReminded++;
          } catch (err) {
            console.error(`Error sending auction reminder to ${user.email}:`, err.message);
          }
        }
      }
      if (auctionsReminded > 0) console.log(`Sent ${auctionsReminded} auction reminders.`);

    } catch (error) {
      console.error('Error in daily reminder jobs:', error.message);
    }
  });

  console.log('Reminder cron jobs scheduled.');
};

module.exports = startReminderJobs;
