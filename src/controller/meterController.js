const Meter = require('../model/Meter');
const User = require('../model/User');
const MeterDecodedData = require('../model/MeterData');
const Payment = require('../model/Payment');
const DailyMeterData = require('../model/DailyMeterSummary');
const { meterValidator } = require('../validator/meterValidator');
const generateDevEUI = require('../helper/generateDevEUI');

const addMeter = async (req, res) => {
    try {
        // Validate the incoming data
        const { type, name, meterSerialNumber, slaveId, status, adminId,deviceId } = req.body;
        console.log("Received data for new meter:", {type, name, meterSerialNumber, slaveId, status, adminId,deviceId});

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
            return res.status(404).json({ error: "admin not found." });
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
            deviceId:validatedMeterData.deviceId,
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
    const meter = await Meter.findOne({ deviceId:meterId });

    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }

    // Check if it's already assigned
    if (meter.isAssigned === true) {
      return res.status(400).json({ message: "Meter is already assigned" });
    }

    meter.assignedUserId = userId;
    meter.userAssignedTimestamp = new Date();
    console.log("meter data",meter);
   
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
        const { name, type, meterSerialNumber, slaveId, status, adminId } = req.body;

        // Validate the incoming data
        if (!name || !meterSerialNumber || !slaveId || !adminId) {
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
        meter.status = status;
        meter.adminId = adminId;

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
        const meters = await Meter.find().populate('assignedUserId', 'name email');

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
        const meter = await Meter.findById(id).populate('assignedUserId', 'name email');
        if (!meter) {
            return res.status(404).json({ error: "Meter not found." });
        }

        return res.status(200).json({ data: meter });
    } catch (error) {
        console.error("Error fetching meter by ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getMeterByMeterId = async (req, res) => {
  try {
    const { meterId } = req.params;
    const { startTime, endTime } = req.query;

    // Step 1: Find the meter by meterId string
    const meter = await Meter.findOne({ meterId });

    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }

    // Step 2: Build date filter (on "date" field)
    const dateFilter = {};
    if (startTime) dateFilter.$gte = new Date(startTime);
    if (endTime) {
      const end = new Date(endTime);
      end.setHours(23, 59, 59, 999); // Include full end day
      dateFilter.$lte = end;
    }

    const query = {
      meterId: meter._id,
      ...(startTime || endTime ? { date: dateFilter } : {})
    };

    // Step 3: Find summaries with optional date filtering
    const summaries = await DailyMeterData.find(query).sort({ date: -1 });

    res.status(200).json(summaries);
  } catch (error) {
    console.error("Error fetching meter summary data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAllMetersWithPaymentData = async (req, res) => {
  const {id} = req.user;
  console.log('---->',id);
  try {
    // Fetch all meters
    const meters = await Meter.find();
    console.log("---------->",meters);

    if (meters.length === 0) {
      return res.status(404).json({ message: "No meters found." });
    }

    // For each meter, get the latest decoded data (by createdAt descending)
    const metersWithBalance = await Promise.all(
      meters.map(async (meter) => {
        const latestReading = await MeterDecodedData.findOne({ meterId: meter._id })
          .sort({ createdAt: -1 });

        const balance = latestReading?.balance_amount?.value ?? null;

         const latestPayment = await Payment.findOne({
          meterId: meter._id,
          status: "success",
        })
          .sort({ createdAt: -1 });

        return {
          ...meter.toObject(),
          balanceAmount: balance,
          latestPayment:latestPayment
        };
      })
    );

    return res.status(200).json({ data: metersWithBalance });
  } catch (error) {
    console.error("Error fetching meters:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {getAllMeters,getMeterById,updateMeter,addMeter,assignMeter,deleteMeter,getAllMetersWithPaymentData,getMeterByMeterId}