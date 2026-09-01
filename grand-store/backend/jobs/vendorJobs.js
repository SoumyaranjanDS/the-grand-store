const cron = require("node-cron");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");


const startVendorJobs = () => {
  // Run daily at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Running Vendor Trial Expiry Check...");
    try {
      const now = new Date();
      
      // 1. Expiration check
      const expiredVendors = await Vendor.find({
        trialStatus: "active",
        freeTrialExpiry: { $lte: now }
      });

      for (const vendor of expiredVendors) {
        vendor.trialStatus = "expired";
        vendor.paymentStatus = "unpaid";
        await vendor.save();

        const user = await User.findById(vendor.userId);
        if (user) {
          user.role = "vendor_approved_unpaid";
          await user.save();
          
          // Send Expiry Notification
          try {
            await sendEmail({
              to: user.email,
              subject: "Your Vendor Free Trial Has Expired",
              html: `
                <h3>Your trial has expired</h3>
                <p>Hi ${user.name},</p>
                <p>Your free trial on The Grand Store has expired. Your products are now hidden and your dashboard access has been suspended.</p>
                <p>Please log in and pay the registration fee to restore your active vendor status.</p>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/payment">Pay Registration Fee</a></p>
              `
            });
          } catch (emailErr) {
            console.error("Failed to send trial expiry email to", user.email, emailErr);
          }
        }
      }

      // 2. Warning Check (7 days before)
      const warningDateStart = new Date(now);
      warningDateStart.setDate(warningDateStart.getDate() + 7);
      warningDateStart.setHours(0, 0, 0, 0);

      const warningDateEnd = new Date(warningDateStart);
      warningDateEnd.setHours(23, 59, 59, 999);

      const warningVendors = await Vendor.find({
        trialStatus: "active",
        freeTrialExpiry: { $gte: warningDateStart, $lte: warningDateEnd }
      });

      for (const vendor of warningVendors) {
        const user = await User.findById(vendor.userId);
        if (user) {
          try {
            const fee = vendor.registrationFee || 500; // fallback
            await sendEmail({
              to: user.email,
              subject: "Action Required: Your Free Trial is Expiring Soon",
              html: `
                <h3>Your free trial expires in 7 days</h3>
                <p>Hi ${user.name},</p>
                <p>Your free trial on The Grand Store will expire on ${vendor.freeTrialExpiry.toLocaleDateString()}.</p>
                <p>To avoid any interruption to your store and keep your products visible to customers, please pay the registration fee of R${fee}.</p>
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/payment">Pay Registration Fee</a></p>
              `
            });
          } catch (emailErr) {
            console.error("Failed to send 7-day warning email to", user.email, emailErr);
          }
        }
      }

    } catch (error) {
      console.error("Error running vendor trial expiry job", error);
    }
  });
};

module.exports = startVendorJobs;
