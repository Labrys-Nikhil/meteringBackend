


const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    alertType: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    mode: {
      type: String,
      enum: ["Text", "Email"],
    },
    time: {
      type: Date,
      required: true,
    },
    notificationCategory: {
      type: String,
      enum: ["custom", "automated"],
      default: "automated",
    },
  },
  { _id: true }
);

const NotificationModelSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meter",
      required: true,
    },
    status: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled",
    },
    lastNotificationDate: {
      type: Date,
    },
    userNotification: [NotificationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationModel", NotificationModelSchema);