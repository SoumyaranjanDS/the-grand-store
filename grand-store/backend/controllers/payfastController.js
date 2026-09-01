const crypto = require('crypto');
const Order = require('../models/Order');
const AuctionLot = require('../models/AuctionLot');
const Booking = require('../models/Booking');
const { processOrderPayment } = require('./orderController');
const { processAuctionPayment } = require('./auctionController');
const { processEventPayment } = require('./eventControllerV2');
const { processVendorPayment } = require('./vendorController');

const trimTrailingSlashes = (url) => url.replace(/\/+$/, '');

const getFrontendUrl = (req) => trimTrailingSlashes(
  process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173'
);

const getBackendUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return trimTrailingSlashes(process.env.BACKEND_URL);
  }

  // In production the API host that received this authenticated request is
  // also the public host PayFast must call. This avoids silently emitting a
  // localhost notify_url when BACKEND_URL has not been configured.
  const forwardedProtocol = req.get('x-forwarded-proto')?.split(',')[0].trim();
  return `${forwardedProtocol || req.protocol}://${req.get('host')}`;
};

// Helper to generate PayFast signature
const generateSignature = (data, passphrase = null) => {
  // 1. Create parameter string
  let pfOutput = '';
  for (const key in data) {
    if (data.hasOwnProperty(key) && data[key] !== '') {
      pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
  }

  // 2. Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passphrase) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  // 3. Hash using MD5
  return crypto.createHash('md5').update(getString).digest('hex');
};

const getPayfastConfig = () => {
  const isLive = process.env.PAYFAST_IS_LIVE === 'true';
  return {
    merchant_id: isLive ? process.env.PAYFAST_LIVE_MERCHANT_ID : process.env.PAYFAST_TEST_MERCHANT_ID,
    merchant_key: isLive ? process.env.PAYFAST_LIVE_MERCHANT_KEY : process.env.PAYFAST_TEST_MERCHANT_KEY,
    passphrase: isLive ? process.env.PAYFAST_LIVE_PASSPHRASE : process.env.PAYFAST_TEST_PASSPHRASE,
    url: isLive ? 'https://www.payfast.co.za/eng/process' : 'https://sandbox.payfast.co.za/eng/process'
  };
};

// @desc    Generate PayFast payload for a Shop Order
// @route   POST /api/payfast/generate-shop
// @access  Private
exports.generateShopPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isPaid) return res.status(400).json({ message: 'Order already paid' });

    const config = getPayfastConfig();
    const frontendUrl = getFrontendUrl(req);
    const backendUrl = getBackendUrl(req);
    
    const data = {
      merchant_id: config.merchant_id,
      merchant_key: config.merchant_key,
      return_url: `${frontendUrl}/customer/order/${order._id}?payment=success`,
      cancel_url: `${frontendUrl}/customer/order/${order._id}?payment=cancel`,
      notify_url: `${backendUrl}/api/payfast/itn`,
      name_first: order.user.name.split(' ')[0],
      name_last: order.user.name.split(' ').slice(1).join(' ') || 'Customer',
      email_address: order.user.email,
      m_payment_id: `SHP-${order._id}`,
      amount: order.totalPrice.toFixed(2),
      item_name: `Order ${order.orderId}`
    };

    const signature = generateSignature(data, config.passphrase);
    data.signature = signature;
    
    res.json({ url: config.url, data });
  } catch (error) {
    console.error('Error generating PayFast shop payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate PayFast payload for an Auction Win
// @route   POST /api/payfast/generate-auction
// @access  Private
exports.generateAuctionPayment = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const lot = await AuctionLot.findById(auctionId).populate('winner', 'name email');
    
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    if (lot.paymentStatus === 'Paid') return res.status(400).json({ message: 'Lot already paid' });
    if (lot.winner._id.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Only the winner can pay for this lot' });
    }

    const config = getPayfastConfig();
    const frontendUrl = getFrontendUrl(req);
    const backendUrl = getBackendUrl(req);
    
    const data = {
      merchant_id: config.merchant_id,
      merchant_key: config.merchant_key,
      return_url: `${frontendUrl}/auction/${lot._id}?payment=success`,
      cancel_url: `${frontendUrl}/auction/${lot._id}?payment=cancel`,
      notify_url: `${backendUrl}/api/payfast/itn`,
      name_first: lot.winner.name.split(' ')[0],
      name_last: lot.winner.name.split(' ').slice(1).join(' ') || 'Winner',
      email_address: lot.winner.email,
      m_payment_id: `AUC-${lot._id}`,
      amount: lot.totalPaidByBuyer.toFixed(2),
      item_name: `Auction Lot ${lot.lotNumber || lot._id.toString().slice(-6)}`
    };

    const signature = generateSignature(data, config.passphrase);
    data.signature = signature;
    
    res.json({ url: config.url, data });
  } catch (error) {
    console.error('Error generating PayFast auction payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate PayFast payload for an Event Booking
// @route   POST /api/payfast/generate-event
// @access  Private
exports.generateEventPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('user', 'name email').populate('event', 'title');
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (['Paid', 'Completed'].includes(booking.paymentStatus)) return res.status(400).json({ message: 'Booking already paid' });
    if (booking.user._id.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Only the ticket holder can pay for this booking' });
    }
    if (booking.paymentStatus !== 'Pending' || (booking.reservationExpiresAt && booking.reservationExpiresAt <= new Date())) {
      return res.status(410).json({ message: 'This ticket reservation has expired. Please book again.' });
    }

    const config = getPayfastConfig();
    const frontendUrl = getFrontendUrl(req);
    const backendUrl = getBackendUrl(req);
    
    const data = {
      merchant_id: config.merchant_id,
      merchant_key: config.merchant_key,
      return_url: `${frontendUrl}/customer/event-order/${booking._id}?payment=success`,
      cancel_url: `${frontendUrl}/customer/event-order/${booking._id}?payment=cancel`,
      notify_url: `${backendUrl}/api/payfast/itn`,
      name_first: booking.user.name.split(' ')[0],
      name_last: booking.user.name.split(' ').slice(1).join(' ') || 'Customer',
      email_address: booking.user.email,
      m_payment_id: `EVT-${booking._id}`,
      amount: booking.totalPrice.toFixed(2),
      item_name: `Event Ticket - ${booking.event.title}`
    };

    const signature = generateSignature(data, config.passphrase);
    data.signature = signature;
    
    res.json({ url: config.url, data });
  } catch (error) {
    console.error('Error generating PayFast event payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate PayFast payload for Vendor Registration
// @route   POST /api/payfast/generate-vendor
// @access  Private
exports.generateVendorPayment = async (req, res) => {
  try {
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ userId: req.user._id }).populate('userId');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor application not found' });
    }

    const config = getPayfastConfig();
    const frontendUrl = getFrontendUrl(req);
    const backendUrl = getBackendUrl(req);

    const data = {
      merchant_id: config.merchant_id,
      merchant_key: config.merchant_key,
      return_url: `${frontendUrl}/vendor/payment?success=true`,
      cancel_url: `${frontendUrl}/vendor/payment?success=false`,
      notify_url: `${backendUrl}/api/payfast/itn`,
      name_first: vendor.userId.name.split(' ')[0],
      name_last: vendor.userId.name.split(' ').slice(1).join(' ') || 'Vendor',
      email_address: vendor.userId.email,
      m_payment_id: `VND-${vendor._id}`,
      amount: (vendor.registrationFee || 0).toFixed(2),
      item_name: 'Vendor Registration Fee'
    };

    const signature = generateSignature(data, config.passphrase);
    data.signature = signature;
    
    res.json({ url: config.url, data });
  } catch (error) {
    console.error('Error generating PayFast vendor payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle PayFast ITN Webhook
// @route   POST /api/payfast/itn
// @access  Public
exports.itnWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const config = getPayfastConfig();

    console.log('PayFast ITN received', {
      paymentId: payload?.m_payment_id,
      status: payload?.payment_status,
    });

    if (!payload || typeof payload !== 'object' || !payload.m_payment_id || !payload.payment_status) {
      console.error('PayFast ITN missing required form fields');
      return res.status(400).send('Invalid payload');
    }
    
    const receivedSignature = String(payload.signature || '');
    const signaturePayload = { ...payload };
    delete signaturePayload.signature;
    const expectedSignature = generateSignature(signaturePayload, config.passphrase);
    const signaturesMatch = receivedSignature.length === expectedSignature.length && crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature),
    );
    if (!signaturesMatch) {
      console.error('PayFast ITN local signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    if (String(payload.merchant_id) !== String(config.merchant_id)) {
      console.error('PayFast ITN merchant mismatch');
      return res.status(400).send('Invalid merchant');
    }

    // Cancelled/failed notices are authenticated but do not change paid inventory.
    if (payload.payment_status !== 'COMPLETE') {
      return res.status(200).send('OK');
    }

    // Completed payments also receive PayFast's server-to-server validation.
    const axios = require('axios');
    let pfParamString = '';
    for (let key in payload) {
      pfParamString += `${key}=${encodeURIComponent(payload[key].toString().trim()).replace(/%20/g, '+')}&`;
    }
    pfParamString = pfParamString.slice(0, -1);

    const isLive = process.env.PAYFAST_IS_LIVE === 'true';
    const validateUrl = isLive ? 'https://www.payfast.co.za/eng/query/validate' : 'https://sandbox.payfast.co.za/eng/query/validate';

    try {
      const validateResponse = await axios.post(validateUrl, pfParamString, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (validateResponse.data !== 'VALID') {
        console.error('PayFast ITN signature mismatch (Validation failed):', validateResponse.data);
        return res.status(400).send('Invalid signature');
      }
    } catch (valErr) {
      console.error('Error contacting PayFast validation endpoint:', valErr.message);
      return res.status(500).send('Validation network error');
    }

    if (payload.payment_status === 'COMPLETE') {
       const reference = payload.m_payment_id;
       if (reference.startsWith('SHP-')) {
          const orderId = reference.replace('SHP-', '');
          await processOrderPayment(orderId);
          console.log(`Successfully processed shop order payment for ${orderId}`);
       } else if (reference.startsWith('AUC-')) {
          const auctionId = reference.replace('AUC-', '');
          await processAuctionPayment(auctionId);
          console.log(`Successfully processed auction payment for ${auctionId}`);
       } else if (reference.startsWith('EVT-')) {
          const bookingId = reference.replace('EVT-', '');
          const booking = await Booking.findById(bookingId).select('totalPrice');
          if (!booking) return res.status(404).send('Event booking not found');
          const paidAmount = Number(payload.amount_gross);
          if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - booking.totalPrice) > 0.01) {
            console.error('PayFast event amount mismatch', { bookingId, paidAmount });
            return res.status(400).send('Payment amount mismatch');
          }
          await processEventPayment(bookingId, {
            gatewayTransactionId: payload.pf_payment_id,
          });
          console.log(`Successfully processed event payment for ${bookingId}`);
       } else if (reference.startsWith('VND-')) {
          const vendorId = reference.replace('VND-', '');
          await processVendorPayment(vendorId);
          console.log(`Successfully processed vendor payment for ${vendorId}`);
       }
    }

    // Always respond 200 OK so PayFast knows we received it
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error in PayFast ITN webhook:', error);
    res.status(500).send('Error');
  }
};
