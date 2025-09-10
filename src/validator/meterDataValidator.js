const { z } = require("zod");

const readingValueSchema = (unitDefault = "") => z.object(
  {
    value: z.number(),
    unit: z.string().default(unitDefault),
  });

const relayStatusSchema = z.object({
  status: z.string(),
  value: z.number(),
});

// Define Schema for tempor values
const temporValueSchema = z.object({
  value: z.string(),
  unit: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const meterReadingValidator = z.object({
  meterId: z.string().optional(),

  payload_version: readingValueSchema(),
  slave_id: readingValueSchema(),
  function_code: readingValueSchema(),
  meter_serial_number: readingValueSchema(),
  version: readingValueSchema(),

  cum_eb_kwh: readingValueSchema("kWh"),
  cum_dg_kwh: readingValueSchema("kWh"),
  cum_kvah_eb: readingValueSchema("kVAh"),
  cum_kvah_dg: readingValueSchema("kVAh"),
  cum_kvarh_eb: readingValueSchema("kvarh"),
  cum_kvarh_dg: readingValueSchema("kvarh"),

  relay_status: relayStatusSchema,

  eb_dg_status: readingValueSchema(),
  eb_load_setting: readingValueSchema("W"),
  dg_load_setting: readingValueSchema("W"),
  eb_tariff_setting: readingValueSchema("currency/unit"),
  dg_tariff_setting: readingValueSchema("currency/unit"),
  balance_amount: readingValueSchema("currency"),
  daily_charge_setting: readingValueSchema("currency/day"),

  voltage_r: readingValueSchema("V"),
  current_r: readingValueSchema("A"),
  current_y: readingValueSchema("A"),
  current_b: readingValueSchema("A"),
  power_factor: readingValueSchema("pf"),
  frequency: readingValueSchema("Hz"),
  tamper: z.record(temporValueSchema).optional(), // this one added 

  timestamp: z.coerce.date().optional(),
});

module.exports = { meterReadingValidator };





// const { z } = require("zod");

// const readingValueSchema = (unitDefault = "") => z.object(
//   {
//     value: z.number(),
//     unit: z.string().default(unitDefault),
//   });

// const relayStatusSchema = z.object({
//   status: z.string(),
//   value: z.number(),
// });

// // Define Schema for tempor values
// const temporValueSchema = z.object({
//   value: z.string(),
//   unit: z.union([z.string(), z.number(), z.boolean()]).optional(),
// });

// const meterReadingValidator = z.object({
//   meterId: z.string().optional(),

//   payload_version: readingValueSchema(),
//   slave_id: readingValueSchema(),
//   function_code: readingValueSchema(),
//   meter_serial_number: readingValueSchema(),
//   version: readingValueSchema(),

//   cum_eb_kwh: readingValueSchema("kWh"),
//   cum_dg_kwh: readingValueSchema("kWh"),
//   cum_kvah_eb: readingValueSchema("kVAh"),
//   cum_kvah_dg: readingValueSchema("kVAh"),
//   cum_kvarh_eb: readingValueSchema("kvarh"),
//   cum_kvarh_dg: readingValueSchema("kvarh"),

//   relay_status: relayStatusSchema,

//   eb_dg_status: readingValueSchema(),
//   eb_load_setting: readingValueSchema("W"),
//   dg_load_setting: readingValueSchema("W"),
//   eb_tariff_setting: readingValueSchema("currency/unit"),
//   dg_tariff_setting: readingValueSchema("currency/unit"),
//   balance_amount: readingValueSchema("currency"),
//   daily_charge_setting: readingValueSchema("currency/day"),

//   voltage_r: readingValueSchema("V"),
//   current_r: readingValueSchema("A"),
//   current_y: readingValueSchema("A"),
//   current_b: readingValueSchema("A"),
//   power_factor: readingValueSchema("pf"),
//   frequency: readingValueSchema("Hz"),

//   tempor: z.record(temporValueSchema).optional(), // this one added 

//   timestamp: z.coerce.date().optional(),
// });

// module.exports = { meterReadingValidator };
