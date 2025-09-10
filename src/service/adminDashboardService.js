

// const mongoose = require("mongoose");
// const User = require("../model/User");
// const Meter = require("../model/Meter");
// const AdminDashboard = require("../model/AdminDashboard");
// const DailyMeterData = require("../model/DailyMeterSummary");
// const Payment = require("../model/Payment");
// const MeterDecodedData = require("../model/MeterData");
// const Notification = require("../model/Notification");

// const getLatestAdminDashboardStat = async (adminId) => {
//   const data = await AdminDashboard.findOneAndUpdate({ adminId })
//     .sort({ updatedAt: -1 })
//     .lean();

//   return data;
// };

// const getAdminConsumptionByDate = async (adminId, from, to) => {
//   if (!mongoose.Types.ObjectId.isValid(adminId)) {
//     throw new Error("Invalid adminId");
//   }

//   const adminObjectId = new mongoose.Types.ObjectId(adminId);

//   // 1. Date Range
//   let startDate, endDate;
//   let originalStartDate, originalEndDate;

//   if (from && to) {
//     // Keep original dates for date generation
//     originalStartDate = new Date(from);
//     originalEndDate = new Date(to);

//     // Create modified dates for database queries
//     startDate = new Date(from);
//     endDate = new Date(to);
//     endDate.setHours(23, 59, 59, 999); // Set end date to end of day
//   } else {
//     endDate = new Date();
//     startDate = new Date();
//     startDate.setDate(endDate.getDate() - 6); // last 7 days

//     originalStartDate = new Date(startDate);
//     originalEndDate = new Date(endDate);
//   }

//   // Generate all dates in range using ORIGINAL dates (YYYY-MM-DD format)
//   const dates = [];
//   const startDateStr = from || originalStartDate.toISOString().split("T")[0];
//   const endDateStr = to || originalEndDate.toISOString().split("T")[0];

//   // Create date objects from strings to avoid timezone issues
//   const currentDate = new Date(startDateStr + "T00:00:00.000Z");
//   const finalDate = new Date(endDateStr + "T00:00:00.000Z");

//   while (currentDate <= finalDate) {
//     dates.push(currentDate.toISOString().split("T")[0]);
//     currentDate.setUTCDate(currentDate.getUTCDate() + 1);
//   }

//   // 2. Aggregate Data (in parallel)
//   const [users, meters, payments, dashboards] = await Promise.all([
//     // Users
//     User.aggregate([
//       {
//         $match: {
//           adminId: adminObjectId,
//           role: "user",
//           createdAt: { $gte: startDate, $lte: endDate },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           total: { $sum: 1 },
//         },
//       },
//     ]),

//     // Meters
//     Meter.aggregate([
//       {
//         $match: {
//           adminId: adminObjectId,
//           createdAt: { $gte: startDate, $lte: endDate },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           total: { $sum: 1 },
//           faulty: {
//             $sum: { $cond: [{ $eq: ["$status", "faulty"] }, 1, 0] },
//           },
//           offline: {
//             $sum: { $cond: [{ $eq: ["$status", "offline"] }, 1, 0] },
//           },
//         },
//       },
//     ]),

//     // Payments
//     Payment.aggregate([
//       {
//         $match: {
//           adminId: adminObjectId,
//           createdAt: { $gte: startDate, $lte: endDate },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           revenue: { $sum: "$amount" },
//           negative: {
//             $sum: { $cond: [{ $ne: ["$status", "success"] }, "$amount", 0] },
//           },
//         },
//       },
//     ]),

//     // Admin Dashboard (no grouping, just projections)
//     AdminDashboard.aggregate([
//       {
//         $match: {
//           adminId: adminObjectId,
//           updatedAt: { $gte: startDate, $lte: endDate },
//         },
//       },
//       {
//         $project: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
//           latestUpdatedAt: "$updatedAt",
//           latestTotalConsumption: "$totalConsumption",
//           latestTotalPowerFactor: "$totalPowerFactor",
//           latestTotalEbConsumption: "$totalEbConsumption",
//           latestTotalDgConsumption: "$totalDgConsumption",
//           latestTotalDueUser: "$totalDueUser",
//           costDgPerUnit: "$costDgPerUnit",
//           costEbPerUnit: "$costEbPerUnit",
//         },
//       },
//     ]),
//   ]);

//   // 3. Convert results to maps (O(n) instead of multiple lookups)
//   const userMap = new Map(users.map((u) => [u._id, u.total]));
//   const meterMap = new Map(meters.map((m) => [m._id, m]));
//   const payMap = new Map(payments.map((p) => [p._id, p]));
//   const dashMap = new Map(dashboards.map((d) => [d._id, d]));

//   // 4. Merge results with defaults and calculate daily changes
//   const results = dates.map((date, index) => {
//     const u = userMap.get(date) || 0;
//     const m = meterMap.get(date) || {};
//     const p = payMap.get(date) || {};
//     const dsh = dashMap.get(date) || {};

//     // Get previous day data for daily calculations
//     let prevData = null;
//     if (index > 0) {
//       const prevDate = dates[index - 1];
//       const prevU = userMap.get(prevDate) || 0;
//       const prevM = meterMap.get(prevDate) || {};
//       const prevP = payMap.get(prevDate) || {};
//       const prevDsh = dashMap.get(prevDate) || {};

//       prevData = {
//         latestTotalUsers: prevU,
//         latestTotalMeters: prevM.total || 0,
//         latestTotalFaultyMeters: prevM.faulty || 0,
//         latestTotalOfflineMeters: prevM.offline || 0,
//         latestTotalRevenue: prevP.revenue || 0,
//         latestNegativeRevenue: prevP.negative || 0,
//         latestTotalConsumption: prevDsh.latestTotalConsumption || 0,
//         latestTotalPowerFactor: prevDsh.latestTotalPowerFactor || 0,
//         latestTotalEbConsumption: prevDsh.latestTotalEbConsumption || 0,
//         latestTotalDgConsumption: prevDsh.latestTotalDgConsumption || 0,
//         latestTotalDueUser: prevDsh.latestTotalDueUser || 0,
//       };
//     }

//     const currentData = {
//       latestUpdatedAt: dsh.latestUpdatedAt || new Date(`${date}T00:00:00.000Z`),
//       latestTotalConsumption: dsh.latestTotalConsumption || 0,
//       latestTotalPowerFactor: dsh.latestTotalPowerFactor ?? null,
//       latestTotalEbConsumption: dsh.latestTotalEbConsumption || 0,
//       latestTotalDgConsumption: dsh.latestTotalDgConsumption || 0,
//       latestTotalUsers: u,
//       latestTotalMeters: m.total || 0,
//       latestTotalFaultyMeters: m.faulty || 0,
//       latestTotalOfflineMeters: m.offline || 0,
//       latestTotalRevenue: p.revenue || 0,
//       latestNegativeRevenue: p.negative || 0,
//       latestTotalDueUser: dsh.latestTotalDueUser || 0,
//     };
    
