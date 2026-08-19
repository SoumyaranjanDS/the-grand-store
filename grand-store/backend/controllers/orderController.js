const Order = require('../models/Order');
const Product = require('../models/Product');
const SystemCode = require('../models/SystemCode');
const PlatformSettings = require('../models/PlatformSettings');
const { getNextSequence } = require('../utils/sequenceGenerator');

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
    // so totalPrice only includes subTotal + shipping + vat.
    const calculatedTotal = parseFloat((subTotal + shippingCost + vatAmount).toFixed(2));
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
      
      const vId = shp.vendorId.toString();
      const vendorGross = shp.subtotal;
      const vendorCommission = parseFloat(((vendorGross * commissionPct) / 100).toFixed(2));
      const vendorNet = parseFloat((vendorGross - vendorCommission).toFixed(2)); // VAT is withheld/paid by GS generally in this model

      vendorPayables.push({
        vendorId: shp.vendorId,
        grossAmount: vendorGross,
        commission: vendorCommission,
        vatDeducted: shp.taxData.vatAmount, // Keeping record
        netPayable: vendorNet
      });

      // Create Shipment Record
      const shipmentSeqString = `${sequence}-${shipmentSeqCounter.toString().padStart(2, '0')}`;
      const shipmentId = `GS-${year}-${moduleCode}-SHP-${shipmentSeqString}`;

      const newShipment = new Shipment({
        shipmentId,
        orderId: order._id,
        orderRef: order.orderId,
        vendorId: shp.vendorId,
        customerId: req.user._id,
        pickupAddress: { country: shp.originCountry }, // Expanded later from Vendor profile
        deliveryAddress: shippingAddress,
        courierName: shp.selectedCourier ? shp.selectedCourier.courierName : 'Vendor Managed',
        serviceLevel: shp.selectedCourier ? shp.selectedCourier.serviceLevel : 'Standard',
        shippingCost: shp.selectedCourier ? shp.selectedCourier.cost : 0,
        status: 'Order Confirmed'
      });

      await newShipment.save();
      order.shipments.push(newShipment._id);
      shipmentSeqCounter++;
    }

    order.orderItems = allOrderItems;
    order.vendorPayables = vendorPayables;

    const createdOrder = await order.save();
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
    const order = await Order.findById(req.params.id).populate('user', 'name email');
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
        courierName: shp.courierName,
        shippingCost: shp.shippingCost,
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
