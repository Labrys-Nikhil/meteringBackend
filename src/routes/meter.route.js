const express = require('express');
const meterDataController = require('../controller/meterDataController');
const router = express.Router();

//get the meter data from the smartlynk-platform
router.post('/meter-data', meterDataController.saveMeterReading);

//meter.
router.get('/meters', meterDataController.getAllMeters);
router.get('/meter/:id', meterDataController.getMeterById);
router.post('/add-meter', meterDataController.addMeter);
router.put('/update-meter/:id', meterDataController.updateMeter);
router.delete('/delete-meter/:id', meterDataController.deleteMeter);

module.exports = router;