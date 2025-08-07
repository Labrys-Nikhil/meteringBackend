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