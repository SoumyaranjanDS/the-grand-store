const Order = require('../models/Order');
const Product = require('../models/Product');
const SystemCode = require('../models/SystemCode');
const PlatformSettings = require('../models/PlatformSettings');
const { getNextSequence } = require('../utils/sequenceGenerator');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

// @desc    Create new order (Pending Payment)
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { quote, shippingAddress, paymentMethod, isGift, giftRecipientName, giftMessage } = req.body;

    if (!quote || !quote.shipments || quote.shipments.length === 0) {
      return res.status(400).json({ message: 'Valid quote with shipments is required' });
    }
    
    // Check expiration
    if (new Date(quote.expiresAt) < new Date()) {
       return res.status(400).json({ message: 'Quote has expired. Please refresh the quote.' });
    }

    // Fetch fee settings from DB for GS Commission
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});

    // Fetch module code for Shop
    const shopCodeDoc = await SystemCode.findOne({ code: 'SHP' });
    const moduleCode = shopCodeDoc ? shopCodeDoc.code : 'SHP';

    // Generate atomic sequence
    const year = new Date().getFullYear().toString().slice(-2);
    const seqNum = await getNextSequence('shopOrder');
    const sequence = seqNum.toString().padStart(6, '0');

    const transactionId = `GS-${year}-${moduleCode}-TXN-${sequence}`;
    const orderId = `GS-${year}-${moduleCode}-ORD-${sequence}`;
    const paymentId = `GS-${year}-${moduleCode}-PAY-${sequence}`;
    const invoiceNumber = `GS-${year}-${moduleCode}-INV-${sequence}`;

    const commissionPct = settings.marketplaceCommissionPct || 15;
    const gatewayFeePct = settings.gatewayFeePct || 2.5;

    // === RECONSTRUCT ACCOUNTING FROM QUOTE ===
    const subTotal = quote.globalSubtotal;
    const shippingCost = quote.aggregatedTotals.shipping;
    const vatAmount = quote.aggregatedTotals.vat;
    const importDuties = quote.aggregatedTotals.estimatedImportDuties;
    const importTaxes = quote.aggregatedTotals.estimatedImportTaxes;
    const customsFees = quote.aggregatedTotals.estimatedCustomsFees;
    
    const calculatedTotal = parseFloat((subTotal + shippingCost).toFixed(2));
    const commissionAmount = parseFloat(((subTotal * commissionPct) / 100).toFixed(2));
    const gatewayFeeAmount = parseFloat((calculatedTotal * gatewayFeePct / 100).toFixed(2));

    let allOrderItems = [];
    let vendorPayables = [];

    // Create the master order with isPaid: false
    const order = new Order({
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      isGift: isGift || false,
      giftRecipientName: giftRecipientName || "",
      giftMessage: giftMessage || "",
      subTotal,
      shippingCost,
      vatAmount,
      importDuties,
      importTaxes,
      customsFees,
      commissionPct,
      commissionAmount,
      gatewayFeePct,
      gatewayFeeAmount,
      totalPrice: calculatedTotal,
      transactionId,
      orderId,
      paymentId,
      invoiceNumber,
      isPaid: false, // Changed for PayFast integration
      paymentStatus: 'Pending', // Changed for PayFast integration
      orderItems: [],
      shipments: [],
      vendorPayables: []
    });

    // Process Shipments
    const Shipment = require('../models/Shipment');
    let shipmentSeqCounter = 1;

    for (const shp of quote.shipments) {
      allOrderItems = allOrderItems.concat(shp.items);
      
      const vendorGross = shp.subtotal;
      const vendorCommission = parseFloat(((vendorGross * commissionPct) / 100).toFixed(2));
      const vendorVat = shp.taxData.vatAmount;
      const shippingCostVendorGets = shp.selectedCourier ? shp.selectedCourier.cost : 0;
      
      const vendorNet = parseFloat((vendorGross - vendorCommission - vendorVat + shippingCostVendorGets).toFixed(2));

      vendorPayables.push({
        vendorId: shp.vendorId,
        grossAmount: vendorGross,
        commission: vendorCommission,
        vatDeducted: vendorVat,
        netPayable: vendorNet
      });

      const shipmentSeqString = `${sequence}-${shipmentSeqCounter.toString().padStart(2, '0')}`;
      const shipmentId = `GS-${year}-${moduleCode}-SHP-${shipmentSeqString}`;

      let internalLegs = [];
      let actualCost = 0;
      if (shp.selectedCourier && shp.selectedCourier.legs) {
        internalLegs = shp.selectedCourier.legs.map(leg => ({
          courierName: leg.courierName,
          origin: leg.origin,
          destination: leg.destination,
          cost: leg.cost,
          status: 'Pending'
        }));
        actualCost = internalLegs.reduce((sum, leg) => sum + leg.cost, 0);
      }

      const newShipment = new Shipment({
        shipmentId,
        orderId: order._id,
        orderRef: order.orderId,
        vendorId: shp.vendorId,
        customerId: req.user._id,
        pickupAddress: { country: shp.originCountry },
        deliveryAddress: shippingAddress,
        customerShippingCharge: shp.selectedCourier ? shp.selectedCourier.cost : 0,
        actualShippingCost: actualCost,
        legs: internalLegs,
        status: 'Order Confirmed' // We keep it Confirmed, or could change to 'Payment Pending'
      });

      await newShipment.save();
      order.shipments.push(newShipment._id);
      shipmentSeqCounter++;
    }

    order.orderItems = allOrderItems;
    order.vendorPayables = vendorPayables;

    const createdOrder = await order.save();
    
    // === EVENT SOURCING: Log the initial sequence of events ===
    const CheckoutEngine = require('../services/CheckoutEngine');
    
    await CheckoutEngine.appendEvent(createdOrder._id.toString(), 'CheckoutInitiated', {
      customer: req.user._id,
      items: allOrderItems
    }, req.user._id);

    await CheckoutEngine.appendEvent(createdOrder._id.toString(), 'DeliveryCalculated', {
      shipments: quote.shipments,
      totalShippingCost: shippingCost
    }, req.user._id);

    await CheckoutEngine.appendEvent(createdOrder._id.toString(), 'PaymentMethodSelected', {
      method: paymentMethod
    }, req.user._id);

    await CheckoutEngine.appendEvent(createdOrder._id.toString(), 'OrderPlaced', {
      orderId: createdOrder.orderId,
      transactionId: createdOrder.transactionId,
      totals: {
        subTotal,
        shippingCost,
        vatAmount,
        totalPrice: calculatedTotal
      }
    }, req.user._id);

    // Send emails based on payment method
    try {
      const { sendEmail } = require('../utils/emailService');
      const { bankTransferInstructionsTemplate } = require('../utils/emailTemplates');
      const User = require('../models/User');
      const userDoc = await User.findById(req.user._id);

      if (userDoc && paymentMethod === 'Bank Transfer') {
        const bankDetails = {
          bankName: 'FNB',
          accountName: 'The Grand Store',
          accountNumber: '62000000000',
          branchCode: '250655'
        };
        await sendEmail({
          to: userDoc.email,
          subject: `Payment Required - Order #${createdOrder._id}`,
          html: bankTransferInstructionsTemplate(createdOrder, bankDetails)
        });
      }
    } catch (err) {
      console.error('Failed to send bank transfer email:', err);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Add Order Error:', error);
    res.status(500).json({ message: 'Server Error adding order', error: error.message });
  }
};

