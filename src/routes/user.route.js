const express = require('express')
const router = express.Router();
const userDashboardController = require('../controller/userDashboardController');
const userController = require('../controller/userController');
const {authenticateToken} = require('../middleware/authenticateToken');
const adminController = require("../controller/adminDashboardController");
const paymentController = require('../controller/paymentController');


//first time data loader userDashbaord.
router.get('/dashboard/init/:id',authenticateToken,userDashboardController.init);
router.get('/profile',authenticateToken,userDashboardController.profile);
router.put('/update-profile',authenticateToken,userDashboardController.updateProfile)

//individual api for Userdashboard.
router.get('/chart',authenticateToken,userDashboardController.chart);
router.get('/summary',authenticateToken,userDashboardController.summary);

router.post("/create-user", userController.createUser);
router.patch("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-user/:id", userController.getUserById);
router.get("/users", userController.getUsers);

//adminDahboardRoute
router.get("/adminDashboard/recent-data/:adminId", adminController.getLatestDashboardStat);
router.get("/adminDashboard/get-admin-daily-consumption/:adminId", adminController.fetchAdminDailyConsumption);
router.get("/adminDashboard/get-userdata-by-admin/:adminId", adminController.getUserDataByAdminId);
router.get("/adminDashboard/get-meter-by-admin/:adminId", adminController.getMeterDataByAdminId);
router.post("/adminDashboard/add-admin-stats", adminController.addAdminDashboardStats);

//payment
router.get("/get-payment-history-by/:meterId", paymentController.getPaymentsForMeterId)
router.get("/negative-payments/:adminId", paymentController.getNegativePayments)



module.exports = router;