const express = require('express');
const meterController = require('../controller/meterController');
const meterDataController = require('../controller/meterDataController');
const { authenticateToken } = require('../middleware/authenticateToken');
const router = express.Router();

//meterDataController
//get the meter data from the smartlynk-platform
router.post('/meter-data', meterDataController.saveMeterReading);
router.get('/get-all-meter-from-iot',meterDataController.getMeterDatafromSmartlynk);
//testing cron job
router.get('/test-daily-job',meterDataController.testCron); 

router.post('/send-downlink-command-iot',authenticateToken, meterDataController.sendDownlink);


router.get('/most-recent-data/:id',authenticateToken,meterDataController.getAllMetersDataByUserID);

//meterController
//meter spcific apis
router.get('/get-meterdata-daily',authenticateToken,meterDataController.getMeterDataDaily);//user specific
router.get('/get-meterdata-30days',authenticateToken,meterDataController.getMeterData30Days);//user specific
//get all meter with payment data
router.get('/get-all-meter-with-payment',authenticateToken, meterController.getAllMetersWithPaymentData);
router.post('/create',authenticateToken, meterController.addMeter);
router.post('/assign-meter',authenticateToken,meterController.assignMeter);
router.get('/get-all-meter',authenticateToken, meterController.getAllMeters);
router.get('/:id',authenticateToken, meterController.getMeterById);
router.put('/update/:id',authenticateToken, meterController.updateMeter);
router.delete('/delete/:id',authenticateToken, meterController.deleteMeter);
router.get('/by-meterId/:meterId',authenticateToken, meterController.getMeterByMeterId);



module.exports = router;