//     // Calculate daily changes
//     if (prevData) {
//       currentData.dailyTotalUsers =
//         currentData.latestTotalUsers - prevData.latestTotalUsers;
//       currentData.dailyTotalMeters =
//         currentData.latestTotalMeters - prevData.latestTotalMeters;
//       currentData.dailyTotalRevenue =
//         Math.round(
//           (currentData.latestTotalRevenue - prevData.latestTotalRevenue) * 100
//         ) / 100;
//       currentData.dailyTotalFaultyMeters =
//         currentData.latestTotalFaultyMeters - prevData.latestTotalFaultyMeters;
//       currentData.dailyTotalOfflineMeters =
//         currentData.latestTotalOfflineMeters -
//         prevData.latestTotalOfflineMeters;
//       currentData.dailyTotalConsumption =
//         Math.round(
//           (currentData.latestTotalConsumption -
//             prevData.latestTotalConsumption) *
//             100
//         ) / 100;
//       currentData.dailyTotalPowerFactor =
//         currentData.latestTotalPowerFactor !== null &&
//         prevData.latestTotalPowerFactor !== null
//           ? Math.round(
//               (currentData.latestTotalPowerFactor -
//                 prevData.latestTotalPowerFactor) *
//                 100
//             ) / 100
//           : 0;
//       currentData.dailyTotalEbConsumption =
//         Math.round(
//           (currentData.latestTotalEbConsumption -
//             prevData.latestTotalEbConsumption) *
//             100
//         ) / 100;
//       currentData.dailyTotalDgConsumption =
//         Math.round(
//           (currentData.latestTotalDgConsumption -
//             prevData.latestTotalDgConsumption) *
//             100
//         ) / 100;
//       currentData.dailyTotalDueBalance =
//         Math.round(
//           (currentData.latestNegativeRevenue - prevData.latestNegativeRevenue) *
//             100
//         ) / 100;
//       currentData.dailyTotalDueUsers =
//         currentData.latestTotalDueUser - prevData.latestTotalDueUser;

//         currentData.costEbPerUnit = dsh.costEbPerUnit || 0;
//         currentData.costDgPerUnit = dsh.costDgPerUnit || 0;
//     } else {
//       // For first day, daily changes are 0
//       currentData.dailyTotalUsers = 0;
//       currentData.dailyTotalMeters = 0;
//       currentData.dailyTotalRevenue = 0;
//       currentData.dailyTotalFaultyMeters = 0;
//       currentData.dailyTotalOfflineMeters = 0;
//       currentData.dailyTotalConsumption = 0;
//       currentData.dailyTotalPowerFactor = 0;
//       currentData.dailyTotalEbConsumption = 0;
//       currentData.dailyTotalDgConsumption = 0;
//       currentData.dailyTotalDueBalance = 0;
//       currentData.dailyTotalDueUsers = 0;
//       currentData.costEbPerUnit = dsh.costEbPerUnit || 0;
//       currentData.costDgPerUnit = dsh.costDgPerUnit || 0;
//     }

//     return currentData;
//   });

//   return results;
// };

// const getMeterDataByAdminId = async (adminId) => {
//   if (!mongoose.Types.ObjectId.isValid(adminId)) {
//     throw new Error("Invalid adminId");
//   }
//   const meterData = await Meter.find({ adminId }).populate({
//     path: "assignedUserId",
//     select: "name email",
//   });

//   // console.log("Meter Data for Admin:", meterData);
//   return meterData;
// };


// const getUserDataByAdminId = async (adminId, startDate, endDate) => {
//   // Validate adminId
//   if (!mongoose.Types.ObjectId.isValid(adminId)) {
//     throw new Error("Invalid adminId");
//   }

//   console.log("=========566======", startDate, endDate);

//   // If no date filters → default to today (from midnight to now)
//   if (!startDate && !endDate) {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0); // set time to 00:00:00
//     startDate = todayStart;
//     endDate = new Date(); // current time
//   }

//   // Get all users under this admin
//   const users = await User.find({ adminId, role: "user" }).select(
//     "_id name email phoneNumber createdAt updatedAt"
//   );

//   // For each user → fetch their assigned meters and hourly meter data
//   const userDataWithMeters = await Promise.all(
//     users.map(async (user) => {
//       // Get all meters assigned to this user
//       const meters = await Meter.find({
//         adminId: mongoose.Types.ObjectId.isValid(adminId)
//           ? new mongoose.Types.ObjectId(adminId)
//           : adminId,
//         assignedUserId: mongoose.Types.ObjectId.isValid(user._id)
//           ? new mongoose.Types.ObjectId(user._id)
//           : user._id,
//         isAssigned: true,
//       });

//       // For each meter → fetch decoded data (latest per hour)
//       const meterData = await Promise.all(
//         meters.map(async (meter) => {
//           // Build query for meter decoded data
//           const matchQuery = { meterId: meter._id };

//           // Always apply startDate and endDate now (default = today)
//           matchQuery.timestamp = {};
//           if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
//           if (endDate) matchQuery.timestamp.$lte = new Date(endDate);

//           // Fetch decoded data → only latest record per hour
//           const decodedData = await MeterDecodedData.aggregate([
//             { $match: matchQuery },

//             // Sort by timestamp descending (latest first)
//             { $sort: { timestamp: -1 } },

//             // Group by year, month, day, hour → pick the first (latest) per hour
//             {
//               $group: {
//                 _id: {
//                   year: { $year: "$timestamp" },
//                   month: { $month: "$timestamp" },
//                   day: { $dayOfMonth: "$timestamp" },
//                   hour: { $hour: "$timestamp" },
//                 },
//                 latestRecord: { $first: "$$ROOT" },
//               },
//             },

//             // Replace root with the selected latestRecord
//             { $replaceRoot: { newRoot: "$latestRecord" } },

//             // Sort ascending for chart plotting
//             { $sort: { timestamp: 1 } },

//             // Pick only required fields
//             {
//               $project: {
//                 _id: 1,
//                 cum_eb_kwh: 1,
//                 cum_dg_kwh: 1,
//                 balance_amount: 1,
//                 voltage_r: 1,
//                 timestamp: 1,
//               },
//             },
//           ]);

//           // Return meter with its filtered decoded data
//           return {
//             meter,
//             decodedData,
//           };
//         })
//       );

//       // Return user object with their meters
//       return {
//         userId: user._id,
//         name: user.name,
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//         meters: meterData,
//       };
//     })
//   );

//   return userDataWithMeters;
// };

// const addAdminDashboardStat = async () => {
//   const adminIds = await Meter.distinct("adminId");
//   const results = [];

//   for (const adminId of adminIds) {
//     // Fetch data in parallel (bulk instead of per meter)
//     const [totalUsers, assignedUserIds, meters] = await Promise.all([
//       User.countDocuments({ adminId, role: "user" }),
//       Meter.distinct("assignedUserId", { adminId, isAssigned: true }),
//       Meter.find({ adminId }),
//     ]);