/**
 * Process the ledger transactions and wallet updates after a successful payment
 * This function will be called by the PayFast ITN Webhook Controller
 */
const processOrderPayment = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (order.isPaid) return true; // Already paid, idempotent

  // Update order status
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentStatus = 'Paid';
  await order.save();
  
  // === EVENT SOURCING: Append PaymentVerified Event ===
  const CheckoutEngine = require('../services/CheckoutEngine');
  await CheckoutEngine.appendEvent(order._id.toString(), 'PaymentVerified', {
    method: 'PayFast / Gateway',
    timestamp: new Date()
  }, null);

  // Send Order Confirmation Email
  try {
    const { sendEmail } = require('../utils/emailService');
    const { orderConfirmationTemplate } = require('../utils/emailTemplates');
    const { generateOrderReceiptBuffer } = require('../utils/pdfService');
    // We need user email, so let's populate user if not already
    const User = require('../models/User');
    const user = await User.findById(order.user);
    if (user) {
      const pdfBuffer = await generateOrderReceiptBuffer(order, user);
      await sendEmail({
        to: user.email,
        subject: `Payment Receipt #${order.invoiceNumber || order.orderId || order._id}`,
        html: orderConfirmationTemplate(order),
        attachments: [
          {
            filename: `Receipt-${order.invoiceNumber || order._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    }
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }

  // === GENERATE ACCOUNTING LEDGER ===
  const shopCodeDoc = await SystemCode.findOne({ code: 'SHP' });
  const moduleCode = shopCodeDoc ? shopCodeDoc.code : 'SHP';
  const year = new Date().getFullYear().toString().slice(-2);

  // 1. Customer Payment Transaction
  const customerPaymentTxn = new Transaction({
    gsReference: order.transactionId,
    type: 'payment',
    module: 'shop',
    amount: order.totalPrice,
    netAmount: parseFloat((order.totalPrice - order.gatewayFeeAmount).toFixed(2)),
    customer: order.user,
    order: order._id,
    status: 'cleared',
    description: 'Customer order payment'
  });
  await customerPaymentTxn.save();

  // 2. Grand Store Commission Transaction
  if (order.commissionAmount > 0) {
    const gsCommSeqNum = await getNextSequence('shopOrder');
    const commissionTxn = new Transaction({
      gsReference: `GS-${year}-${moduleCode}-COM-${gsCommSeqNum.toString().padStart(6, '0')}`,
      type: 'commission',
      module: 'shop',
      amount: order.commissionAmount,
      netAmount: order.commissionAmount,
      order: order._id,
      status: 'cleared',
      description: 'Marketplace commission from order'
    });
    await commissionTxn.save();
  }

  // 2.5 VAT Transaction
  if (order.vatAmount > 0) {
    const gsVatSeqNum = await getNextSequence('shopOrder');
    const vatTxn = new Transaction({
      gsReference: `GS-${year}-${moduleCode}-VAT-${gsVatSeqNum.toString().padStart(6, '0')}`,
      type: 'vat',
      module: 'shop',
      amount: order.vatAmount,
      netAmount: order.vatAmount,
      order: order._id,
      status: 'cleared',
      description: 'VAT collected from order'
    });
    await vatTxn.save();
  }

  // 3. Vendor Payable Transactions & Wallet Updates
  for (const payable of order.vendorPayables) {
    if (!payable.vendorId) continue; // Skip admin-owned items

    const vendorSeqNum = await getNextSequence('shopOrder');
    const payableTxn = new Transaction({
      gsReference: `GS-${year}-${moduleCode}-PAYABLE-${vendorSeqNum.toString().padStart(6, '0')}`,
      type: 'payout',
      module: 'shop',
      amount: payable.netPayable,
      netAmount: payable.netPayable,
      vendor: payable.vendorId,
      order: order._id,
      status: 'pending', // Pending until payout is cleared
      description: 'Vendor payable from order'
    });
    await payableTxn.save();

    // Update Vendor Wallet
    let wallet = await Wallet.findOne({ vendorId: payable.vendorId });
    if (!wallet) {
      wallet = new Wallet({ vendorId: payable.vendorId });
    }
    wallet.pendingBalance += payable.netPayable;
    wallet.totalEarned += payable.netPayable; // Total earned tracks gross earnings
    await wallet.save();
  }

  return true;
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get My Orders Error:', error);
    res.status(500).json({ message: 'Server Error getting my orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('shipments');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ message: 'Server Error getting order' });
  }
};

// @desc    Get logged in vendor orders/sales (Shipments)
// @route   GET /api/orders/vendor/sales
// @access  Private (Vendor only)
const getVendorOrders = async (req, res) => {
  try {
    const Shipment = require('../models/Shipment');
    const Order = require('../models/Order');
    
    const managesInternalOrders = ['admin', 'super_admin', 'product_manager'].includes(req.user.role);
    const filter = managesInternalOrders ? { vendorId: null } : { vendorId: req.user._id };
    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email');

    // Attach items from the master order
    const populatedShipmentsRaw = await Promise.all(shipments.map(async (shp) => {
      const masterOrder = await Order.findById(shp.orderId);
      
      // === EVENT SOURCING: Filter out unapproved / unpaid orders ===
      if (!masterOrder || !masterOrder.isPaid) {
        return null;
      }

      let items = masterOrder.orderItems.filter(item => {
        if (managesInternalOrders) return !item.vendorId;
        return item.vendorId && item.vendorId.toString() === req.user._id.toString();
      });
      
      return {
        _id: shp._id,
        shipmentId: shp.shipmentId,
        orderRef: shp.orderRef,
        createdAt: shp.createdAt,
        status: shp.status,
        courierName: shp.legs && shp.legs.length > 0 ? shp.legs[0].courierName : 'Vendor Managed',
        shippingCost: shp.customerShippingCharge,
        trackingNumber: shp.mainTrackingNumber,
        deliveryAddress: shp.deliveryAddress,
        customerName: shp.customerId ? shp.customerId.name : 'Guest',
        items: items,
        vendorTotal: items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      };
    }));

    // Remove nulls (unpaid/unapproved orders)
    const populatedShipments = populatedShipmentsRaw.filter(shp => shp !== null);

    res.json(populatedShipments);
  } catch (error) {
    console.error('Get Vendor Orders Error:', error);
    res.status(500).json({ message: 'Server Error getting vendor orders' });
  }
};

// @desc    Update a retail shipment's fulfilment status
// @route   PATCH /api/orders/vendor/sales/:shipmentId/status
// @access  Private (Vendor/Product Staff)
const updateShipmentStatus = async (req, res) => {
  try {
    const Shipment = require('../models/Shipment');
    const allowedStatuses = [
      'Order Confirmed',
      'Preparing',
      'Collected',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Delayed',
      'Failed',
    ];
    const status = String(req.body.status || '');
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid shipment status' });
    }

    const shipment = await Shipment.findById(req.params.shipmentId);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const managesInternalOrders = ['admin', 'super_admin', 'product_manager'].includes(req.user.role);
    const ownsShipment = shipment.vendorId?.toString() === req.user._id.toString();
    if ((!shipment.vendorId && !managesInternalOrders) || (shipment.vendorId && !ownsShipment)) {
      return res.status(403).json({ message: 'Not authorized to update this shipment' });
    }

    shipment.status = status;
    shipment.actualDeliveryDate = status === 'Delivered' ? new Date() : shipment.actualDeliveryDate;
    await shipment.save();
    res.json({ _id: shipment._id, status: shipment.status, actualDeliveryDate: shipment.actualDeliveryDate });
  } catch (error) {
    console.error('Update Shipment Status Error:', error);
    res.status(500).json({ message: 'Server Error updating shipment status' });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getVendorOrders,
  updateShipmentStatus,
  getMyOrders,
  processOrderPayment // Exported for ITN webhook
};
