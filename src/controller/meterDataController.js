const Meter = require('../model/Meter');
const User = require('../model/User');

const MeterDecodedData = require('../model/MeterData');
const { meterReadingValidator } = require('../validator/meterDataValidator');
const { meterValidator } = require('../validator/meterValidator');
const generateDevEUI = require('../helper/generateDevEUI');


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
const addMeter = async (req, res) => {
    try {
        // Validate the incoming data
        const { type, name, meterSerialNumber, slaveId, status, adminId } = req.body;
        console.log("Received data for new meter:", type, name, meterSerialNumber, slaveId, status, adminId);

        if (!name || !meterSerialNumber || !slaveId || !adminId) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const devEUI = generateDevEUI(meterSerialNumber, slaveId);
        const meterId = `M-${devEUI}`;
        const validatedMeterData = meterValidator.parse({
            devEUI,
            ...req.body,
        });

        // Check if the meter already exists
        const existingMeter = await Meter.findOne(
            {
                meterSerialNumber: validatedMeterData.meterSerialNumber,
                slaveId: validatedMeterData.slaveId
            }
        );
        if (existingMeter) {
            return res.status(400).json({ error: "Meter with this serial number already exists." });
        }

        //check if the userId exists or not
        const adminExists = await User.findById(validatedMeterData.adminId);
        if (!adminExists) {
            return res.status(404).json({ error: "User not found." });
        }

        // Create a new meter instance
        const newMeter = new Meter({
            meterId: meterId,
            devEUI: validatedMeterData.devEUI,
            name: validatedMeterData.name,
            type: validatedMeterData.type,
            meterSerialNumber: validatedMeterData.meterSerialNumber,
            slaveId: validatedMeterData.slaveId,
            status: validatedMeterData.status || "offline",
            lastSeen: validatedMeterData.lastSeen || new Date(),
            adminId: validatedMeterData.adminId,
        });

        // Save the new meter to the database
        await newMeter.save();

        return res.status(201).json({ message: "New meter added successfully", data: newMeter });
    } catch (error) {
        console.error("Error adding meter:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
const assignMeter = async (req, res) => {
  try {
    const { userId, meterId } = req.body;

    // Check if the meter exists
    const meter = await Meter.findOne({ meterId });

    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }

    // Check if it's already assigned
    if (meter.isAssigned === true) {
      return res.status(400).json({ message: "Meter is already assigned" });
    }

    meter.userId = userId;
    meter.isAssigned = true;

    await meter.save();

    return res.status(201).json({ message: "Meter assigned successfully" });
  } catch (err) {
    console.error(" Error assigning meter:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateMeter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, meterSerialNumber, slaveId, status, userId } = req.body;

        // Validate the incoming data
        if (!name || !meterSerialNumber || !slaveId || !userId) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if the meter exists
        const meter = await Meter.findById(id);
        if (!meter) {
            return res.status(404).json({ error: "Meter not found." });
        }

        // Update the meter details
        meter.name = name;
        meter.type = type;
        meter.meterSerialNumber = meterSerialNumber;
        meter.slaveId = slaveId;
        meter.status = status || "offline";
        meter.userId = userId;

        // Save the updated meter
        await meter.save();

        return res.status(200).json({ message: "Meter updated successfully", data: meter });
    } catch (error) {
        console.error("Error updating meter:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
const deleteMeter = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the meter exists
        const meter = await Meter.findById(id);
        if (!meter) {
            return res.status(404).json({ error: "Meter not found." });
        }

        // Delete the meter
        await Meter.findByIdAndDelete(id);

        return res.status(200).json({ message: "Meter deleted successfully" });
    } catch (error) {
        console.error("Error deleting meter:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
const getAllMeters = async (req, res) => {
    try {
        // Fetch all meters from the database
        const meters = await Meter.find().populate('userId', 'name email');

        if (meters.length === 0) {
            return res.status(404).json({ message: "No meters found." });
        }

        return res.status(200).json({ data: meters });

    } catch(error){
        console.error("Error deleting meter:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const getMeterById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the meter exists
        const meter = await Meter.findById(id).populate('userId', 'name email');
        if (!meter) {
            return res.status(404).json({ error: "Meter not found." });
        }

        return res.status(200).json({ data: meter });
    } catch (error) {
        console.error("Error fetching meter by ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { saveMeterReading, addMeter, updateMeter, deleteMeter, getAllMeters, getMeterById, assignMeter };
