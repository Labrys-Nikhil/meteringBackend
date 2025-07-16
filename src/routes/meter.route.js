const express = require('express');
const meterController = require('../controller/meterController');
const meterDataController = require('../controller/meterDataController');
const router = express.Router();

//get the meter data from the smartlynk-platform
router.post('/meter-data', meterDataController.saveMeterReading);

//meter.
router.get('/get-all-meter', meterController.getAllMeters);
router.get('/:id', meterController.getMeterById);
router.post('/create', meterController.addMeter);
router.post('/assign-meter',meterController.assignMeter);
router.put('/update/:id', meterController.updateMeter);
router.delete('/delete/:id', meterController.deleteMeter);

module.exports = router;