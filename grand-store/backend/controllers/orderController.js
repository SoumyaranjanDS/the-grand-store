const Order = require('../models/Order');
const Product = require('../models/Product');
const SystemCode = require('../models/SystemCode');
const PlatformSettings = require('../models/PlatformSettings');
const { getNextSequence } = require('../utils/sequenceGenerator');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { quote, shippingAddress, paymentMethod } = req.body;

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
    // The quote contains the exact calculated values.
    const subTotal = quote.globalSubtotal;
    const shippingCost = quote.aggregatedTotals.shipping;
    const vatAmount = quote.aggregatedTotals.vat;
    const importDuties = quote.aggregatedTotals.estimatedImportDuties;
    const importTaxes = quote.aggregatedTotals.estimatedImportTaxes;
    const customsFees = quote.aggregatedTotals.estimatedCustomsFees;
    
    // Note: In DDP we might add duties to totalPrice. For now we assume DAP (Duties are paid at customs by customer)
    // VAT is deducted from the vendor, so the customer ONLY pays Subtotal + Shipping.
    const calculatedTotal = parseFloat((subTotal + shippingCost).toFixed(2));
    const commissionAmount = parseFloat(((subTotal * commissionPct) / 100).toFixed(2));
    const gatewayFeeAmount = parseFloat((calculatedTotal * gatewayFeePct / 100).toFixed(2));

    // Consolidate Order Items from Shipments for the Master Order
    let allOrderItems = [];
    let vendorPayables = [];

    // Create the master order first (without shipments array yet, we'll push them)
    const order = new Order({
      user: req.user._id,
      shippingAddress,
      paymentMethod,
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
      isPaid: true,
      paidAt: Date.now(),
      paymentStatus: 'Paid',
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
      
      // Vendor gets: Subtotal - Commission - VAT + Shipping
      const vendorNet = parseFloat((vendorGross - vendorCommission - vendorVat + shippingCostVendorGets).toFixed(2));

      vendorPayables.push({
        vendorId: shp.vendorId,
        grossAmount: vendorGross,
        commission: vendorCommission,
        vatDeducted: vendorVat,
        netPayable: vendorNet
      });

      // Create Shipment Record
      const shipmentSeqString = `${sequence}-${shipmentSeqCounter.toString().padStart(2, '0')}`;
      const shipmentId = `GS-${year}-${moduleCode}-SHP-${shipmentSeqString}`;

      // Calculate actual internal cost
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
        pickupAddress: { country: shp.originCountry }, // Expanded later from Vendor profile
        deliveryAddress: shippingAddress,
        customerShippingCharge: shp.selectedCourier ? shp.selectedCourier.cost : 0,
        actualShippingCost: actualCost,
        legs: internalLegs,
        status: 'Order Confirmed'
      });

      await newShipment.save();
      order.shipments.push(newShipment._id);
      shipmentSeqCounter++;
    }

    order.orderItems = allOrderItems;
    order.vendorPayables = vendorPayables;

    const createdOrder = await order.save();

    // === GENERATE ACCOUNTING LEDGER ===
    
    // 1. Customer Payment Transaction
    const customerPaymentTxn = new Transaction({
      gsReference: transactionId,
      type: 'payment',
      module: 'shop',
      amount: calculatedTotal,
      netAmount: parseFloat((calculatedTotal - gatewayFeeAmount).toFixed(2)),
      customer: req.user._id,
      order: createdOrder._id,
      status: 'cleared',
      description: 'Customer order payment'
    });
    await customerPaymentTxn.save();

    // 2. Grand Store Commission Transaction
    if (commissionAmount > 0) {
      const gsCommSeqNum = await getNextSequence('shopOrder');
      const commissionTxn = new Transaction({
        gsReference: `GS-${year}-${moduleCode}-COM-${gsCommSeqNum.toString().padStart(6, '0')}`,
        type: 'commission',
        module: 'shop',
        amount: commissionAmount,
        netAmount: commissionAmount,
        order: createdOrder._id,
        status: 'cleared',
        description: 'Marketplace commission from order'
      });
      await commissionTxn.save();
    }

    // 2.5 VAT Transaction
    if (vatAmount > 0) {
      const gsVatSeqNum = await getNextSequence('shopOrder');
      const vatTxn = new Transaction({
        gsReference: `GS-${year}-${moduleCode}-VAT-${gsVatSeqNum.toString().padStart(6, '0')}`,
        type: 'vat',
        module: 'shop',
        amount: vatAmount,
        netAmount: vatAmount,
        order: createdOrder._id,
        status: 'cleared',
        description: 'VAT collected from order'
      });
      await vatTxn.save();
    }

    // 3. Vendor Payable Transactions & Wallet Updates
    for (const payable of vendorPayables) {
      if (!payable.vendorId) continue; // Skip admin-owned items

      const vendorSeqNum = await getNextSequence('shopOrder');
      const payableTxn = new Transaction({
        gsReference: `GS-${year}-${moduleCode}-PAYABLE-${vendorSeqNum.toString().padStart(6, '0')}`,
        type: 'payout',
        module: 'shop',
        amount: payable.netPayable,
        netAmount: payable.netPayable,
        vendor: payable.vendorId,
        order: createdOrder._id,
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

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Add Order Error:', error);
    res.status(500).json({ message: 'Server Error adding order', error: error.message });
  }
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
    
    const shipments = await Shipment.find({ vendorId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email');

    // Attach items from the master order
    const populatedShipments = await Promise.all(shipments.map(async (shp) => {
      const masterOrder = await Order.findById(shp.orderId);
      let items = [];
      if (masterOrder) {
        items = masterOrder.orderItems.filter(item => item.vendorId && item.vendorId.toString() === req.user._id.toString());
      }
      
      return {
        _id: shp._id,
        shipmentId: shp.shipmentId,
        orderRef: shp.orderRef,
        createdAt: shp.createdAt,
        status: shp.status,
        courierName: shp.legs && shp.legs.length > 0 ? shp.legs[0].courierName : 'Vendor Managed',
        shippingCost: shp.customerShippingCharge,
        trackingNumber: shp.trackingNumber,
        deliveryAddress: shp.deliveryAddress,
        customerName: shp.customerId ? shp.customerId.name : 'Guest',
        items: items,
        vendorTotal: items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      };
    }));

    res.json(populatedShipments);
  } catch (error) {
    console.error('Get Vendor Orders Error:', error);
    res.status(500).json({ message: 'Server Error getting vendor orders' });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getVendorOrders,
  getMyOrders
};
