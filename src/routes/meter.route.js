const express = require('express');
const meterController = require('../controller/meterController');
const meterDataController = require('../controller/meterDataController');
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();

//meterDataController
//get the meter data from the smartlynk-platform
router.post('/meter-data', meterDataController.saveMeterReading);
router.get('/get-all-meter-from-iot',meterDataController.getMeterDatafromSmartlynk);
//router.post('/send-downlink-command-iot',meterDataController.sendDownlink);


router.get('/most-recent-data/:id',authenticateToken,meterDataController.getAllMetersDataByUserID);


//meterController
//meter spcific apis
router.get('/get-all-meter',authenticateToken, meterController.getAllMeters);
router.get('/:id',authenticateToken, meterController.getMeterById);
router.post('/create',authenticateToken, meterController.addMeter);
router.post('/assign-meter',authenticateToken,meterController.assignMeter);
router.put('/update/:id',authenticateToken, meterController.updateMeter);
router.delete('/delete/:id',authenticateToken, meterController.deleteMeter);


router.get('/by-meterId/:meterId',authenticateToken, meterController.getMeterByMeterId);
router.get('/get-all-meter-with-payment',authenticateToken, meterController.getAllMetersWithPaymentData);


module.exports = router;