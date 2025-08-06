const Meter = require('../model/Meter');
const User = require('../model/User');
const MeterDecodedData = require('../model/MeterData');
const { meterReadingValidator } = require('../validator/meterDataValidator');
const meterDataService = require('../service/meterDataService');
const axios = require('axios');
const generateTokenFromIOT = require('../utils/jwtGeneratorIOT');
const { dailyDataCollectionPerMeter } = require('../helper/DailyDataCollectionJOB');
const DailyMeterSummary = require('../model/DailyMeterSummary');
const status = require('statuses');

//smartlynk-apis
const saveMeterReading = async (req, res) => {
  try {
    // Step 1: Validate incoming data
    const validatedReading = meterReadingValidator.parse(req.body);
    console.log("Validated reading data:", validatedReading);
    console.log("Validated reading data:", validatedReading.meter_serial_number.value, validatedReading.slave_id.value);
    // Step 2: Check if the meter is registered
    const meter = await Meter.findOne({ meterSerialNumber: validatedReading.meter_serial_number.value, slaveId: validatedReading.slave_id.value });
    if (!meter) {
      return res.status(404).json({ error: "Please register the meter in the Metering solution first." });
    }

    // Step 3: Attach meterId from the found meter
    validatedReading.meterId = meter._id;

    // Create reading instance using `new`
    const reading = new MeterDecodedData(validatedReading);

    // Save it to the DB
    await reading.save();

    return res.status(201).json({
      message: "Meter reading saved successfully",
      data: validatedReading,
    });
  } catch (err) {
    console.error("Error saving meter reading:", err);
    return res.status(400).json({
      error: err.errors?.[0]?.message || err.message || "Invalid data",
    });
  }
};
const getMeterDatafromSmartlynk = async (req, res) => {
  try {
    const superAdmin = await User.findById(process.env.SUPER_ADMIN_ID);
    console.log("superAdmin", superAdmin);
    console.log("email", superAdmin.email);

    if (!superAdmin || !superAdmin.email) {
      console.error("Super admin not found or missing email.");
      return null;
    }

    const jwtToken = generateTokenFromIOT(superAdmin.email);
    console.log(jwtToken);

    console.log("➡️ Calling SmartLynk URL:", `${process.env.SMARTLYNK_BASE_URL}/get-meterData`);

    const response = await axios.get(
      `${process.env.SMARTLYNK_BASE_URL}/get-meterData`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (response.status === 200) {
      return res.status(200).json({ message: "success", data: response.data.data });
    }
    return res.status(500).json({ message: "server error" });
  } catch (error) {
    console.error("Failed to fetch SmartLynk meter data:", error.message);
    throw error;
  }
};

//iot apis
const getAllMetersDataByUserID = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return req.status(404).json({ message: "user not found" });
    }

    const response = await meterDataService.getMeterDataByUserId(id, user);

  } catch (error) {
    return res.status(500).json({ messsage: "server error", error: `${error}` })
  }
}

const sendDownlink = async (req, res) => {
  try {
    const { payload, port } = req.body;

    console.log("Received payload -->", payload);
    console.log("Port -->", port);

    //find user meter using the userId
    const meter = await Meter.findById(payload.id);
    if (!meter) {
      return res.status(404).json({ message: "No meter found for the user." });
    }

    const superAdmin = await User.findById(process.env.SUPER_ADMIN_ID);

    console.log("superAdmin-------------------->", superAdmin);
    console.log("email", superAdmin.email);

    if (!superAdmin || !superAdmin.email) {
      console.error("Super admin not found or missing email.");
      return null;
    }

    const jwtToken = generateTokenFromIOT(superAdmin.email);
    console.log(jwtToken);

    console.log("--------➡️ ", meter);
    const payloadForDownlink = {
      EUI: meter.deviceId,
      commandName: payload.commandType.toUpperCase(),
      value: payload.value,
    };
    const response = await axios.post(
      `${process.env.SMARTLYNK_BASE_URL}/custom-meter-commands`, payloadForDownlink,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    if (response.status === 200) {
      const actionHistoryEntry = {
        status: 'success',
        action: `Command: ${payload.commandType.toUpperCase()}`,
        timestamp: new Date()
      };

      // 4. Add the action to meter's history
      meter.actionHistory.push(actionHistoryEntry);
      await meter.save();
      console.log("Downlink command sent successfully:", response.data);
      return res.status(200).json({ message: "downlink sent sucessfully", data: response.data });
    } else {
      const actionHistoryEntry = {
        status: 'failed',
        action: `Command: ${payload.commandType.toUpperCase()}`,
        timestamp: new Date()
      };
      // 4. Add the action to meter's history
      meter.actionHistory.push(actionHistoryEntry);
      await meter.save();
      console.error("Failed to send downlink command:", response.data);
      return res.status(500).json({ message: "Failed to send downlink command", error: response.data });
    }

  } catch (error) {
    console.error("Failed to send downlink to SmartLynk:", error.message);
    throw error;
  }
};

//testing the cronjob function
const testCron = async (req, res) => {
  try {
    console.log('inside the testcorn function');
    const data = await dailyDataCollectionPerMeter();
    console.log(data);
    res.status(200).send('Job executed successfully!');
  } catch (err) {
    res.status(500).send('Job execution failed');
  }
};
const getMeterDataDaily = async (req, res) => {
  try {
    const userId = req.user.id;
    const meter = await Meter.findOne({ assignedUserId: userId });
    if (!meter) {
      return res.status(404).json({ message: "No meter found for the user." });
    }
    const meterData = await MeterDecodedData.find({ meterId: meter._id, createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) } });
    if (!meterData || meterData.length === 0) {
      return res.status(404).json({ message: "No meter data found for the last 24 hours." });
    }
    return res.status(200).json(meterData);
  } catch (error) {
    console.error("Error fetching daily meter data:", error);
    return res.status(500).json({ message: "Server error while fetching daily meter data." });
  }
};


const getMeterData30Days = async (req, res) => {
  try {

    const userId = req.user.id;

    console.log("User ID:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    //find the meter using the userId
    const meter = await Meter.findOne({ assignedUserId: userId });
    console.log("Meter:", meter);
    if (!meter) {
      return res.status(404).json({ message: "No meter found for the user." });
    }
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 31);
    startDate.setHours(0, 0, 0, 0); // Start of the day

    const endDate = new Date();
    endDate.setDate(now.getDate() - 1);
    endDate.setHours(23, 59, 59, 999); // End of the day
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log(meter._id);
    const meterData = await DailyMeterSummary.find({
      meterId: meter._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    console.log("Meter Data:", meterData);
    if (!meterData || meterData.length === 0) {
      return res.status(404).json({ message: "No meter data found for the last 30 days." });
    }
    return res.status(200).json(meterData);
  } catch (error) {
    console.error("Error fetching 30 days meter data:", error);
    return res.status(500).json({ message: "Server error while fetching 30 days meter data." });
  }
};


module.exports = { saveMeterReading, getAllMetersDataByUserID, getMeterDatafromSmartlynk, sendDownlink, testCron, getMeterDataDaily, getMeterData30Days };