//     if (!meters.length) continue;

//     const meterIds = meters.map((m) => m._id);

//     // Fetch latest decoded data for all meters at once
//     const meterDecodedData = await MeterDecodedData.aggregate([
//       { $match: { meterId: { $in: meterIds } } },
//       { $sort: { timestamp: -1 } },
//       {
//         $group: {
//           _id: "$meterId",
//           latest: { $first: "$$ROOT" },
//         },
//       },
//     ]);

//     // Fetch successful payments for these meters
//     const payments = await Payment.find({
//       meterId: { $in: meterIds },
//       status: "success",
//     })
//       .sort({ createdAt: -1 })
//       .lean();

//     // --- Meter status counts (no need Promise.all, just loop once) ---
//     const totalMeters = meters.length;


//     let totalConsumption = 0;
// let totalEbConsumption = 0;
// let totalDgConsumption = 0;
// let totalActiveMeters = 0;
// let totalOfflineMeters = 0;
// let totalFaultyMeters = 0;
// let costDgPerUnit = 0;
// let costEbPerUnit = 0;



  

//   let faultyMeters = [];  // ✅ faulty meters list

// for (const meter of meters) {
//   const decoded = meterDecodedData.find(
//     (m) => String(m._id) === String(meter._id)
//   )?.latest;

//   if (!decoded) {
//     // No decoded data at all → faulty
//     totalFaultyMeters += 1;
//     faultyMeters.push(meter);  // ✅ add meterId
//     continue;
//   }

//   // Check last updated time
//   const lastUpdated = new Date(decoded.timestamp);
//   const minutesDiff = (Date.now() - lastUpdated.getTime()) / (1000 * 60*60);

//   if (minutesDiff > 24) {
//     // Data purane time se nahi aaya → faulty
//     totalFaultyMeters += 1;
//     faultyMeters.push(meter);  // ✅ add meterId
//     continue;
//   }

//   // ✅ Consumption
//   const eb = decoded?.cum_eb_kwh?.value || 0;
//   const dg = decoded?.cum_dg_kwh?.value || 0;
//   totalEbConsumption += eb;
//   totalDgConsumption += dg;
//   totalConsumption += eb + dg;

//   // ✅ Tariff cost (latest data ke basis par overwrite hoga)
//   if (decoded?.eb_tariff_setting?.value != null) {
//     costEbPerUnit = decoded.eb_tariff_setting.value;
//   }
//   if (decoded?.dg_tariff_setting?.value != null) {
//     costDgPerUnit = decoded.dg_tariff_setting.value;
//   }

//   // ✅ Status check
//   if (decoded?.relay_status?.value === 1) {
//     totalActiveMeters += 1;
//   } else if (decoded?.relay_status?.value === 0) {
//     totalOfflineMeters += 1;
//   }
// }


//     // --- Total revenue (aggregate only once) ---
//     const revenueResult = await Payment.aggregate([
//       {
//         $match: {
//           status: "success",
//           amount: { $gte: 0 },
//           meterId: { $in: meterIds },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const totalRevenue = revenueResult.length
//       ? revenueResult[0].totalRevenue
//       : 0;

//     // --- Negative revenue & due users ---
//     let negativeRevenue = 0;
//     const dueUsersSet = new Set();

//     // Only need latest payment per meter
//     const latestPaymentsMap = new Map();
//     for (const payment of payments) {
//       if (!latestPaymentsMap.has(String(payment.meterId))) {
//         latestPaymentsMap.set(String(payment.meterId), payment);
//       }
//     }

//     for (const meter of meters) {
//       const latestPayment = latestPaymentsMap.get(String(meter._id));
//       if (latestPayment && latestPayment.amount < 0) {
//         negativeRevenue += latestPayment.amount;
//         if (meter.assignedUserId) {
//           dueUsersSet.add(String(meter.assignedUserId));
//         }
//       }
//     }

//     const totalDueUser = dueUsersSet.size;

//     // --- Power Factor ---
//     let totalPowerFactor = 0;
//     let meterCount = 0;
//     for (const { latest } of meterDecodedData) {
//       if (latest?.power_factor?.value != null) {
//         totalPowerFactor += latest.power_factor.value;
//         meterCount++;
//       }
//     }

//     const newEntry = await AdminDashboard.create({
//       adminId,
//       totalUsers,
//       totalAssignedUsers: assignedUserIds.filter(Boolean).length,
//       totalMeters,
//       totalActiveMeters,
//       totalFaultyMeters,
//       faultyMeters, 
//       totalOfflineMeters,
//       costDgPerUnit,
//       costEbPerUnit,
//       totalEbConsumption: Number(totalEbConsumption.toFixed(2)),
//       totalDgConsumption: Number(totalDgConsumption.toFixed(2)),
//       totalRevenue: Number(totalRevenue.toFixed(2)),
//       negativeRevenue: Number(negativeRevenue.toFixed(2)),
//       totalDueUser,
//       totalConsumption: Number(totalConsumption.toFixed(2)),
//       totalPowerFactor: Number(totalPowerFactor.toFixed(2)),
//       createdAt: new Date(),
//     });

//     console.log(`✅ Created dashboard for admin ${adminId}`);
//     results.push(newEntry);
//   }

//   return results;
// };





// // const getMeterIssuesByAdmin = async (adminId) => {
// //   const issueTypes = [
// //     "Neutral Voltage Issue",
// //     "Magnetic Interference",
// //     "Current Imbalance",
// //     "Reverse Polarity",
// //   ];

// //   // Find notifications for this adminId with matching issues
// //   const notifications = await Notification.find({
// //     adminId,
// //     "userNotification.alertType": { $in: issueTypes },
// //   })
// //     .populate("meterId")
// //     .populate("userId")
// //     .populate("adminId");

// //   if (!notifications.length) {
// //     return { meterCount: 0, meters: [] };
// //   }

// //   // Group by meterId
// //   const meterMap = new Map();

// //   notifications.forEach((notif) => {
// //     const meterId = notif.meterId?._id?.toString();
// //     if (!meterId) return;

// //     // Collect all relevant issues from this notification
// //     const issues = notif.userNotification
// //       .filter((n) => issueTypes.includes(n.alertType))
// //       .map((n) => ({
// //         type: n.alertType,
// //         message: n.message,
// //         lastDetected: n.time,
// //       }));

// //     if (!meterMap.has(meterId)) {
// //       meterMap.set(meterId, {
// //         meter: {
// //           id: notif.meterId?._id,
// //           meterId: notif.meterId?.meterId,
// //           name: notif.meterId?.name,
// //           type: notif.meterId?.type,
// //           meterSerialNumber: notif.meterId?.meterSerialNumber,
// //           slaveId: notif.meterId?.slaveId,
// //           status: notif.meterId?.status,
// //         },
// //         user: {
// //           id: notif.userId?._id,
// //           name: notif.userId?.name,
// //           email: notif.userId?.email,
// //         },
// //         admin: {
// //           id: notif.adminId?._id,
// //           name: notif.adminId?.name,
// //           email: notif.adminId?.email,
// //         },
// //         issues: [],
// //       });
// //     }

