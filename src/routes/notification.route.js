const express = require('express');
const notificationRouter = express.Router();

const notificationController = require('../controller/notificationController');


notificationRouter.get('/user/:userId', notificationController.getUserNotifications);

module.exports = notificationRouter;