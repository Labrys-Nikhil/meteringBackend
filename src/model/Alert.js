

// const mongoose = require("mongoose");

// const alertSchema = new mongoose.Schema(
//   {
//     adminId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//         // Add userId field for user-created alerts
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     alertName: {
//       type: String,
//       default: "",
//     },

//     alertType: {
//       type: String,
//       required: true,
//       enum: [
//         "Low Balance",
//         "Balance Expired",
//         "Recharge Successful",
//         "Recharge Failed",
//         "Reminder to Recharge",
//         "Magnetic Interference",
//         "Neutral Voltage Issue",
//         "Reverse Polarity",
//         "High Load Usage",
//         "Current Imbalance",
//         "Over Voltage Warning",
//       ],
//     },

//     condition: {
//       type: String,
//       enum: ["greaterThan", "lessThan", "equals", "notEquals", ">=", "<=",">", "<", ">=", "<=", "==", "!="],
//       default: "",
//     },

//     value: {
//       type: mongoose.Schema.Types.Mixed,
//       default: null,
//     },

//     notificationModes: {
//       email: { type: Boolean, default: false },
//       sms: { type: Boolean, default: false },
//     },

//     recipients: {
//       user: { type: Boolean, default: true },
//       admin: { type: Boolean, default: true },
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     meterIds: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Meter",
//       },
//     ],

//     isSystemAlert: {
//       type: Boolean,
//       default: false,
//     },

//     editable: {
//       type: Boolean,
//       default: true,
//     },
//         // Add field to track who created the alert
//     createdBy: {
//       type: String,
//       enum: ["admin", "user"],
//       required: true,
//       default: "admin",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Alert", alertSchema);

















const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    alertName: {
      type: String,
      default: "",
    },

    alertType: {
      type: String,
      required: true,
      enum: [
        "Low Balance",
        "Balance Expired",
        "Recharge Successful",
        "Recharge Failed",
        "Reminder to Recharge",
        "Magnetic Interference",
        "Neutral Voltage Issue",
        "Reverse Polarity",
        "High Load Usage",
        "Current Imbalance",
        "Over Voltage Warning",
      ],
    },

    condition: {
      type: String,
      enum: [
        "greaterThan",
        "lessThan",
        "equals",
        "notEquals",
        ">=",
        "<=",
        ">",
        "<",
        ">=",
        "<=",
        "==",
        "!=",
      ],
      default: "",
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notificationSettings: {
      user: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
      },
      admin: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
      },
    },

    notificationModes: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },

    recipients: {
      user: { type: Boolean, default: true },
      admin: { type: Boolean, default: true },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    meterIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meter",
      },
    ],

    isSystemAlert: {
      type: Boolean,
      default: false,
    },

    editable: {
      type: Boolean,
      default: true,
    },
    // Add field to track who created the alert
    createdBy: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);


