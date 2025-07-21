const Meter = require("../model/Meter");
const DailyMeterSummary = require("../model/DailyMeterSummary");
const MeterData = require("../model/MeterData");

const dailyDataCollectionPerMeter = async () => {
    try {
        const allMeters = await Meter.find().populate('assignedUserId', 'name email');

        for (const meter of allMeters) {
            await calculateData(meter);
        }

        console.log(" Daily data processing completed.");
    } catch (err) {
        console.error(" Error in dailyDataCollectionPerMeter:", err);
    }
};

const calculateData = async (meter) => {
    const meterId = meter._id;
    const assignedUserId = meter.assignedUserId?._id;
    const assignedTimestamp = new Date(meter.assignedTimestamp);

    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    let readingStartTime;

    const assignedWithinYesterday =
        assignedTimestamp > startOfYesterday && assignedTimestamp < endOfYesterday;

    if (assignedWithinYesterday) {
        readingStartTime = assignedTimestamp; // use time of reassignment
    } else if (assignedTimestamp > endOfYesterday) {
        // user was assigned after the day ends – skip
        console.log(`Skipping meter ${meterId} – assigned after yesterday ended.`);
        return;
    } else {
        readingStartTime = startOfYesterday; // use full day
    }

    const readings = await MeterData.find({
        meterId,
        timestamp: {
            $gte: readingStartTime,
            $lte: endOfYesterday
        }
    }).sort({ timestamp: 1 });

    if (readings.length < 2) {
        console.log(`Skipping meter ${meterId} – not enough readings.`);
        return;
    }

    const firstReading = readings[0];
    const lastReading = readings[readings.length - 1];

    const totalEB = Number(lastReading.cum_eb_kwh.value) - Number(firstReading.cum_eb_kwh.value) ;
    const totalDG = Number(lastReading.cum_dg_kwh.value) - Number(firstReading.cum_dg_kwh.value);
    const totalKWh = totalEB + toatlDG;
    const totalDeduction = Number(lastReading.balance_amount.value) - Number(firstReading.balance_amount.value) ;

    await DailyMeterSummary.create({
        meterId,
        userId: assignedUserId,
        date: startOfYesterday,
        totalKWh:totalKWh,
        totalDeduction: totalDeduction,
        totalEG:totalEB,
        totalDG:totalDG,
    });

    console.log(` Summary saved for meter ${meterId}`);
};



module.exports = { dailyDataCollectionPerMeter }