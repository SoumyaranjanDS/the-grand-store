const AuctionFraudAlert = require('../models/AuctionFraudAlert');
const AuctionAuditLog = require('../models/AuctionAuditLog');
const Bid = require('../models/Bid');

/**
 * Evaluates a bid attempt for shill bidding, bot velocity, and collusion.
 */
async function evaluateBidIntegrity({ lot, bidder, bidAmount, ipAddress, userAgent, deviceFingerprint }) {
  const alerts = [];
  let riskScore = 0;
  let isBlocked = false;
  let blockReason = null;

  // Rule 1: Seller cannot bid on their own lot (strict CPA rule)
  const vendorIdStr = (lot.vendor?._id || lot.vendor).toString();
  const bidderIdStr = (bidder._id || bidder).toString();

  if (vendorIdStr === bidderIdStr) {
    isBlocked = true;
    blockReason = 'You are the registered seller of this lot and cannot place bids on your own items.';
    riskScore = 100;
    alerts.push({
      alertType: 'SELLER_BIDDER_MATCH',
      riskScore: 100,
      evidence: { message: 'Seller attempted to bid on own lot' }
    });
  }

  // Rule 2: Rapid Bid Velocity (Bot Detection)
  const tenSecondsAgo = new Date(Date.now() - 10000);
  const recentBidsCount = await Bid.countDocuments({
    user: bidder._id,
    createdAt: { $gte: tenSecondsAgo }
  });

  if (recentBidsCount >= 5) {
    isBlocked = true;
    blockReason = 'Unusually high bid frequency detected. Please wait a few seconds before placing another bid.';
    riskScore = Math.max(riskScore, 85);
    alerts.push({
      alertType: 'RAPID_BID_VELOCITY',
      riskScore: 85,
      evidence: { recentBidsIn10s: recentBidsCount }
    });
  }

  // Rule 3: IP Address Collusion between Bidder and other recent bidders / vendor
  if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
    // Check if another bidder on this same lot used this exact IP recently
    const otherBidderWithSameIp = await Bid.findOne({
      lot: lot._id,
      user: { $ne: bidder._id },
      ipAddress: ipAddress
    });

    if (otherBidderWithSameIp) {
      riskScore = Math.max(riskScore, 65);
      alerts.push({
        alertType: 'IP_COLLISION',
        riskScore: 65,
        evidence: {
          ipAddress,
          collidingBidderId: otherBidderWithSameIp.user
        }
      });
    }
  }

  // If alerts generated, record in database
  for (const alert of alerts) {
    try {
      await AuctionFraudAlert.create({
        lot: lot._id,
        bidder: bidder._id,
        vendor: lot.vendor?._id || lot.vendor,
        alertType: alert.alertType,
        riskScore: alert.riskScore,
        evidence: alert.evidence,
        status: isBlocked ? 'ACTION_TAKEN' : 'PENDING_REVIEW'
      });
    } catch (err) {
      console.error('Failed to log auction fraud alert:', err);
    }
  }

  return { isBlocked, blockReason, riskScore };
}

/**
 * Creates an immutable append-only audit log entry
 */
async function logAuctionEvent({ lotId, userId, eventType, details = {}, ipAddress = '', userAgent = '' }) {
  try {
    await AuctionAuditLog.create({
      lot: lotId,
      user: userId,
      eventType,
      details,
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.error(`Failed to record audit log [${eventType}]:`, err.message);
  }
}

module.exports = {
  evaluateBidIntegrity,
  logAuctionEvent
};
