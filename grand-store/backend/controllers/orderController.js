const Order = require('../models/Order');
const Product = require('../models/Product');
const SystemCode = require('../models/SystemCode');
const { getNextSequence } = require('../utils/sequenceGenerator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Fetch module code for Shop
    const shopCodeDoc = await SystemCode.findOne({ code: 'SHP' });
    const moduleCode = shopCodeDoc ? shopCodeDoc.code : 'SHP';

    // Generate atomic sequence
    const year = new Date().getFullYear().toString().slice(-2);
    const seqNum = await getNextSequence('shopOrder');
    const sequence = seqNum.toString().padStart(6, '0');
    
    // Segmented IDs
    const transactionId = `GS-${year}-${moduleCode}-TXN-${sequence}`;
    const orderId = `GS-${year}-${moduleCode}-ORD-${sequence}`;
    const paymentId = `GS-${year}-${moduleCode}-PAY-${sequence}`;
    const invoiceNumber = `GS-${year}-${moduleCode}-INV-${sequence}`;

    // Map orderItems to include vendorId from the Product DB safely
    const enrichedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        const productId = item.product || item.id || item._id;
        // Try to find the product by custom 'id' (e.g. prod_12345)
        let product = await Product.findOne({ id: productId }).catch(() => null);
        
        // Fallback: If not found and it's a valid ObjectId, try finding by _id
        if (!product && productId && /^[0-9a-fA-F]{24}$/.test(productId.toString())) {
          product = await Product.findById(productId).catch(() => null);
        }

        return {
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          option: item.option,
          product: product ? product._id : productId, // Use original ID if not found
          vendorId: product ? product.vendorId : null, 
        };
      })
    );

    const order = new Order({
      orderItems: enrichedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      totalPrice,
      transactionId,
      orderId,
      paymentId,
      invoiceNumber,
      isPaid: true, // Simulated payment
      paidAt: Date.now(),
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Add Order Error:', error);
    res.status(500).json({ message: 'Server Error adding order' });
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

// @desc    Get logged in vendor orders/sales
// @route   GET /api/orders/vendor/sales
// @access  Private (Vendor only)
const getVendorOrders = async (req, res) => {
  try {
    // Find all orders that contain at least one item with this vendor's ID
    const orders = await Order.find({
      'orderItems.vendorId': req.user._id
    }).sort({ createdAt: -1 }).populate('user', 'name email');

    // Format the response so the vendor only sees their items, not other vendors' items in a mixed cart
    const vendorSales = orders.map(order => {
      const vendorItems = order.orderItems.filter(item => 
        item.vendorId && item.vendorId.toString() === req.user._id.toString()
      );
      
      const vendorTotal = vendorItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      return {
        _id: order._id,
        invoiceNumber: order.invoiceNumber,
        createdAt: order.createdAt,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        shippingAddress: order.shippingAddress,
        items: vendorItems,
        vendorTotal,
        customerName: order.user ? order.user.name : 'Guest',
      };
    }).filter(sale => sale.items.length > 0);

    res.json(vendorSales);
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
