const express = require('express');
const router = express.Router();

const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const meterRoutes = require('./meter.route');
const notificationRouter = require('./notification.route');

const { authenticateToken } = require('../middleware/authenticateToken');
const alertRouter = require('./alert.route');
const rolesRouter = require('./roles.route');
const ticketRouter = require('./ticket.route');
const allRoutes = {
    user: userRoutes,
    auth: authRoutes,
    meter: meterRoutes,
    notification: notificationRouter,
   
    alert:alertRouter,
    ticket: ticketRouter,
    roles:rolesRouter

}

// Mounting the routes
router.use('/user', allRoutes.user);
router.use('/auth', allRoutes.auth);
router.use('/meter', allRoutes.meter);
router.use('/notifications', allRoutes.notification);

router.use('/alert',allRoutes.alert);
router.use('/ticket', allRoutes.ticket);
router.use('/roles', allRoutes.roles);


module.exports = router;