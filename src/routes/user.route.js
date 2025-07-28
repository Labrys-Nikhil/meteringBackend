const express = require('express')
const router = express.Router();
const userDashboardController = require('../controller/userDashboardController');
const userController = require('../controller/userController');
const {authenticateToken} = require('../middleware/authenticateToken');
const adminController = require("../controller/adminDashboardController");


//first time data loader userDashbaord.
router.get('/dashboard/init/:id',authenticateToken,userDashboardController.init);
router.get('/profile',authenticateToken,userDashboardController.profile);

//individual api for Userdashboard.
router.get('/chart',authenticateToken,userDashboardController.chart);
router.get('/summary',authenticateToken,userDashboardController.summary);

router.post("/create-user", userController.createUser);
router.patch("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-user/:id", userController.getUserById);
router.get("/users", userController.getUsers);

//adminDahboardRoute
router.get("/recent-data/:adminId", adminController.getLatestDashboardStat);
router.get("/get-admin-daily-consumption/:adminId", adminController.fetchAdminDailyConsumption);
router.get("/get-userdata-by-admin/:adminId", adminController.getUserDataByAdminId);
router.get("/get-meter-by-admin/:adminId", adminController.getMeterDataByAdminId);
router.post("/add-admin-stats", adminController.addAdminDashboardStats);



module.exports = router;