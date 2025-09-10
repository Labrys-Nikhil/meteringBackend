const express = require('express');
const notificationRouter = express.Router();

const notificationController = require('../controller/notificationcontroller');
const { authenticateToken } = require('../middleware/authenticateToken');

notificationRouter.use(authenticateToken);

notificationRouter.get('/user/:userId', notificationController.getUserNotifications);

notificationRouter.get('/admin/:adminId', notificationController.getAdminNotifications);

// PATCH /notifications/status/:userId
notificationRouter.patch('/status/:userId', notificationController.updateNotificationStatusByUserId);


// custom notification 
notificationRouter.post("/create-alert",notificationController.addAlertCondition)


module.exports = notificationRouter;