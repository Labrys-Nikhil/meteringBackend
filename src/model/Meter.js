const mongoose = require("mongoose");
const DailyMeterSummary = require("./DailyMeterSummary");

const ActionHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    required:true
  },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const meterSchema = new mongoose.Schema(
  {
    meterId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true, // Friendly location or device label
    },
    type: {
      type: String,
      required: true, // e.g., Smart Water Meter
    },

    meterSerialNumber: {
      type: Number,
      required: true,
    },
    slaveId: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['online', 'offline', 'faulty'],
      default: 'offline',
    },

    lastSeen: { type: Date }, 

    adminId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },

    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isAssigned:{
      type:Boolean,
      default:false
    },

    userAssignedTimestamp:{
      type:Date,
      default:''
    },
    deviceId:{
      type:String,
      required:true
    },
    actionHistory: [ActionHistorySchema],
  },
  { timestamps: true }
);

meterSchema.index({ slaveId: 1, meterSerialNumber: 1 }, { unique: true });

module.exports = mongoose.model("Meter", meterSchema);


// Note: The `meterId` is a unique identifier for the meter, while `devEUI` is the LoRaWAN 
// now MeterId is refined as "M+(slaveID)+(hex of the meter serial number, which is unique to each meter)";
// eg:- MO1-1234567890abcdef
