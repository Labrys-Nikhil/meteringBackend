const express = require('express');
const meterController = require('../controller/meterController');
const meterDataController = require('../controller/meterDataController');
const router = express.Router();

//meterDataController
//get the meter data from the smartlynk-platform
router.post('/meter-data', meterDataController.saveMeterReading);
router.get('/most-recent-data/:id',meterDataController.getAllMetersDataByUserID);


//meterController
//meter spcific apis
router.get('/get-all-meter', meterController.getAllMeters);
router.get('/:id', meterController.getMeterById);
router.post('/create', meterController.addMeter);
router.post('/assign-meter',meterController.assignMeter);
router.put('/update/:id', meterController.updateMeter);
router.delete('/delete/:id', meterController.deleteMeter);



module.exports = router;