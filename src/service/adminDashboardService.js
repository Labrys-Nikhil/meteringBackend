// service/dashboardService.js
const mongoose = require("mongoose");
const User = require("../model/User");
const Meter = require("../model/Meter");
const MeterDecodedData = require("../model/MeterData");
const AdminDashboard = require("../model/AdminDashboard");
// const DailyMeterData = require("../model/DailyMeterData");
const Payment = require("../model/Payment");


const getLatestAdminDashboardStat = async (adminId) => {
    const data = await AdminDashboard.findOneAndUpdate({ adminId })
        .sort({ updatedAt: -1 })
        .lean();

    return data;
};
const getAdminConsumptionByDate = async (adminId, from, to) => {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid adminId");
    }

    const query = { adminId: new mongoose.Types.ObjectId(adminId) };

    if (from || to) {
        query.updatedAt = {};
        if (from) query.updatedAt.$gte = new Date(from);
        if (to) query.updatedAt.$lte = new Date(to);
    } else {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - 7);

        query.updatedAt = {
            $gte: fromDate,
            $lte: toDate,
        };
    }

    const result = await AdminDashboard.aggregate([
        { $match: query },

        { $sort: { updatedAt: -1 } },

        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                latestUpdatedAt: { $first: "$updatedAt" },
                latestTotalUsers: { $first: "$totalUsers" },
                latestTotalAssignedUsers: { $first: "$totalAssignedUsers" },
                latestTotalMeters: { $first: "$totalMeters" },
                latestTotalActiveMeters: { $first: "$totalActiveMeters" },
                latestTotalFaultyMeters: { $first: "$totalFaultyMeters" },
                latestTotalRevenue: { $first: "$totalRevenue" },
                latestNegativeRevenue: { $first: "$negativeRevenue" },
                latestTotalConsumption: { $first: "$totalConsumption" },
                latestTotalPowerFactor: { $first: "$totalPowerFactor" },
                latestTotalOfflineMeters: { $first: "$totalOfflineMeters" },
                latestTotalEbConsumption: { $first: "$totalEbConsumption" },
                latestTotalDgConsumption: { $first: "$totalDgConsumption" }
            }
        },

        { $sort: { _id: 1 } },

        {
            $setWindowFields: {
                sortBy: { _id: 1 },
                output: {
                    prevTotalUsers: { $shift: { output: "$latestTotalUsers", by: -1 } },
                    prevTotalMeters: { $shift: { output: "$latestTotalMeters", by: -1 } },
                    prevTotalRevenue: { $shift: { output: "$latestTotalRevenue", by: -1 } },
                    prevTotalFaultyMeters: { $shift: { output: "$latestTotalFaultyMeters", by: -1 } },
                    prevTotalOfflineMeters: { $shift: { output: "$latestTotalOfflineMeters", by: -1 } },
                    prevTotalConsumption: { $shift: { output: "$latestTotalConsumption", by: -1 } },
                    prevTotalPowerFactor: { $shift: { output: "$latestTotalPowerFactor", by: -1 } },
                    prevTotalEbConsumption: { $shift: { output: "$latestTotalEbConsumption", by: -1 } },
                    prevTotalDgConsumption: { $shift: { output: "$latestTotalDgConsumption", by: -1 } }
                }
            }
        },

        {
            $project: {
                _id: 1,
                latestUpdatedAt: 1,

                latestTotalUsers: 1,
                dailyTotalUsers: { $subtract: ["$latestTotalUsers", "$prevTotalUsers"] },

                latestTotalMeters: 1,
                dailyTotalMeters: { $subtract: ["$latestTotalMeters", "$prevTotalMeters"] },

                latestTotalRevenue: 1,
                dailyTotalRevenue: { $round: [{ $subtract: ["$latestTotalRevenue", "$prevTotalRevenue"] }, 2] },

                latestTotalFaultyMeters: 1,
                dailyTotalFaultyMeters: { $subtract: ["$latestTotalFaultyMeters", "$prevTotalFaultyMeters"] },

                latestTotalOfflineMeters: 1,
                dailyTotalOfflineMeters: { $subtract: ["$latestTotalOfflineMeters", "$prevTotalOfflineMeters"] },

                latestTotalConsumption: 1,
                dailyTotalConsumption: { $round: [{ $subtract: ["$latestTotalConsumption", "$prevTotalConsumption"] }, 2] },

                latestTotalPowerFactor: 1,
                dailyTotalPowerFactor: { $round: [{ $subtract: ["$latestTotalPowerFactor", "$prevTotalPowerFactor"] }, 2] },

                latestTotalEbConsumption: 1,
                dailyTotalEbConsumption: { $round: [{ $subtract: ["$latestTotalEbConsumption", "$prevTotalEbConsumption"] }, 2] },

                latestTotalDgConsumption: 1,
                dailyTotalDgConsumption: { $round: [{ $subtract: ["$latestTotalDgConsumption", "$prevTotalDgConsumption"] }, 2] }
            }
        }
    ]);

    return result;
};