// //     // Merge issues into existing list
// //     const meterData = meterMap.get(meterId);
// //     meterData.issues.push(...issues);

// //     // Remove duplicates (keep latest time for each type)
// //     const deduped = Object.values(
// //       meterData.issues.reduce((acc, issue) => {
// //         if (
// //           !acc[issue.type] ||
// //           new Date(issue.lastDetected) > new Date(acc[issue.type].lastDetected)
// //         ) {
// //           acc[issue.type] = issue;
// //         }
// //         return acc;
// //       }, {})
// //     );

// //     // Sort issues so latest comes first
// //     meterData.issues = deduped.sort(
// //       (a, b) => new Date(b.lastDetected) - new Date(a.lastDetected)
// //     );

// //     meterMap.set(meterId, meterData);
// //   });

// //   const meters = Array.from(meterMap.values());

// //   return {
// //     meterCount: meters.length, // 👈 count of unique meters with tempered issues
// //     meters,
// //   };
// // };





// const getMeterIssuesByAdmin = async (adminId) => {
//   let  MetersDataWithIssuesLast5Days= await  getMetersWithIssuesLast5Days(adminId)
//   const issueTypes = [
//     "Neutral Voltage Issue",
//     "Magnetic Interference",
//     "Current Imbalance",
//     "Reverse Polarity",
//   ];

//   // Last 7 days range
//   const sevenDaysAgo = new Date();
//   sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 15
// );

//   // Find notifications for this adminId with matching issues in the last 7 days
//   const notifications = await Notification.find({
//     adminId,
//     "userNotification.alertType": { $in: issueTypes },
//     "userNotification.time": { $gte: sevenDaysAgo }, // ✅ filter last 7 days
//   })
//     .populate("meterId")
//     .populate("userId")
//     .populate("adminId");

//   if (!notifications.length) {
//     return { meterCount: 0, meters: [] };

//   }
// // console.log("==notifications.length==",notifications)
//   // Group by meterId
//   const meterMap = new Map();

//   notifications.forEach((notif) => {
//     const meterId = notif.meterId?._id?.toString();
//     if (!meterId) return;

//     // Collect all relevant issues from this notification
//     const issues = notif.userNotification
//       .filter(
//         (n) =>
//           issueTypes.includes(n.alertType) &&
//           new Date(n.time) >= sevenDaysAgo // ✅ filter inside userNotification too
//       )
//       .map((n) => ({
//         type: n.alertType,
//         message: n.message,
//         lastDetected: n.time,
//       }));

//     if (!issues.length) return; // skip if no issues in last 7 days

//     if (!meterMap.has(meterId)) {
//       meterMap.set(meterId, {
//         meter: {
//           id: notif.meterId?._id,
//           meterId: notif.meterId?.meterId,
//           name: notif.meterId?.name,
//           type: notif.meterId?.type,
//           meterSerialNumber: notif.meterId?.meterSerialNumber,
//           slaveId: notif.meterId?.slaveId,
//           status: notif.meterId?.status,
//         },
//         user: {
//           id: notif.userId?._id,
//           name: notif.userId?.name,
//           email: notif.userId?.email,
//         },
//         admin: {
//           id: notif.adminId?._id,
//           name: notif.adminId?.name,
//           email: notif.adminId?.email,
//         },
//         issues: [],
//       });
//     }

//     // Merge issues into existing list
//     const meterData = meterMap.get(meterId);
//     meterData.issues.push(...issues);

//     // Remove duplicates (keep latest time for each type)
//     const deduped = Object.values(
//       meterData.issues.reduce((acc, issue) => {
//         if (
//           !acc[issue.type] ||
//           new Date(issue.lastDetected) > new Date(acc[issue.type].lastDetected)
//         ) {
//           acc[issue.type] = issue;
//         }
//         return acc;
//       }, {})
//     );

//     // Sort issues so latest comes first
//     meterData.issues = deduped.sort(
//       (a, b) => new Date(b.lastDetected) - new Date(a.lastDetected)
//     );

//     meterMap.set(meterId, meterData);
//   });

//   const meters = Array.from(meterMap.values());

// // console.log("======meters === MetersDataWithIssuesLast5Days===",meters , MetersDataWithIssuesLast5Days)
//   return {
//     meterCount: meters.length, // ✅ count of unique meters with tempered issues in last 7 days
//     meters,
//     MetersDataWithIssuesLast5Days
//   };
// };


// const getMetersWithIssuesLast5Days = async (adminId) => {
//   const issueTypes = [
//     "Neutral Voltage Issue",
//     "Magnetic Interference",
//     "Current Imbalance",
//     "Reverse Polarity",
//   ];

//   const today = new Date();
//   const fiveDaysAgo = new Date();
//   fiveDaysAgo.setDate(today.getDate() - 4); // inclusive of today (5 days)

//   // Step 1: Fetch all notifications for last 5 days
//   const notifications = await Notification.find({
//     adminId,
//     "userNotification.alertType": { $in: issueTypes },
//     "userNotification.time": { $gte: fiveDaysAgo },
//   })
//     .populate("meterId")
//     .populate("userId")
//     .populate("adminId");

//   if (!notifications.length) {
//     return { meterCount: 0, meters: [] };
//   }

//   // Step 2: Group notifications by meter
//   const meterMap = new Map();

//   notifications.forEach((notif) => {
//     const meterId = notif.meterId?._id?.toString();
//     if (!meterId) return;

//     const issues = notif.userNotification
//       .filter(
//         (n) =>
//           issueTypes.includes(n.alertType) &&
//           new Date(n.time) >= fiveDaysAgo
//       )
//       .map((n) => ({
//         type: n.alertType,
//         message: n.message,
//         lastDetected: n.time,
//       }));

//     if (!issues.length) return;

//     if (!meterMap.has(meterId)) {
//       meterMap.set(meterId, {
//         meter: {
//           id: notif.meterId?._id,
//           meterId: notif.meterId?.meterId,
//           name: notif.meterId?.name,
//           type: notif.meterId?.type,
//           meterSerialNumber: notif.meterId?.meterSerialNumber,
//           slaveId: notif.meterId?.slaveId,
//           status: notif.meterId?.status,
//         },
//         user: {
//           id: notif.userId?._id,
//           name: notif.userId?.name,
//           email: notif.userId?.email,
//         },
//         admin: {
//           id: notif.adminId?._id,
//           name: notif.adminId?.name,
//           email: notif.adminId?.email,
//         },
//         issues: [],
//       });
//     }

//     const meterData = meterMap.get(meterId);
//     meterData.issues.push(...issues);

