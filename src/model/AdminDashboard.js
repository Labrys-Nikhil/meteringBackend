// // model/AdminDashboardStats.js
// const mongoose = require("mongoose");

// const adminDashboardStatsSchema = new mongoose.Schema({
//   adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

//   totalUsers: { type: Number, default: 0 },
//   totalAssignedUsers: { type: Number, default: 0 },
//   totalMeters: { type: Number, default: 0 },
//   totalActiveMeters: { type: Number, default: 0 },
//   totalFaultyMeters: { type: Number, default: 0 },
//   totalRevenue: { type: Number, default: 0 },
//   negativeRevenue: { type: Number, default: 0 },
//   totalConsumption: { type: Number, default: 0 },
//   totalPowerFactor: { type: Number, default: 0 },

//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("AdminDashboard", adminDashboardStatsSchema);

const mongoose = require("mongoose");

const adminDashboardStatsSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  totalUsers: { type: Number, default: 0 },
  totalAssignedUsers: { type: Number, default: 0 },
  totalMeters: { type: Number, default: 0 },
  totalActiveMeters: { type: Number, default: 0 },
  totalFaultyMeters: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  negativeRevenue: { type: Number, default: 0 },
  totalDueUser:{type:Number, default:0},
  totalConsumption: { type: Number, default: 0 },
  totalOfflineMeters: { type: Number, default: 0 },
  totalEbConsumption: { type: Number, default: 0 },
  totalDgConsumption: { type: Number, default: 0 },

  updatedAt: { type: Date, default: Date.now }
},{timestamps: true});

module.exports = mongoose.model("AdminDashboard", adminDashboardStatsSchema);