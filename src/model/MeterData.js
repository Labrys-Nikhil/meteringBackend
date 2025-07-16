const mongoose = require("mongoose");

const meterReadingSchema = new mongoose.Schema(
  {
    meterId: { type: mongoose.Schema.Types.ObjectId, ref: "Meter", required: false },

    payload_version: {
      value: { type: Number, required: true },
      unit: { type: String, default: "" },
    },
    slave_id: {
      value: { type: Number, required: true },
      unit: { type: String, default: "" },
    },
    function_code: {
      value: { type: Number, required: true },
      unit: { type: String, default: "" },
    },
    meter_serial_number: {
      value: { type: Number, required: true },
      unit: { type: String, default: "" },
    },
    version: {
      value: { type: Number, required: true },
      unit: { type: String, default: "" },
    },

    cum_eb_kwh: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kWh" },
    },
    cum_dg_kwh: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kWh" },
    },
    cum_kvah_eb: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kVAh" },
    },
    cum_kvah_dg: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kVAh" },
    },
    cum_kvarh_eb: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kvarh" },
    },
    cum_kvarh_dg: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kvarh" },
    },

    relay_status: {
      status: { type: String, required: true },
      value: { type: Number, required: true },
    },

    eb_dg_status: {
      value: { type: Number, required: true },
      unit: { type: String, default: "" },
    },
    eb_load_setting: {
      value: { type: Number, required: true },
      unit: { type: String, default: "W" },
    },
    dg_load_setting: {
      value: { type: Number, required: true },
      unit: { type: String, default: "W" },
    },
    eb_tariff_setting: {
      value: { type: Number, required: true },
      unit: { type: String, default: "currency/unit" },
    },
    dg_tariff_setting: {
      value: { type: Number, required: true },
      unit: { type: String, default: "currency/unit" },
    },
    balance_amount: {
      value: { type: Number, required: true },
      unit: { type: String, default: "currency" },
    },
    daily_charge_setting: {
      value: { type: Number, required: true },
      unit: { type: String, default: "currency/day" },
    },

    voltage_r: {
      value: { type: Number, required: true },
      unit: { type: String, default: "V" },
    },
    current_r: {
      value: { type: Number, required: true },
      unit: { type: String, default: "A" },
    },
    current_y: {
      value: { type: Number, required: true },
      unit: { type: String, default: "A" },
    },
    current_b: {
      value: { type: Number, required: true },
      unit: { type: String, default: "A" },
    },
    power_factor: {
      value: { type: Number, required: true },
      unit: { type: String, default: "pf" },
    },
    frequency: {
      value: { type: Number, required: true },
      unit: { type: String, default: "Hz" },
    },

    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MeterDecodedData", meterReadingSchema);
