

const mongoose = require('mongoose');

// Subdocument schema for individual notifications
const NotificationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
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
    enum: ['Text', 'Email'],
  },
  time: {
    type: Date,
    required: true,
  }
}, { _id: true });


// Main Notification model
const NotificationModelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 🔗 Reference to User model
    required: true,
  },
  meterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meter', // 🔗 Reference to Meter model
    required: true,
  },
  status: {
    type: String,
    enum: ['enabled', 'disabled'],
    default: 'enabled',
  },
  lastNotificationDate: {
    type: Date,
  },
  userNotification: [NotificationSchema] // Array of alert objects
}, { timestamps: true });

module.exports = mongoose.model('NotificationModel', NotificationModelSchema);
