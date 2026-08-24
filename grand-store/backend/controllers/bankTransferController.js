const Order = require('../models/Order');
const CheckoutEngine = require('../services/CheckoutEngine');
const { processOrderPayment } = require('./orderController');
const mongoose = require('mongoose');

// @desc    Upload Proof of Payment for Bank Transfer
// @route   POST /api/bank-transfer/:orderId/upload-proof
// @access  Private (Customer)
exports.uploadProofOfPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { proofUrl } = req.body; // In reality, this would come from an image upload middleware

    if (!proofUrl) {
      return res.status(400).json({ message: 'Proof of payment URL is required' });
    }

    let order;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({ orderId: orderId });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this order' });
    }

    // Append event
    await CheckoutEngine.appendEvent(orderId, 'ProofOfPaymentUploaded', { proofUrl }, req.user._id);

    // Update read model state
    order.paymentStatus = 'Awaiting_Approval';
    order.proofUrl = proofUrl; // Store the proofUrl in the Order read model for admin viewing
    await order.save();

    res.json({ message: 'Proof of payment uploaded successfully. Awaiting admin approval.', order });
  } catch (error) {
    console.error('Error uploading proof of payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Approve Bank Transfer Payment
// @route   POST /api/bank-transfer/:orderId/approve
// @access  Private (Admin)
exports.approvePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // We process the payment exactly as if PayFast had called the webhook
    await processOrderPayment(orderId); // This appends the PaymentVerified event inside

    res.json({ message: 'Payment approved and order processed successfully' });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reject Bank Transfer Payment
// @route   POST /api/bank-transfer/:orderId/reject
// @access  Private (Admin)
exports.rejectPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await CheckoutEngine.appendEvent(orderId, 'PaymentRejected', { reason }, req.user._id);

    // Update read model
    order.paymentStatus = 'Failed';
    await order.save();

    res.json({ message: 'Payment rejected' });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
