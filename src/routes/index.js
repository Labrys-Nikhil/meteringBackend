const express = require('express');
const router = express.Router();

const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const meterRoutes = require('./meter.route');
const notificationRouter = require('./notification.route');

const allRoutes = {
    user: userRoutes,
    auth: authRoutes,
    meter: meterRoutes,
    notification: notificationRouter
}

// Mounting the routes
router.use('/user', allRoutes.user);
router.use('/auth', allRoutes.auth);
router.use('/meter', allRoutes.meter);
router.use('/notifications', allRoutes.notification);


module.exports = router;