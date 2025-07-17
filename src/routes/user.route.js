const express = require('express')
const router = express.Router();
const userDashboardController = require('../controller/userDashboardController');

//first time data loader userDashbaord.
router.get('/dashboard/init',userDashboardController.init);

//individual api for Userdashboard.


module.exports = router;