const cron = require('node-cron');
const {dailyDataCollectionPerMeter} = require('../helper/DailyDataCollectionJOB');


const scheduleMidnightJob = () => {
  // Runs every day at 12:00 AM
  cron.schedule('0 0 * * *', () => {
    dailyDataCollectionPerMeter();
  });
};

module.exports = {scheduleMidnightJob};