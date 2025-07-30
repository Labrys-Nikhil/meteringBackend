const express = require('express');
const router = express.Router();

const  userRoutes  = require('./user.route');
const  authRoutes  = require('./auth.route');
const  meterRoutes  = require('./meter.route');

const allRoutes = {
    user: userRoutes,
    auth: authRoutes,
    meter: meterRoutes,
    
}

router.use('/user', allRoutes.user);
router.use('/auth', allRoutes.auth);
router.use('/meter', allRoutes.meter);

module.exports = router;