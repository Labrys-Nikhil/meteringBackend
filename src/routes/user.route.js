const express = require('express')
const router = express.Router();
const userDashboardController = require('../controller/userDashboardController');

//first time data loader userDashbaord.
router.get('/dashboard/init/:id',userDashboardController.init);

//individual api for Userdashboard.
router.get('/chart',userDashboardController.chart);
router.get('/summary',userDashboardController.summary);


module.exports = router;