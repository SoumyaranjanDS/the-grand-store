const mongoose = require("mongoose");

const orderEventSchema = new mongoose.Schema(
  {
    streamId: {
      type: String,
      required: true,
      index: true,
      description:
        "The Order ID or unique reference linking this event stream.",
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "CheckoutInitiated",
        "DeliveryCalculated",
        "PaymentMethodSelected",
        "OrderPlaced",
        "ProofOfPaymentUploaded",
        "PaymentVerified",
        "PaymentRejected",
        "PaymentFailed",
        "VendorNotified",
        "ShipmentBooked",
        "ShipmentDispatched",
        "ShipmentDelivered",
        "OrderCompleted",
        "OrderCancelled",
      ],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    version: {
      type: Number,
      required: true,
      description:
        "Version number for optimistic concurrency control within the stream.",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      description: "The user, vendor, or admin who triggered the event.",
    },
  },
  { timestamps: true },
);

// Compound index to ensure that a stream doesn't have duplicate versions
orderEventSchema.index({ streamId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("OrderEvent", orderEventSchema);