//     // Deduplicate by type (keep latest)
//     const deduped = Object.values(
//       meterData.issues.reduce((acc, issue) => {
//         if (
//           !acc[issue.type] ||
//           new Date(issue.lastDetected) > new Date(acc[issue.type].lastDetected)
//         ) {
//           acc[issue.type] = issue;
//         }
//         return acc;
//       }, {})
//     );

//     meterData.issues = deduped.sort(
//       (a, b) => new Date(b.lastDetected) - new Date(a.lastDetected)
//     );

//     meterMap.set(meterId, meterData);
//   });

//   // Step 3: Filter meters that have issues on ALL last 5 consecutive days
//   const result = [];

//   for (const meterData of meterMap.values()) {
//     // Unique days where issues were found
//     const daysWithIssues = new Set(
//       meterData.issues.map((issue) =>
//         new Date(issue.lastDetected).toISOString().slice(0, 10)
//       )
//     );

//     let hasAll5Days = true;
//     for (let i = 0; i < 5; i++) {
//       const d = new Date();
//       d.setDate(today.getDate() - i);
//       const dayKey = d.toISOString().slice(0, 10);
//       if (!daysWithIssues.has(dayKey)) {
//         hasAll5Days = false;
//         break;
//       }
//     }

//     if (hasAll5Days) {
//       result.push(meterData);
//     }
//   }

//   return {
//     meterCount: result.length,
//     meters: result,
//   };
// };


// module.exports = {
//   getLatestAdminDashboardStat,
//   getAdminConsumptionByDate,
//   getUserDataByAdminId,
//   getMeterDataByAdminId,
//   addAdminDashboardStat,
//   getMeterIssuesByAdmin,
//   // getMetersWithIssuesLast5Days
// };
























// service/dashboardService.js
const mongoose = require("mongoose");
const User = require("../model/User");
const Meter = require("../model/Meter");
const AdminDashboard = require("../model/AdminDashboard");
const DailyMeterData = require("../model/DailyMeterSummary");
const Payment = require("../model/Payment");
const MeterDecodedData = require("../model/MeterData");
const Notification = require("../model/Notification");
// const getLatestAdminDashboardStat = async (adminId) => {
//   const data = await AdminDashboard.findOneAndUpdate({ adminId }).populate("faultyMeters")
//     .sort({ updatedAt: -1 })
//     .lean();

//   return data;
// };

const getLatestAdminDashboardStat = async (adminId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error("Invalid adminId");
  }

  const skip = (page - 1) * limit;

  // Fetch latest dashboard stat
  const dashboard = await AdminDashboard.findOne({ adminId })
    .sort({ updatedAt: -1 })
    .lean();

  if (!dashboard) return null;

  // ✅ Helper to paginate meter arrays
  const paginateMeters = async (meterIds) => {
    const total = meterIds.length;
    const meters = await Meter.find({ _id: { $in: meterIds } })
      .select(
        "-actionHistory" // ❌ exclude actionHistory
      )
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  // ✅ Apply pagination to faulty, online, and offline
  const [faulty, online, offline] = await Promise.all([
    paginateMeters(dashboard.faultyMeters || []),
    paginateMeters(dashboard.onlineMeters || []),
    paginateMeters(dashboard.offlineMeters || []),
  ]);

  return {
    ...dashboard,
    faultyMeters: faulty.meters,
    onlineMeters: online.meters,
    offlineMeters: offline.meters,
    pagination: {
      faulty: faulty.pagination,
      online: online.pagination,
      offline: offline.pagination,
    },
  };
};

const getLatestOfflineOnlineFaultyMeter = async (adminId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error("Invalid adminId");
  }

  const skip = (page - 1) * limit;

  // Fetch latest dashboard stat
  const dashboard = await AdminDashboard.findOne({ adminId })
    .sort({ updatedAt: -1 })
    .lean();

  if (!dashboard) return null;

  // ✅ Helper to paginate meter arrays
  const paginateMeters = async (meterIds) => {
    const total = meterIds.length;
    const meters = await Meter.find({ _id: { $in: meterIds } })
      .select(
        "-actionHistory" // ❌ exclude actionHistory
      )
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      meters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  // ✅ Apply pagination to faulty, online, and offline
  const [faulty, online, offline] = await Promise.all([
    paginateMeters(dashboard.faultyMeters || []),
    paginateMeters(dashboard.onlineMeters || []),
    paginateMeters(dashboard.offlineMeters || []),
  ]);

  return {
    ...dashboard,
    faultyMeters: faulty.meters,
    onlineMeters: online.meters,
    offlineMeters: offline.meters,
    pagination: {
      faulty: faulty.pagination,
      online: online.pagination,
      offline: offline.pagination,
    },
  };
};

