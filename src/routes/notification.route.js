const express = require('express');
const notificationRouter = express.Router();

const notificationController = require('../controller/notificationcontroller');


notificationRouter.get('/user/:userId', notificationController.getUserNotifications);

module.exports = notificationRouter;