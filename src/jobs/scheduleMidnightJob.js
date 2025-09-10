const cron = require('node-cron');
const { dailyDataCollectionPerMeter } = require('../helper/DailyDataCollectionJOB');
const { addAdminDashboardStat } = require('../service/adminDashboardService');


const scheduleMidnightJob = () => {
  // Runs every day at 12:00 AM
  cron.schedule('0 0 * * *', () => {
    dailyDataCollectionPerMeter();
  });

  cron.schedule('0 * * * *', () => {
    addAdminDashboardStat();
  });
};

module.exports = { scheduleMidnightJob };