const getAdminConsumptionByDate = async (adminId, from, to) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error("Invalid adminId");
  }

  const adminObjectId = new mongoose.Types.ObjectId(adminId);

  // 1. Date Range
  let startDate, endDate;
  let originalStartDate, originalEndDate;

  if (from && to) {
    // Keep original dates for date generation
    originalStartDate = new Date(from);
    originalEndDate = new Date(to);

    // Create modified dates for database queries
    startDate = new Date(from);
    endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999); // Set end date to end of day
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // last 7 days

    originalStartDate = new Date(startDate);
    originalEndDate = new Date(endDate);
  }

  // Generate all dates in range using ORIGINAL dates (YYYY-MM-DD format)
  const dates = [];
  const startDateStr = from || originalStartDate.toISOString().split("T")[0];
  const endDateStr = to || originalEndDate.toISOString().split("T")[0];

  // Create date objects from strings to avoid timezone issues
  const currentDate = new Date(startDateStr + "T00:00:00.000Z");
  const finalDate = new Date(endDateStr + "T00:00:00.000Z");

  while (currentDate <= finalDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // 2. Aggregate Data (in parallel)
  const [users, meters, payments, dashboards] = await Promise.all([
    // Users
    User.aggregate([
      {
        $match: {
          adminId: adminObjectId,
          role: "user",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
    ]),

    // Meters
    Meter.aggregate([
      {
        $match: {
          adminId: adminObjectId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
          faulty: {
            $sum: { $cond: [{ $eq: ["$status", "faulty"] }, 1, 0] },
          },
          offline: {
            $sum: { $cond: [{ $eq: ["$status", "offline"] }, 1, 0] },
          },
        },
      },
    ]),

    // Payments
    Payment.aggregate([
      {
        $match: {
          adminId: adminObjectId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          negative: {
            $sum: { $cond: [{ $ne: ["$status", "success"] }, "$amount", 0] },
          },
        },
      },
    ]),

    // Admin Dashboard (no grouping, just projections)
    AdminDashboard.aggregate([
      {
        $match: {
          adminId: adminObjectId,
          updatedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          latestUpdatedAt: "$updatedAt",
          latestTotalConsumption: "$totalConsumption",
          latestTotalPowerFactor: "$totalPowerFactor",
          latestTotalEbConsumption: "$totalEbConsumption",
          latestTotalDgConsumption: "$totalDgConsumption",
          latestTotalDueUser: "$totalDueUser",
          costDgPerUnit: "$costDgPerUnit",
          costEbPerUnit: "$costEbPerUnit",
        },
      },
    ]),
  ]);

  // 3. Convert results to maps (O(n) instead of multiple lookups)
  const userMap = new Map(users.map((u) => [u._id, u.total]));
  const meterMap = new Map(meters.map((m) => [m._id, m]));
  const payMap = new Map(payments.map((p) => [p._id, p]));
  const dashMap = new Map(dashboards.map((d) => [d._id, d]));

  // 4. Merge results with defaults and calculate daily changes
  const results = dates.map((date, index) => {
    const u = userMap.get(date) || 0;
    const m = meterMap.get(date) || {};
    const p = payMap.get(date) || {};
    const dsh = dashMap.get(date) || {};

    // Get previous day data for daily calculations
    let prevData = null;
    if (index > 0) {
      const prevDate = dates[index - 1];
      const prevU = userMap.get(prevDate) || 0;
      const prevM = meterMap.get(prevDate) || {};
      const prevP = payMap.get(prevDate) || {};
      const prevDsh = dashMap.get(prevDate) || {};

      prevData = {
        latestTotalUsers: prevU,
        latestTotalMeters: prevM.total || 0,
        latestTotalFaultyMeters: prevM.faulty || 0,
        latestTotalOfflineMeters: prevM.offline || 0,
        latestTotalRevenue: prevP.revenue || 0,
        latestNegativeRevenue: prevP.negative || 0,
        latestTotalConsumption: prevDsh.latestTotalConsumption || 0,
        latestTotalPowerFactor: prevDsh.latestTotalPowerFactor || 0,
        latestTotalEbConsumption: prevDsh.latestTotalEbConsumption || 0,
        latestTotalDgConsumption: prevDsh.latestTotalDgConsumption || 0,
        latestTotalDueUser: prevDsh.latestTotalDueUser || 0,
      };
    }

    const currentData = {
      latestUpdatedAt: dsh.latestUpdatedAt || new Date(`${date}T00:00:00.000Z`),
      latestTotalConsumption: dsh.latestTotalConsumption || 0,
      latestTotalPowerFactor: dsh.latestTotalPowerFactor ?? null,
      latestTotalEbConsumption: dsh.latestTotalEbConsumption || 0,
      latestTotalDgConsumption: dsh.latestTotalDgConsumption || 0,
      latestTotalUsers: u,
      latestTotalMeters: m.total || 0,
      latestTotalFaultyMeters: m.faulty || 0,
      latestTotalOfflineMeters: m.offline || 0,
      latestTotalRevenue: p.revenue || 0,
      latestNegativeRevenue: p.negative || 0,
      latestTotalDueUser: dsh.latestTotalDueUser || 0,
    };

    // Calculate daily changes
    if (prevData) {
      currentData.dailyTotalUsers =
        currentData.latestTotalUsers - prevData.latestTotalUsers;
      currentData.dailyTotalMeters =
        currentData.latestTotalMeters - prevData.latestTotalMeters;
      currentData.dailyTotalRevenue =
        Math.round(
          (currentData.latestTotalRevenue - prevData.latestTotalRevenue) * 100
        ) / 100;
      currentData.dailyTotalFaultyMeters =
        currentData.latestTotalFaultyMeters - prevData.latestTotalFaultyMeters;
      currentData.dailyTotalOfflineMeters =
        currentData.latestTotalOfflineMeters -
        prevData.latestTotalOfflineMeters;
      currentData.dailyTotalConsumption =
        Math.round(
          (currentData.latestTotalConsumption -
            prevData.latestTotalConsumption) *
            100
        ) / 100;
      currentData.dailyTotalPowerFactor =
        currentData.latestTotalPowerFactor !== null &&
        prevData.latestTotalPowerFactor !== null
          ? Math.round(
              (currentData.latestTotalPowerFactor -
                prevData.latestTotalPowerFactor) *
                100
            ) / 100
          : 0;
      currentData.dailyTotalEbConsumption =
        Math.round(
          (currentData.latestTotalEbConsumption -
            prevData.latestTotalEbConsumption) *
            100
        ) / 100;
      currentData.dailyTotalDgConsumption =
        Math.round(
          (currentData.latestTotalDgConsumption -
            prevData.latestTotalDgConsumption) *
            100
        ) / 100;
      currentData.dailyTotalDueBalance =
        Math.round(
          (currentData.latestNegativeRevenue - prevData.latestNegativeRevenue) *
            100
        ) / 100;
      currentData.dailyTotalDueUsers =
        currentData.latestTotalDueUser - prevData.latestTotalDueUser;

      currentData.costEbPerUnit = dsh.costEbPerUnit || 0;
      currentData.costDgPerUnit = dsh.costDgPerUnit || 0;
    } else {
      // For first day, daily changes are 0
      currentData.dailyTotalUsers = 0;
      currentData.dailyTotalMeters = 0;
      currentData.dailyTotalRevenue = 0;
      currentData.dailyTotalFaultyMeters = 0;
      currentData.dailyTotalOfflineMeters = 0;
      currentData.dailyTotalConsumption = 0;
      currentData.dailyTotalPowerFactor = 0;
      currentData.dailyTotalEbConsumption = 0;
      currentData.dailyTotalDgConsumption = 0;
      currentData.dailyTotalDueBalance = 0;
      currentData.dailyTotalDueUsers = 0;
      currentData.costEbPerUnit = dsh.costEbPerUnit || 0;
      currentData.costDgPerUnit = dsh.costDgPerUnit || 0;
    }

    return currentData;
  });

  return results;
};

const getMeterDataByAdminId = async (adminId) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error("Invalid adminId");
  }
  const meterData = await Meter.find({ adminId }).populate({
    path: "assignedUserId",
    select: "name email",
  }).select("-actionHistory");

  console.log("Meter Data for Admin:", meterData);
  return meterData;
};

