const OrderEvent = require('../models/OrderEvent');

class CheckoutEngine {
  /**
   * Appends a new event to the order stream.
   * Ensures optimistic concurrency by checking the latest version.
   */
  static async appendEvent(streamId, eventType, payload, createdBy = null) {
    // Find the latest version
    const lastEvent = await OrderEvent.findOne({ streamId }).sort({ version: -1 });
    const nextVersion = lastEvent ? lastEvent.version + 1 : 1;

    const event = new OrderEvent({
      streamId,
      eventType,
      payload,
      version: nextVersion,
      createdBy
    });

    await event.save();
    return event;
  }

  /**
   * Retrieves all events for a given order stream.
   */
  static async getEvents(streamId) {
    return await OrderEvent.find({ streamId }).sort({ version: 1 });
  }

  /**
   * Rehydrates the order state from the event stream.
   */
  static async getOrderState(streamId) {
    const events = await this.getEvents(streamId);
    if (!events || events.length === 0) return null;

    return this.reduceEvents(events);
  }

  /**
   * Reducer logic to compute the current state based on an event stream.
   */
  static reduceEvents(events) {
    const state = {
      streamId: events[0].streamId,
      status: 'Initialized',
      items: [],
      customer: null,
      shipments: [],
      paymentMethod: null,
      paymentStatus: 'Pending',
      proofOfPaymentUrl: null,
      totals: {
        subTotal: 0,
        shippingCost: 0,
        vatAmount: 0,
        totalPrice: 0
      },
      createdAt: events[0].timestamp,
      updatedAt: events[events.length - 1].timestamp,
      version: events[events.length - 1].version
    };

    for (const event of events) {
      switch (event.eventType) {
        case 'CheckoutInitiated':
          state.items = event.payload.items || [];
          state.customer = event.payload.customer || null;
          state.status = 'Checkout_Started';
          break;
        case 'DeliveryCalculated':
          state.shipments = event.payload.shipments || [];
          state.totals.shippingCost = event.payload.totalShippingCost || 0;
          break;
        case 'PaymentMethodSelected':
          state.paymentMethod = event.payload.method;
          break;
        case 'OrderPlaced':
          state.status = 'Order_Placed';
          state.totals = { ...state.totals, ...event.payload.totals };
          break;
        case 'ProofOfPaymentUploaded':
          state.status = 'Awaiting_Admin_Approval';
          state.proofOfPaymentUrl = event.payload.proofUrl;
          break;
        case 'PaymentVerified':
          state.status = 'Processing'; // Approved! Vendor can now see it.
          state.paymentStatus = 'Paid';
          break;
        case 'PaymentRejected':
          state.status = 'Payment_Rejected';
          state.paymentStatus = 'Failed';
          state.rejectReason = event.payload.reason;
          break;
        case 'PaymentFailed':
          state.status = 'Payment_Failed';
          state.paymentStatus = 'Failed';
          break;
        case 'ShipmentBooked':
        case 'ShipmentDispatched':
          state.status = 'Shipped';
          break;
        case 'ShipmentDelivered':
          state.status = 'Delivered';
          break;
        case 'OrderCompleted':
          state.status = 'Completed';
          break;
        case 'OrderCancelled':
          state.status = 'Cancelled';
          break;
      }
    }

    return state;
  }
}

module.exports = CheckoutEngine;
