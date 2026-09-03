const cron = require("node-cron");
const Booking = require("../models/Booking");
const AuctionLot = require("../models/AuctionLot");
const User = require("../models/User");
const PlatformSettings = require("../models/PlatformSettings");
const { sendEmail } = require("../utils/emailService");
const {
  eventReminderTemplate,
  auctionReminderTemplate,
  birthdayCelebrationEmailTemplate,
} = require("../utils/emailTemplates");

const startReminderJobs = () => {
  // Run daily at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running daily reminder jobs...");
      const now = new Date();
      const tomorrowStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      const tomorrowEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 2,
      );

      // 1. Event Reminders
      const upcomingBookings = await Booking.find({ paymentStatus: "Paid" })
        .populate({
          path: "event",
          match: { date: { $gte: tomorrowStart, $lt: tomorrowEnd } },
        })
        .populate("user");

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
                booking.event.location,
              ),
            });
            eventsReminded++;
          } catch (err) {
            console.error(
              `Error sending event reminder to ${booking.user.email}:`,
              err.message,
            );
          }
        }
      }
      if (eventsReminded > 0)
        console.log(`Sent ${eventsReminded} event reminders.`);

      // 2. Auction Reminders
      const upcomingAuctions = await AuctionLot.find({
        startDate: { $gte: tomorrowStart, $lt: tomorrowEnd },
        status: { $in: ["upcoming", "live"] },
      });

      let auctionsReminded = 0;
      for (const auction of upcomingAuctions) {
        const usersWatching = await User.find({
          auctionWatchlist: auction._id,
        });
        for (const user of usersWatching) {
          try {
            await sendEmail({
              to: user.email,
              subject: `Reminder: Auction for ${auction.title} is starting soon!`,
              html: auctionReminderTemplate(
                user.name,
                auction.title,
                auction.startDate,
                auction.lotNumber || "N/A",
              ),
            });
            auctionsReminded++;
          } catch (err) {
            console.error(
              `Error sending auction reminder to ${user.email}:`,
              err.message,
            );
          }
        }
      }
      if (auctionsReminded > 0)
        console.log(`Sent ${auctionsReminded} auction reminders.`);

      // 3. Customer Birthday Automated Greeting & Promotion
      const settings = (await PlatformSettings.findOne()) || {};
      const birthdayEmailEnabled = settings.birthdayEmailEnabled !== undefined ? settings.birthdayEmailEnabled : true;

      if (birthdayEmailEnabled) {
        const todayMonth = now.getMonth() + 1; // 1-12
        const todayDay = now.getDate(); // 1-31
        const currentYear = now.getFullYear();

        const birthdayUsers = await User.find({
          dateOfBirth: { $exists: true, $ne: null },
          $or: [
            { lastBirthdayEmailSentYear: { $exists: false } },
            { lastBirthdayEmailSentYear: { $ne: currentYear } }
          ]
        });

        let birthdaysGreeted = 0;
        for (const u of birthdayUsers) {
          if (!u.email) continue;
          const dob = new Date(u.dateOfBirth);
          if (isNaN(dob.getTime())) continue;

          if (dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay) {
            try {
              await sendEmail({
                to: u.email,
                subject: `Happy Birthday from The Grand Store! 🍾 🥂`,
                html: birthdayCelebrationEmailTemplate({
                  name: u.name,
                  discountEnabled: settings.birthdayDiscountEnabled !== undefined ? settings.birthdayDiscountEnabled : true,
                  discountPercent: settings.birthdayDiscountPercent || 15,
                  promoCode: settings.birthdayPromoCode || 'BDAY-LUXURY15',
                  customMessage: settings.birthdayCustomMessage || '',
                  storeUrl: process.env.CLIENT_URL || 'http://localhost:5173'
                }),
              });

              u.lastBirthdayEmailSentYear = currentYear;
              await u.save();
              birthdaysGreeted++;
            } catch (err) {
              console.error(`Error sending birthday email to ${u.email}:`, err.message);
            }
          }
        }
        if (birthdaysGreeted > 0) {
          console.log(`Sent ${birthdaysGreeted} luxury birthday celebration emails.`);
        }
      }
    } catch (error) {
      console.error("Error in daily reminder jobs:", error.message);
    }
  });

  console.log("Reminder cron jobs scheduled.");
};

module.exports = startReminderJobs;