const getUserDataByAdminId = async (adminId, startDate, endDate) => {
  // Validate adminId
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error("Invalid adminId");
  }

  console.log("=========566======", startDate, endDate);

  // If no date filters → default to today (from midnight to now)
  if (!startDate && !endDate) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // set time to 00:00:00
    startDate = todayStart;
    endDate = new Date(); // current time
  }

  // Get all users under this admin
  const users = await User.find({ adminId, role: "user" }).select(
    "_id name email phoneNumber createdAt updatedAt"
  );

  // For each user → fetch their assigned meters and hourly meter data
  const userDataWithMeters = await Promise.all(
    users.map(async (user) => {
      // Get all meters assigned to this user
      const meters = await Meter.find({
        adminId: mongoose.Types.ObjectId.isValid(adminId)
          ? new mongoose.Types.ObjectId(adminId)
          : adminId,
        assignedUserId: mongoose.Types.ObjectId.isValid(user._id)
          ? new mongoose.Types.ObjectId(user._id)
          : user._id,
        isAssigned: true,
      });

      // For each meter → fetch decoded data (latest per hour)
      const meterData = await Promise.all(
        meters.map(async (meter) => {
          // Build query for meter decoded data
          const matchQuery = { meterId: meter._id };

          // Always apply startDate and endDate now (default = today)
          matchQuery.timestamp = {};
          if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
          if (endDate) matchQuery.timestamp.$lte = new Date(endDate);

          // Fetch decoded data → only latest record per hour
          const decodedData = await MeterDecodedData.aggregate([
            { $match: matchQuery },

            // Sort by timestamp descending (latest first)
            { $sort: { timestamp: -1 } },

            // Group by year, month, day, hour → pick the first (latest) per hour
            {
              $group: {
                _id: {
                  year: { $year: "$timestamp" },
                  month: { $month: "$timestamp" },
                  day: { $dayOfMonth: "$timestamp" },
                  hour: { $hour: "$timestamp" },
                },
                latestRecord: { $first: "$$ROOT" },
              },
            },

            // Replace root with the selected latestRecord
            { $replaceRoot: { newRoot: "$latestRecord" } },

            // Sort ascending for chart plotting
            { $sort: { timestamp: 1 } },

            // Pick only required fields
            {
              $project: {
                _id: 1,
                cum_eb_kwh: 1,
                cum_dg_kwh: 1,
                balance_amount: 1,
                voltage_r: 1,
                timestamp: 1,
              },
            },
          ]);
console.log("==csxvsxbnxbdc==",  meter,
            decodedData,)
          // Return meter with its filtered decoded data
          return {
            meter,
            decodedData,
          };
        })
      );

      // Return user object with their meters
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        meters: meterData,
      };
    })
  );
console.log("===userDataWithMeters======",userDataWithMeters)
  return userDataWithMeters;
};

