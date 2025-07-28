const Meter = require('../model/Meter');
const User = require('../model/User');
const MeterDecodedData = require('../model/MeterData');
const { meterReadingValidator } = require('../validator/meterDataValidator');
const meterDataService = require('../service/meterDataService');
const axios = require('axios'); 
const generateTokenFromIOT = require('../utils/jwtGeneratorIOT');

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
const getMeterDatafromSmartlynk = async (req,res) => {
  try {
    const superAdmin = await User.findById(process.env.SUPER_ADMIN_ID);
    console.log("superAdmin",superAdmin);
    console.log("email",superAdmin.email);

    if (!superAdmin || !superAdmin.email) {
      console.error("Super admin not found or missing email.");
      return null;
    }

    const jwtToken = generateTokenFromIOT(superAdmin.email);
    console.log(jwtToken);

    const response = await axios.get(
      `${process.env.SMARTLYNK_BASE_URL}/get-meterData`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    
    if(response.status === 200){
        return res.status(200).json({message:"success",data:response.data.data});
    }
    return res.status(500).json({message:"server error"});
  } catch (error) {
    console.error("Failed to fetch SmartLynk meter data:", error.message);
    throw error;
  }
};

//iot apis
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

const sendDownlink = async(req,res)=>{
  try {
    const data = res.body;
    const response = await axios.get(
      `${process.env.SMARTLYNK_BASE_URL}/custom-meter-commands`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    
  } catch (error) {
    console.error("Failed to send downlink to SmartLynk:", error.message);
    throw error;
  }
}


module.exports = { saveMeterReading,getAllMetersDataByUserID,getMeterDatafromSmartlynk,sendDownlink };
