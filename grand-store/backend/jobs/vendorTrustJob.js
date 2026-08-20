const cron = require('node-cron');
const Vendor = require('../models/Vendor');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Run every night at midnight (0 0 * * *)
const startVendorTrustJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Starting nightly vendor trust score calculation...');
      
      // Get all active vendors
      const vendors = await Vendor.find({ status: 'approved' });
      
      for (const vendor of vendors) {
        // 1. Calculate Review Score (0-50 points)
        const reviews = await Review.find({ type: 'vendor', referenceId: vendor.userId, status: 'approved' });
        let reviewScore = 25; // Default middle score if no reviews
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, rev) => acc + rev.ratings.overall, 0);
          const avg = sum / reviews.length;
          // Map 1-5 rating to 0-50 points
          reviewScore = (avg / 5) * 50;
        }

        // 2. Calculate Orders Fulfilled Score (0-30 points)
        // Find orders containing products from this vendor
        const allOrders = await Order.find({ 'items.vendor': vendor.userId });
        const totalItems = allOrders.reduce((sum, order) => {
          return sum + order.items.filter(item => item.vendor.toString() === vendor.userId.toString()).length;
        }, 0);
        const fulfilledItems = allOrders.reduce((sum, order) => {
          return sum + order.items.filter(item => 
            item.vendor.toString() === vendor.userId.toString() && 
            (order.status === 'Delivered' || order.status === 'Shipped')
          ).length;
        }, 0);
        
        let fulfillmentScore = 15; // Default if no orders
        let ordersFulfilledPercent = 0;
        if (totalItems > 0) {
          ordersFulfilledPercent = (fulfilledItems / totalItems) * 100;
          fulfillmentScore = (ordersFulfilledPercent / 100) * 30;
        }

        // 3. Document Verification Score (0-20 points)
        // Assume 4 points for each of the 5 verifications
        let verificationScore = 0;
        if (vendor.verificationScore) {
          if (vendor.verificationScore.businessVerified) verificationScore += 4;
          if (vendor.verificationScore.identityVerified) verificationScore += 4;
          if (vendor.verificationScore.licenceVerified) verificationScore += 4;
          if (vendor.verificationScore.taxVerified) verificationScore += 4;
          if (vendor.verificationScore.bankVerified) verificationScore += 4;
        }

        // Total Trust Score (0-100)
        const trustScore = Math.round(reviewScore + fulfillmentScore + verificationScore);

        // Update vendor
        await Vendor.findByIdAndUpdate(vendor._id, {
          trustScore: trustScore,
          'performanceMetrics.ordersFulfilledPercent': Math.round(ordersFulfilledPercent)
        });
      }
      
      console.log('Nightly vendor trust score calculation completed.');
    } catch (error) {
      console.error('Error running vendor trust job:', error.message);
    }
  });

  console.log('Vendor Trust cron jobs scheduled.');
};

module.exports = startVendorTrustJobs;
