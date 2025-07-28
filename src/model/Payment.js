const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Cash", "Wallet", "Other"],
      default: "Other",
    },

    transactionId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["success", "pending", "failed", "refunded"],
      default: "success",
    },

    remarks: {
      type: String,
      default: "",
    },

    invoiceUrl: {
      type: String,
      default: null,
    },

    receiptNumber: {
      type: String,
      default: null,
    },

    source: {
      type: String,
      enum: ["web", "mobile", "manual", "api"],
      default: "web",
    },

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
    },

    ipAddress: {
      type: String,
      default: null,
    },

    deviceInfo: {
      type: String,
      default: null,
    },

    refund: {
      refundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      refundReason: {
        type: String,
        default: null,
      },
      refundTimestamp: {
        type: Date,
        default: null,
      },
    },

    referrerCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema)