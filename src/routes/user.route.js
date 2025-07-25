const express = require('express')
const router = express.Router();
const userDashboardController = require('../controller/userDashboardController');
const {authenticateToken} = require('../middleware/authenticateToken');


//first time data loader userDashbaord.
router.get('/dashboard/init/:id',authenticateToken,userDashboardController.init);
router.get('/profile',authenticateToken,userDashboardController.profile);

//individual api for Userdashboard.
router.get('/chart',authenticateToken,userDashboardController.chart);
router.get('/summary',authenticateToken,userDashboardController.summary);


module.exports = router;