const getMeterDataByAdminId = async (adminId) => {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid adminId");
    }
    const meterData = await Meter.find({ adminId })

    console.log("Meter Data for Admin:", meterData);
    return meterData;
}

const getUserDataByAdminId = async (adminId, startDate, endDate) => {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid adminId");
    }

    const users = await User.find({ adminId, role: "user" })
        .select("_id name email phoneNumber createdAt updatedAt");

    console.log("====users=====", users)

    const userDataWithMeters = await Promise.all(
        users.map(async (user) => {
            const meters = await Meter.find({
                adminId: adminId,
                assingnedUserId: user._id,
                isAssigned: true,
            })

            //       const assignedMeters = await Meter.find({
            //   adminId: adminId,
            //   assingnedUserId: user._id ,
            //       isAssigned: true,   // not "assignedUserId"
            // });
            console.log("====meters=====", meters)

            const meterData = await Promise.all(
                meters.map(async (meter) => {
                    const query = { meterId: meter._id.toString() };

                    //  If date filter is passed
                    if (startDate || endDate) {
                        query.date = {};
                        if (startDate) query.date.$gte = new Date(startDate);
                        if (endDate) query.date.$lte = new Date(endDate);
                    } else {
                        // Default: Latest 7 days
                        const latest7Days = await DailyMeterData.find({ meterId: meter._id.toString() })
                            .sort({ date: -1 })
                            .limit(7)
                            .select("date");
                        console.log("=====dailyData1======", latest7Days)

                        const latestDates = latest7Days.map((entry) => entry.date);
                        query.date = { $in: latestDates };
                    }

                    const dailyData = await DailyMeterData.find(query)
                        .sort({ date: 1 }) // sort ascending for charts/tables
                        .select("totalKWh totalDeduction totalEG totalDG date -_id");
                    console.log("=====dailyData1======", dailyData)
                    return {
                        // meterId: meter._id,
                        // meterName: meter.meterName,
                        meter,
                        dailyData
                    };
                })
            );

            return {
                userId: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                meters: meterData
            };
        })
    );

    return userDataWithMeters;
};
const addAdminDashboardStat = async () => {
    const adminIds = await Meter.distinct("adminId");

    //   const meterIds = await Meter.find({ adminId: { $in: adminIds } }).distinct("_id");
    // console.log("meterIds for mongo db: =============", meterIds);

    //   const meterDecodedData = await MeterDecodedData.find({ meterId: { $in: meterIds } });
    // console.log("Meter Decoded Data: =============", meterDecodedData);
    // const meterId = await Meter.find({ adminId: { $in: adminIds } }).distinct("meterId");
    // console.log("meterId for Manually createed: =============", meterId);
    // console.log("Admin IDs: =============", adminIds);
    const results = [];

    for (const adminId of adminIds) {
        const totalUsers = await User.countDocuments({ adminId, role: "user" });

        const assignedUsers = await Meter.distinct("assingnedUserId", {
            adminId,
            isAssigned: true,
        });
        const totalAssignedUsers = assignedUsers.filter(Boolean).length;

        const totalMeters = await Meter.countDocuments({ adminId });
        const totalActiveMeters = await Meter.countDocuments({
            adminId,
            status: "online",
        });
        const totalFaultyMeters = await Meter.countDocuments({
            adminId,
            status: "faulty",
        });

        // Get meters for this admin
        const meters = await Meter.find({ adminId });

        let totalConsumption = 0;

        for (const meter of meters) {
            // Get only the latest decoded data entry for this meter
            const latest = await MeterDecodedData.findOne({
                meterId: meter._id,
            }).sort({ timestamp: -1 });

            if (latest) {
                const eb = latest.cum_eb_kwh?.value || 0;
                const dg = latest.cum_dg_kwh?.value || 0;
                const combined = eb + dg;

                totalConsumption += combined;

                console.log(
                    `✅ ${meter.meterId} | EB: ${eb} + DG: ${dg} = ${combined} kWh`
                );
            } else {
                console.log(`⚠️ Meter ${meter.meterId} has no readings`);
            }
        }

        console.log(
            `🔢 Total Admin Consumption: ${totalConsumption.toFixed(2)} kWh`
        );

        // Step 1: Calculate total revenue (excluding negative payments)
        const revenue = await Payment.aggregate([
            {
                $match: {
                    status: "success",
                    amount: { $gte: 0 }, // ✅ Exclude negative
                },
            },
            {
                $lookup: {
                    from: "meters", // your meters collection name in MongoDB
                    localField: "meterId",
                    foreignField: "_id",
                    as: "meter",
                },
            },
            { $unwind: "$meter" },
            {
                $match: {
                    "meter.adminId": new mongoose.Types.ObjectId(adminId),
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                },
            },
        ]);

        const totalRevenue = revenue[0]?.totalRevenue || 0;

        // STEP 2: Calculate total negative revenue
        const negativeRevenueAgg = await Payment.aggregate([
            {
                $match: {
                    status: "success",
                    amount: { $lt: 0 }, // Only negatives
                },
            },
            {
                $lookup: {
                    from: "meters",
                    localField: "meterId",
                    foreignField: "_id",
                    as: "meter",
                },
            },
            { $unwind: "$meter" },
            {
                $match: {
                    "meter.adminId": new mongoose.Types.ObjectId(adminId),
                },
            },
            {
                $group: {
                    _id: null,
                    negativeRevenue: { $sum: "$amount" },
                },
            },
        ]);

        const negativeRevenue = negativeRevenueAgg[0]?.negativeRevenue || 0;

        console.log(" Total Revenue (excluding negatives):", totalRevenue);
        console.log(" Negative Payments (excluded):", negativeRevenue);

        let totalPowerFactor = 0;
        let meterCount = 0;

        for (const meter of meters) {
            const latest = await MeterDecodedData.findOne({
                meterId: meter._id,
            }).sort({ timestamp: -1 });

            if (latest) {
                totalPowerFactor += latest.power_factor.value;
                meterCount += 1;

                console.log(
                    `✅ Meter ${meter.meterId} → Latest Power Factor: ${latest.power_factor.value} ->> Total Power Factor: ${totalPowerFactor.toFixed(2)} -> tiemstamp: ${latest.timestamp.toLocaleDateString()} -> ${latest.timestamp.toLocaleTimeString()}`
                );
            } else {
                console.log(`⚠️ Meter ${meter.meterId} has no valid power factor`);
            }
        }

        const newEntry = await AdminDashboard.create({
            adminId,
            totalUsers,
            totalAssignedUsers,
            totalMeters,
            totalActiveMeters,
            totalFaultyMeters,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            negativeRevenue: Number(negativeRevenue.toFixed(2)),
            totalConsumption: Number(totalConsumption.toFixed(2)),
            totalPowerFactor: Number(totalPowerFactor.toFixed(2)),
            createdAt: new Date(),
        });
        console.log(` Created new dashboard entry for admin ${adminId}:`, newEntry);
        results.push(newEntry);
    }

    return results;
};
module.exports = {
    getLatestAdminDashboardStat,
    getAdminConsumptionByDate,
    getUserDataByAdminId,
    getMeterDataByAdminId,
    addAdminDashboardStat
};