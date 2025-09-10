// const MeterData = require('../model/MeterData');
// const DailyMeterData = require('../model/DailyMeterSummary')

// const getDashboardSummary = async (meterId, userId, rangeInDays) => {
//   console.log("required data in parmas", meterId, userId, rangeInDays);
//   const todayDate = new Date();
//   const startDate = new Date();
//   startDate.setDate(todayDate.getDate() - rangeInDays);


//   console.log("start date and endDate", startDate, todayDate);
//   const data = await DailyMeterData.find({ meterId })
//     .sort({ timestamp: -1 })
//     .limit(1);

//   const recent = await MeterData.find({ meterId })
//     .sort({ timestamp: -1 })
//     .limit(1);


//   const chart = await DailyMeterData.find({
//     meterId,
//     date: {
//       $gte: startDate,
//       $lte: todayDate
//     }
//   }).sort({ timestamp: 1 }); // oldest to latest for charting
//   console.log('data---->', {
//     data: data,
//     chart: chart
//   });

//   return {
//     historicalDataPerDay: data[0] || "null",
//     recentData: recent[0] || "null",
//     chartData: {
//       chart,
//       labelsData: ['mon', 'tue', 'wed', 'thru', 'fri', 'sat', 'sun']
//     }
//   };
// };


// const getChartData = async (meterId, userId, range) => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - parseInt(range));

//   const readings = await MeterData.find({
//     meterId,
//     userId,
//     timestamp: { $gte: start, $lte: end },
//   }).sort({ timestamp: 1 });

//   return readings.map(reading => ({
//     timestamp: reading.timestamp,
//     kwh: reading.cum_eb_kwh.value + reading.cum_dg_kwh.value,
//     balance: reading.balance_amount.value,
//   }));
// };

// // // 3. Alerts (latest alerts for user + meter)
// // const getAlerts = async (meterId, userId) => {
// //   const alerts = await Alert.find({ meterId, userId })
// //     .sort({ createdAt: -1 })
// //     .limit(10);

// //   return alerts;
// // };

// // 4. Latest Meter Snapshot
// const getLatestReading = async (meterId, userId) => {
//   const reading = await MeterData.findOne({ meterId, userId })
//     .sort({ timestamp: -1 });

//   return reading;
// };

// module.exports = {
//   getDashboardSummary,
//   getChartData,
//   //   getAlerts,
//   getLatestReading,
// };
























const MeterData = require('../model/MeterData');
const DailyMeterData = require('../model/DailyMeterSummary')
const mongoose=require("mongoose")


const getDashboardSummary = async (meterId, userId, startDate, endDate) => {
  // Parse dates with proper timezone handling
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set time to beginning and end of day for proper range
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Latest daily summary (most recent day only)
  const data = await DailyMeterData.find({ meterId })
    .sort({ createdAt: -1 })
    .limit(1);

  // Most recent raw meter data
  const recent = await MeterData.find({ meterId })
    .sort({ createdAt: -1 })
    .limit(1);

  const chart = await DailyMeterData.aggregate([
    {
      $match: {
        meterId: new mongoose.Types.ObjectId(meterId),
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $sort: { createdAt: -1 } }, // latest first
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" }
        },
        latestDoc: { $first: "$$ROOT" }
      }
    },
    { $sort: { "_id": 1 } } // ascending by date
  ]);

  // 🟢 Now use grouped _id (string date) for labels
  const latestPerDay = chart.map(c => ({
    ...c.latestDoc,
    day: c._id   // attach normalized day
  }));

  return {
    historicalDataPerDay: data[0] || null,
    recentData: recent[0] || null,
    chartData: {
      chart: latestPerDay,
      labelsData: latestPerDay.map(item =>
        new Date(item.day).toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      )
    }
  };
};

const getChartData = async (meterId, userId, startDate, endDate) => {
  // Parse dates with proper timezone handling
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set time to beginning and end of day for proper range
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

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