const addAdminDashboardStat = async () => {
  const adminIds = await Meter.distinct("adminId");
  const results = [];

  for (const adminId of adminIds) {
    // Fetch data in parallel (bulk instead of per meter)
    const [totalUsers, assignedUserIds, meters] = await Promise.all([
      User.countDocuments({ adminId, role: "user" }),
      Meter.distinct("assignedUserId", { adminId, isAssigned: true }),
      Meter.find({ adminId }).select(
        "-actionHistory" // ❌ exclude actionHistory
      ),
    ]);

    if (!meters.length) continue;

    const meterIds = meters.map((m) => m._id);

    // Fetch latest decoded data for all meters at once
    const meterDecodedData = await MeterDecodedData.aggregate([
      { $match: { meterId: { $in: meterIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$meterId",
          latest: { $first: "$$ROOT" },
        },
      },
    ]);
 

    // Fetch successful payments for these meters
    const payments = await Payment.find({
      meterId: { $in: meterIds },
      status: "success",
    })
      .sort({ createdAt: -1 })
      .lean();

    // --- Meter status counts (no need Promise.all, just loop once) ---
    const totalMeters = meters.length;

    let totalConsumption = 0;
    let totalEbConsumption = 0;
    let totalDgConsumption = 0;
    let totalActiveMeters = 0;
    let totalOfflineMeters = 0;
    let totalFaultyMeters = 0;
    let costDgPerUnit = 0;
    let costEbPerUnit = 0;

    let faultyMeters = []; // ✅ faulty meters list
    let onlineMeters = [];
    let offlineMeters = [];

    for (const meter of meters) {
      const decoded = meterDecodedData.find(
        (m) => String(m._id) === String(meter._id)
      )?.latest;

      if (!decoded) {
        // No decoded data at all → faulty
        totalFaultyMeters += 1;
        faultyMeters.push(meter); // ✅ add meterId
        continue;
      }

      // Check last updated time
      const lastUpdated = new Date(decoded.timestamp);
      const minutesDiff =
        (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (minutesDiff > 24) {
        // Data purane time se nahi aaya → faulty
        totalFaultyMeters += 1;
        faultyMeters.push(meter); // ✅ add meterId
        continue;
      }

      // ✅ Consumption
      const eb = decoded?.cum_eb_kwh?.value || 0;
      const dg = decoded?.cum_dg_kwh?.value || 0;
      totalEbConsumption += eb;
      totalDgConsumption += dg;
      totalConsumption += eb + dg;

      // ✅ Tariff cost (latest data ke basis par overwrite hoga)
      if (decoded?.eb_tariff_setting?.value != null) {
        costEbPerUnit = decoded.eb_tariff_setting.value;
      }
      if (decoded?.dg_tariff_setting?.value != null) {
        costDgPerUnit = decoded.dg_tariff_setting.value;
      }

      // ✅ Status check
      if (decoded?.relay_status?.value === 1) {
        totalActiveMeters += 1;
        onlineMeters.push(meter); // ✅ add meterId
      } else if (decoded?.relay_status?.value === 0) {
        totalOfflineMeters += 1;
        offlineMeters.push(meter); // ✅ add meterId
      }
    }

    // --- Total revenue (aggregate only once) ---
    const revenueResult = await Payment.aggregate([
      {
        $match: {
          status: "success",
          amount: { $gte: 0 },
          meterId: { $in: meterIds },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = revenueResult.length
      ? revenueResult[0].totalRevenue
      : 0;

    // --- Negative revenue & due users ---
    let negativeRevenue = 0;
    const dueUsersSet = new Set();

    // Only need latest payment per meter
    const latestPaymentsMap = new Map();
    for (const payment of payments) {
      if (!latestPaymentsMap.has(String(payment.meterId))) {
        latestPaymentsMap.set(String(payment.meterId), payment);
      }
    }

    for (const meter of meters) {
      const latestPayment = latestPaymentsMap.get(String(meter._id));
      if (latestPayment && latestPayment.amount < 0) {
        negativeRevenue += latestPayment.amount;
        if (meter.assignedUserId) {
          dueUsersSet.add(String(meter.assignedUserId));
        }
      }
    }

    const totalDueUser = dueUsersSet.size;

    // --- Power Factor ---
    let totalPowerFactor = 0;
    let meterCount = 0;
    for (const { latest } of meterDecodedData) {
      if (latest?.power_factor?.value != null) {
        totalPowerFactor += latest.power_factor.value;
        meterCount++;
      }
    }

    const newEntry = await AdminDashboard.create({
      adminId,
      totalUsers,
      totalAssignedUsers: assignedUserIds.filter(Boolean).length,
      totalMeters,
      totalActiveMeters,
      totalFaultyMeters,
      faultyMeters,
      onlineMeters,
      offlineMeters,
      totalOfflineMeters,
      costDgPerUnit,
      costEbPerUnit,
      totalEbConsumption: Number(totalEbConsumption.toFixed(2)),
      totalDgConsumption: Number(totalDgConsumption.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      negativeRevenue: Number(negativeRevenue.toFixed(2)),
      totalDueUser,
      totalConsumption: Number(totalConsumption.toFixed(2)),
      totalPowerFactor: Number(totalPowerFactor.toFixed(2)),
      createdAt: new Date(),
    });

    console.log(`✅ Created dashboard for admin ${adminId}`);
    results.push(newEntry);
  }

  return results;
};

const getMeterIssuesByAdmin = async (adminId) => {
  let  MetersDataWithIssuesLast5Days= await  getMetersWithIssuesLast5Days(adminId)
  const issueTypes = [
    "Neutral Voltage Issue",
    "Magnetic Interference",
    "Current Imbalance",
    "Reverse Polarity",
  ];

  // Last 7 days range
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 15
);

  // Find notifications for this adminId with matching issues in the last 7 days
  const notifications = await Notification.find({
    adminId,
    "userNotification.alertType": { $in: issueTypes },
    "userNotification.time": { $gte: sevenDaysAgo }, // ✅ filter last 7 days
  })
    .populate("meterId")
    .populate("userId")
    .populate("adminId");

  if (!notifications.length) {
    return { meterCount: 0, meters: [] };

  }
// console.log("==notifications.length==",notifications)
  // Group by meterId
  const meterMap = new Map();

  notifications.forEach((notif) => {
    const meterId = notif.meterId?._id?.toString();
    if (!meterId) return;

    // Collect all relevant issues from this notification
    const issues = notif.userNotification
      .filter(
        (n) =>
          issueTypes.includes(n.alertType) &&
          new Date(n.time) >= sevenDaysAgo // ✅ filter inside userNotification too
      )
      .map((n) => ({
        type: n.alertType,
        message: n.message,
        lastDetected: n.time,
      }));

    if (!issues.length) return; // skip if no issues in last 7 days

    if (!meterMap.has(meterId)) {
      meterMap.set(meterId, {
        meter: {
          id: notif.meterId?._id,
          meterId: notif.meterId?.meterId,
          name: notif.meterId?.name,
          type: notif.meterId?.type,
          meterSerialNumber: notif.meterId?.meterSerialNumber,
          slaveId: notif.meterId?.slaveId,
          status: notif.meterId?.status,
        },
        user: {
          id: notif.userId?._id,
          name: notif.userId?.name,
          email: notif.userId?.email,
        },
        admin: {
          id: notif.adminId?._id,
          name: notif.adminId?.name,
          email: notif.adminId?.email,
        },
        issues: [],
      });
    }

    // Merge issues into existing list
    const meterData = meterMap.get(meterId);
    meterData.issues.push(...issues);

    // Remove duplicates (keep latest time for each type)
    const deduped = Object.values(
      meterData.issues.reduce((acc, issue) => {
        if (
          !acc[issue.type] ||
          new Date(issue.lastDetected) > new Date(acc[issue.type].lastDetected)
        ) {
          acc[issue.type] = issue;
        }
        return acc;
      }, {})
    );

    // Sort issues so latest comes first
    meterData.issues = deduped.sort(
      (a, b) => new Date(b.lastDetected) - new Date(a.lastDetected)
    );

    meterMap.set(meterId, meterData);
  });

  const meters = Array.from(meterMap.values());

// console.log("======meters === MetersDataWithIssuesLast5Days===",meters , MetersDataWithIssuesLast5Days)
  return {
    meterCount: meters.length, // ✅ count of unique meters with tempered issues in last 7 days
    meters,
    MetersDataWithIssuesLast5Days
  };
};


const getMetersWithIssuesLast5Days = async (adminId) => {
  const issueTypes = [
    "Neutral Voltage Issue",
    "Magnetic Interference",
    "Current Imbalance",
    "Reverse Polarity",
  ];

  const today = new Date();
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 4); // inclusive of today (5 days)

  // Step 1: Fetch all notifications for last 5 days
  const notifications = await Notification.find({
    adminId,
    "userNotification.alertType": { $in: issueTypes },
    "userNotification.time": { $gte: fiveDaysAgo },
  })
    .populate("meterId")
    .populate("userId")
    .populate("adminId");

  if (!notifications.length) {
    return { meterCount: 0, meters: [] };
  }

  // Step 2: Group notifications by meter
  const meterMap = new Map();

  notifications.forEach((notif) => {
    const meterId = notif.meterId?._id?.toString();
    if (!meterId) return;

    const issues = notif.userNotification
      .filter(
        (n) =>
          issueTypes.includes(n.alertType) &&
          new Date(n.time) >= fiveDaysAgo
      )
      .map((n) => ({
        type: n.alertType,
        message: n.message,
        lastDetected: n.time,
      }));

    if (!issues.length) return;

    if (!meterMap.has(meterId)) {
      meterMap.set(meterId, {
        meter: {
          id: notif.meterId?._id,
          meterId: notif.meterId?.meterId,
          name: notif.meterId?.name,
          type: notif.meterId?.type,
          meterSerialNumber: notif.meterId?.meterSerialNumber,
          slaveId: notif.meterId?.slaveId,
          status: notif.meterId?.status,
        },
        user: {
          id: notif.userId?._id,
          name: notif.userId?.name,
          email: notif.userId?.email,
        },
        admin: {
          id: notif.adminId?._id,
          name: notif.adminId?.name,
          email: notif.adminId?.email,
        },
        issues: [],
      });
    }

    const meterData = meterMap.get(meterId);
    meterData.issues.push(...issues);

    // Deduplicate by type (keep latest)
    const deduped = Object.values(
      meterData.issues.reduce((acc, issue) => {
        if (
          !acc[issue.type] ||
          new Date(issue.lastDetected) > new Date(acc[issue.type].lastDetected)
        ) {
          acc[issue.type] = issue;
        }
        return acc;
      }, {})
    );

    meterData.issues = deduped.sort(
      (a, b) => new Date(b.lastDetected) - new Date(a.lastDetected)
    );

    meterMap.set(meterId, meterData);
  });

  // Step 3: Filter meters that have issues on ALL last 5 consecutive days
  const result = [];

  for (const meterData of meterMap.values()) {
    // Unique days where issues were found
    const daysWithIssues = new Set(
      meterData.issues.map((issue) =>
        new Date(issue.lastDetected).toISOString().slice(0, 10)
      )
    );

    let hasAll5Days = true;
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      if (!daysWithIssues.has(dayKey)) {
        hasAll5Days = false;
        break;
      }
    }

    if (hasAll5Days) {
      result.push(meterData);
    }
  }

  return {
    meterCount: result.length,
    meters: result,
  };
};
module.exports = {
  getLatestAdminDashboardStat,
  getAdminConsumptionByDate,
  getUserDataByAdminId,
  getMeterDataByAdminId,
  addAdminDashboardStat,
  getLatestOfflineOnlineFaultyMeter,
    getMeterIssuesByAdmin,
};

