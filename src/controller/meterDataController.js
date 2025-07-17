const Meter = require('../model/Meter');
const User = require('../model/User');

const MeterDecodedData = require('../model/MeterData');
const { meterReadingValidator } = require('../validator/meterDataValidator');
const meterDataService = require('../service/meterDataService');

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

const getAllMetersDataByUserID = async (req,res)=> {
    try{
        const {id} = req.params;
        const user = await User.findById(id);

        if(!user){
            return req.status(404).json({message:"user not found"});
        }

        const response = await meterDataService.getMeterDataByUserId(id,user);

    }catch(error){
        return res.status(500).json({messsage:"server error", error:`${error}`})
    }
}


module.exports = { saveMeterReading,getAllMetersDataByUserID };
