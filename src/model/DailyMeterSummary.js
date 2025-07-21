const  mongoose  = require("mongoose");

const DailyMeterSummarySchema = new mongoose.Schema({
  meterId: { type: mongoose.Schema.Types.ObjectId , ref: "Meter", required: true },
  date: { type: Date, required: true },
  totalKWh: { type: String, required: true },
  totalDeduction: { type: String, required: true },
  totalEG:{type: String, required: true},
  totalDG:{type:String,required:true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DailyMeterData",DailyMeterSummarySchema);