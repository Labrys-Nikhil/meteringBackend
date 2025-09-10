const NotificationModel = require('../model/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notification = await NotificationModel.findOne({ userId })
      .populate('userId', 'name email role')
      .populate('meterId', 'meterId name location');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'No notifications found for this user',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User notifications fetched successfully',
      data: notification
    });

  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};





const mongoose = require('mongoose');


// const mongoose = require('mongoose');
// const NotificationModel = require('../models/NotificationModel'); // adjust path

exports.getAdminNotifications = async (req, res) => {
  try {
    const { adminId } = req.params;

    console.log("Searching notifications for adminId:", adminId);

    // Ensure adminId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adminId format'
      });
    }

    // Convert to ObjectId for consistency
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    // const notifications = await NotificationModel.find({ adminId: adminObjectId })
    //   .populate('userId', 'name email role')          // User info
    //   .populate('meterId', 'meterId name location')   // Meter info
    //   // .populate({
    //   //   path: 'userNotification.userId',              // Nested user inside notification (if any)
    //   //   select: 'name email role'
    //   // })
    //   // .populate({
    //   //   path: 'userNotification.meterId',             // Nested meter inside notification (if any)
    //   //   select: 'meterId name location'
    //   // })
    //   .sort({ createdAt: -1 });
const notifications = await NotificationModel.find({
  adminId: adminObjectId
})
.populate('userId', 'name email role')
.populate('meterId', 'meterId name location')
.sort({ createdAt: -1 });
    console.log(`Found ${notifications.length} notifications for adminId ${adminId}`);

    if (!notifications.length) {
      return res.status(404).json({
        success: false,
        message: 'No notifications found for this admin',
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin notifications fetched successfully',
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};








// Update notification status for a given userId
exports.updateNotificationStatusByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // expects { status: "enabled" } or { status: "disabled" }
    console.log("==============",userId,status)

    // Validate status value
    if (!['enabled', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be "enabled" or "disabled".'
      });
    }

    // Find and update
    const updatedNotification = await NotificationModel.findOneAndUpdate(
      { userId },
      { status },
      { new: true }
    )
      .populate('userId', 'name email role')
      .populate('meterId', 'meterId name location');

    if (!updatedNotification) {
      return res.status(404).json({
        success: false,
        message: 'No notification found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Notification status updated to "${status}" successfully`,
      data: updatedNotification
    });

  } catch (error) {
    console.error('Error updating notification status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



// // controllers/notificationController.js
// const NotificationModel = require("../model/Notification");

exports.addAlertCondition = async (req, res) => {
  try {
    const { adminId, userId, meterId, alertName, condition, value, notificationModes, isActive } = req.body;

    // Prepare the new alert condition
    const newAlertCondition = {
      alertName,
      condition,
      value,
      notificationModes,
      isActive
    };
    // console.log("======req======",req)
    // console.log("======req.body======",req.body,req.user)


    // Find existing notification entry
    let notification = await NotificationModel.findOne({
          meterId,
          userId,
      adminId: adminId || null,

  
    });
    // console.log("===notification==",notification)

    if (!notification) {
      // No existing document → Create new
      notification = new NotificationModel({
        adminId: adminId || null,
        userId,
        meterId,
        alertConditions: [newAlertCondition]
      });
      await notification.save();
      return res.status(201).json({
        success: true,
        message: "Notification created with first alert condition",
        data: notification
      });
    }

    // Existing document → Add new alert condition
    notification.alertConditions.push(newAlertCondition);
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Alert condition added to existing notification",
      data: notification
    });
// return 
  } catch (error) {
    console.error("Error adding alert condition:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


