const MeterData = require('../model/MeterData');
const DailyMeterData = require('../model/DailyMeterSummary')

const getDashboardSummary = async (meterId, userId, rangeInDays) => {
  console.log("required data in parmas", meterId, userId, rangeInDays);
  const todayDate = new Date();
  const startDate = new Date();
  startDate.setDate(todayDate.getDate() - rangeInDays);


  console.log("start date and endDate", startDate, todayDate);
  const data = await DailyMeterData.find({ meterId })
    .sort({ timestamp: -1 })
    .limit(1);

  const recent = await MeterData.find({ meterId })
    .sort({ timestamp: -1 })
    .limit(1);


  const chart = await DailyMeterData.find({
    meterId,
    date: {
      $gte: startDate,
      $lte: todayDate
    }
  }).sort({ timestamp: 1 }); // oldest to latest for charting
  console.log('data---->', {
    data: data,
    chart: chart
  });

  return {
    historicalDataPerDay: data[0] || "null",
    recentData: recent[0] || "null",
    chartData: {
      chart,
      labelsData: ['mon', 'tue', 'wed', 'thru', 'fri', 'sat', 'sun']
    }
  };
};


const getChartData = async (meterId, userId, range) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - parseInt(range));

  const readings = await MeterData.find({
    meterId,
    userId,
    timestamp: { $gte: start, $lte: end },
  }).sort({ timestamp: 1 });

  return readings.map(reading => ({
    timestamp: reading.timestamp,
    kwh: reading.cum_eb_kwh.value + reading.cum_dg_kwh.value,
    balance: reading.balance_amount.value,
  }));
};

// // 3. Alerts (latest alerts for user + meter)
// const getAlerts = async (meterId, userId) => {
//   const alerts = await Alert.find({ meterId, userId })
//     .sort({ createdAt: -1 })
//     .limit(10);

//   return alerts;
// };

// 4. Latest Meter Snapshot
const getLatestReading = async (meterId, userId) => {
  const reading = await MeterData.findOne({ meterId, userId })
    .sort({ timestamp: -1 });

  return reading;
};

module.exports = {
  getDashboardSummary,
  getChartData,
  //   getAlerts,
  getLatestReading,
};