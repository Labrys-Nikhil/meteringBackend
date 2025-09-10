


// const Meter = require("../model/Meter");
// const User = require("../model/User");
// const NotificationModel = require("../model/Notification");
// const Alert = require("../model/Alert");
// const sendEmail = require("../utils/sendEmail");
// const { sendSMS } = require("../utils/sendOTPsms");
// const {
//   renderEmailTemplate,
//   alertColors,
//   renderSMSTemplate,
// } = require("../utils/emailTextTemplates");
// const { formatPhoneNumber } = require("../utils/phoneFormater");

// const ALERT_CONFIG = {
//   "Low Balance": {
//     message:
//       "Alert: Meter {METER_ID} for User {USER_ID} has low balance of ₹{VALUE}. Please recharge soon.",
//     recipients: { user: true, admin: true },
//   },
//   "Balance Expired": {
//     message:
//       "Balance expired for Meter {METER_ID}. Emergency 2 units activated for User {USER_ID}.",
//     recipients: { user: true, admin: true },
//   },
//   "Recharge Successful": {
//     message: "Recharge successful on Meter {METER_ID}. New balance: ₹{VALUE}.",
//     recipients: { user: true, admin: true },
//   },
//   "Recharge Failed": {
//     message:
//       "Recharge failed on Meter {METER_ID} for User {USER_ID}. Please retry.",
//     recipients: { user: true, admin: true },
//   },
//   "Reminder to Recharge": {
//     message:
//       "Reminder: It's been a while since last recharge for Meter {METER_ID}. Balance: ₹{VALUE}.",
//     recipients: { user: true, admin: true },
//   },
//   "Magnetic Interference": {
//     message:
//       "Possible magnetic interference detected on Meter {METER_ID} for User {USER_ID}. Please inspect.",
//     recipients: { user: true, admin: true },
//   },
//   "Neutral Voltage Issue": {
//     message:
//       "Voltage fluctuation detected on Meter {METER_ID}. May damage appliances.",
//     recipients: { user: true, admin: true },
//   },
//   "Reverse Polarity": {
//     message:
//       "Reverse current detected on Meter {METER_ID} (User {USER_ID}). Immediate action taken.",
//     recipients: { user: true, admin: true },
//   },
//   "High Load Usage": {
//     message:
//       "High load usage ({VALUE}kW) detected on Meter {METER_ID} for User {USER_ID}.",
//     recipients: { user: true, admin: false }, // Admin won't receive these notifications
//   },
//   "Current Imbalance": {
//     message:
//       "Phase current imbalance detected on Meter {METER_ID}. Please check wiring.",
//     recipients: { user: true, admin: true },
//   },
//   "Over Voltage Warning": {
//     message:
//       "Voltage {VALUE}V exceeds safe limit on Meter {METER_ID} for User {USER_ID}.",
//     recipients: { user: true, admin: true },
//   },
//   "Over Current": {
//     message:
//       "Current {VALUE}A exceeds safe limit on Meter {METER_ID} for User {USER_ID}.",
//     recipients: { user: true, admin: true },
//   },
// };

// const sendNotification = async ({ meterId, data }) => {
//   try {
//     // 1. Get meter with assigned user and admin info
//     const meter = await Meter.findById(meterId)
//       .populate({
//         path: "assignedUserId",
//         select:
//           "-password -refreshToken -otp -otpExpiresAt -actionHistory -__v",
//         populate: {
//           path: "adminId",
//           select:
//             "-password -refreshToken -otp -otpExpiresAt -actionHistory -__v",
//         },
//       })
//       .select("-__v");

//     if (!meter) {
//       console.error(`Meter not found for meterId: ${meterId}`);
//       return;
//     }

//     const user = meter.assignedUserId;
//     const admin = user?.adminId;

//     if (!user) {
//       console.error("User not found for this meter");
//       return;
//     }

 


//     // Get notification settings for both user and admin (latest documents)
// const userNotificationSettings = await NotificationModel.findOne({
//   userId: user._id,
//   meterId: meter._id,
//   adminId: admin._id, // Specifically get user settings (not admin settings)
// })
// .sort({ updatedAt: -1 }) // Get the most recently updated document
// .select('status') // Only select the status field
// .exec();

// const adminNotificationSettings = admin
//   ? await NotificationModel.findOne({
//       userId: admin._id, // Admin's user ID
//       adminId: admin._id, // Specifically get admin settings
//       meterId: meter._id,
//     })
//     .sort({ updatedAt: -1 }) // Get the most recently updated document
//     .select('status') // Only select the status field
//     .exec()
//   : null;

// // console.log("=======userNotificationSettings=====adminNotificationSettings==", 
// //   userNotificationSettings ? userNotificationSettings.status : "enabled (default)",
// //   adminNotificationSettings ? adminNotificationSettings.status : "enabled (default)"
// // );

//     const time = new Date();

// // return 

//     // 2. Get all active alerts for this meter or system-wide alerts
//     const alerts = await Alert.find({
//       $or: [
//         { meterIds: meterId, isActive: true },
//         { isSystemAlert: true, isActive: true },
//       ],
//       adminId: admin._id,
//     });

//     // 3. Update system alerts with meterIds if needed
//     await updateSystemAlertsWithMeters(admin._id);

//     console.log(
//       "Alerts to process:",
//       alerts.map((a) => ({
//         alertType: a.alertType,
//         condition: a.condition,
//         value: a.value,
//         isSystemAlert: a.isSystemAlert,
//         editable: a.editable,
//       }))
//     );

//     // 4. Process each alert condition
//     for (const alert of alerts) {
//       // Skip non-editable system alerts (they'll be handled in tamper alerts)
//       if (alert.isSystemAlert && !alert.editable) continue;

//       const meetsCondition = checkCondition(alert, data);
//       if (meetsCondition) {
//         await processAlert({
//           alert,
//           meter,
//           user,
//           admin,
//           data,
//           time,
//           userNotificationSettings,
//           adminNotificationSettings,
//         });
//       }
//     }

//     // 5. Process tamper alerts (for non-editable system alerts)
//     let alertsToProcess = [...(data.tamper || [])];

//     // Check for Low Balance using alert configuration instead of hardcoded value
//     const lowBalanceAlert = alerts.find(
//       (a) => a.alertType === "Low Balance" && a.isActive
//     );

//     if (lowBalanceAlert && checkCondition(lowBalanceAlert, data)) {
//       alertsToProcess.push({
//         value: "Low Balance",
//         unit: data.balance_amount?.value,
//       });
//     }

//     for (const alertObj of alertsToProcess) {
//       const alertType = alertObj.value;
//       const config = ALERT_CONFIG[alertType];

//       if (!config) {
//         console.warn(`Alert config not found for type: ${alertType}`);
//         continue;
//       }

//       await processAlert({
//         alertType,
//         value: alertObj.unit,
//         meter,
//         user,
//         admin,
//         time,
//         userNotificationSettings,
//         adminNotificationSettings,
//         notificationCategory: "automated",
//         customMessage: config.message
//           .replace(/{METER_ID}/g, meter._id || "N/A")
//           .replace(/{USER_ID}/g, user._id.toString())
//           .replace(/{VALUE}/g, alertObj.unit != null ? alertObj.unit : ""),
//       });
//     }
//   } catch (err) {
//     console.error("Failed to send notifications:", err.message);
//     throw err;
//   }
// };

// // // Helper function to update system alerts with meter IDs
// async function updateSystemAlertsWithMeters(adminId) {
//   try {
//     // Get all meters for this admin
//     // Get all meters for this admin where status is online and isAssigned = true
//     const meters = await Meter.find({
//       adminId,
//       isAssigned: true,
//       status: "online",
//     }).select("_id");
//     // const meters = await Meter.find({ adminId,status:'online' }).select("_id");
//     const meterIds = meters.map((m) => m._id);

//     console.log("======meterIds=====", meterIds);

//     // Case 1: For system alerts that are NOT editable → always have ALL meters
//     // await Alert.updateMany(
//     //   { adminId, isSystemAlert: true, editable: false },
//     //   { $set: { meterIds } } // overwrite with full meter list
//     // );
//     // Case 1: For system alerts that are NOT editable → always have ALL meters
//     await Alert.updateMany(
//       { adminId, isSystemAlert: true, editable: false },
//       { $set: { meterIds } } // overwrite with full meter list
//     );

   

//     // // (Optional) Case 3: Non-system alerts → skip, or handle separately if needed
//   } catch (err) {
//     console.error("Error updating system alerts with meters:", err);
//   }
// }

// function checkCondition(alert, data) {
//   if (!data) return false;
//   const { condition, value: threshold, alertType, editable } = alert;

//   // For non-editable alerts, we process them through tamper alerts
//   if (!editable) return false;

//   // Skip if no condition or threshold set for editable alerts
//   if (!condition || threshold === null || threshold === undefined) {
//     console.log(
//       `Skipping alert ${alertType} - no condition/threshold configured`
//     );
//     return false;
//   }

//   const actualValue = getValueForAlert(alertType, data);
//   if (actualValue === undefined) {
//     console.log(`Could not get value for alert type: ${alertType}`);
//     return false;
//   }

//   // For safety, set default thresholds if none are configured
//   let safeThreshold = threshold;
//   if (safeThreshold === null || safeThreshold === undefined) {
//     const defaultThresholds = {
//       "Low Balance": 100,
//       "Over Voltage Warning": 260,
//       "Over Current": 25,
//       // Add other default thresholds as needed
//     };
//     safeThreshold = defaultThresholds[alertType] || 0;
//     console.log(`Using default threshold for ${alertType}: ${safeThreshold}`);
//   }

//   switch (condition) {
//     case "greaterThan":
//     case ">":
//       return actualValue > safeThreshold;
//     case "lessThan":
//     case "<":
//       return actualValue < safeThreshold;
//     case "equals":
//     case "==":
//       return actualValue === safeThreshold;
//     case "notEquals":
//     case "!=":
//       return actualValue !== safeThreshold;
//     case ">=":
//       return actualValue >= safeThreshold;
//     case "<=":
//       return actualValue <= safeThreshold;
//     default:
//       console.log(`Unknown condition: ${condition}`);
//       return false;
//   }
// }

// // Helper to get the correct value from data based on alert name
// function getValueForAlert(alertType, data) {
//   if (!data) return undefined;

//   const valueMap = {
//     "Low Balance": data.balance_amount?.value,
//     "High Load Usage": data.eb_load_setting?.value,
//     "Reminder to Recharge": data.balance_amount?.value,
//     "Over Voltage Warning": data.voltage_r?.value,
//     "Over Current": Math.max(
//       data.current_r?.value || 0,
//       data.current_y?.value || 0,
//       data.current_b?.value || 0
//     ),
//     "Current Imbalance":
//       Math.max(
//         data.current_r?.value || 0,
//         data.current_y?.value || 0,
//         data.current_b?.value || 0
//       ) -
//       Math.min(
//         data.current_r?.value || 0,
//         data.current_y?.value || 0,
//         data.current_b?.value || 0
//       ),
//     "Neutral Voltage Issue":
//       data.voltage_r?.value !== data.voltage_y?.value ||
//       data.voltage_y?.value !== data.voltage_b?.value,
//     "Reverse Polarity": data.eb_dg_status?.value === 0,
//     "Magnetic Interference": data.tamper?.some(
//       (t) => t.value === "Magnetic Interference"
//     ),
//   };

//   return valueMap[alertType];
// }

// function formatValue(alertType, value) {
//   if (value === undefined || value === null || value === "") return "";

//   switch (alertType) {
//     case "Low Balance":
//     case "Recharge Successful":
//     case "Reminder to Recharge":
//     case "Balance Expired":
//     case "Recharge Failed":
//       return `₹${value.toFixed(2)}`;
//     case "High Load Usage":
//       return `${value} kW`;
//     case "Over Voltage Warning":
//       return `${value} V`;
//     case "Over Current":
//       return `${value} A`;
//     case "Magnetic Interference":
//       return value ? "Detected" : "Not Detected";
//     case "Neutral Voltage Issue":
//       return value ? "Issue Detected" : "Normal";
//     case "Reverse Polarity":
//       return value ? "Detected" : "Normal";
//     case "Current Imbalance":
//       return `${value} A difference`;
//     default:
//       return value.toString();
//   }
// }



// async function processAlert({
//   alert,
//   meter,
//   user,
//   admin,
//   data,
//   time,
//   userNotificationSettings,
//   adminNotificationSettings,
//   alertType,
//   value,
//   notificationCategory = "custom",
//   customMessage
// }) {
//   const config = ALERT_CONFIG[alertType || alert?.alertType] || {};
//   const finalMessage = (customMessage || config.message || alertType || alert?.alertType)
//     .replace(/{METER_ID}/g, meter.meterSerialNumber || "N/A")
//     .replace(/{USER_ID}/g, user.name || `User ${user._id.toString()}`)
//     .replace(/{VALUE}/g, value !== undefined && value !== null ? 
//       formatValue(alertType || alert?.alertType, value) : "");

//   const alertValue = value || getValueForAlert(alert?.alertType || alertType, data);
  
//   console.log("Processing alert:", {
//     alertType: alert?.alertType || alertType,
//     recipients: alert?.recipients || config.recipients,
//     notificationModes: alert?.notificationModes,
//     value: alertValue,
//     formattedMessage: finalMessage
//   });

//   const emailHtml = renderEmailTemplate({
//     alertTitle: alertType || alert?.alertType,
//     color: alertColors[alertType || alert?.alertType] || alertColors.Default,
//     meterSerialNumber: meter.meterSerialNumber,
//     userName: user.name || `User ${user._id.toString()}`,
//     alertMessage: finalMessage,
//     value: alertValue,
//     time: time.toLocaleString(),
//   });

//   // Corrected SMS template generation
//   const smsText = `[${alertType || alert?.alertType} Alert] 

//   ${finalMessage} 
//   Meter: ${meter.meterSerialNumber || "N/A"} 
//   Value: ${formatValue(alertType || alert?.alertType, alertValue)} Time: ${time.toLocaleString()} 
//   -
//   Smartlynk Team`;

//   const recipients = [];
  
//   if (alert) {
//     const { recipients: alertRecipients, notificationModes } = alert;
    
//     // Check user notifications
//     if (alertRecipients?.user) {
//       const userNotificationsEnabled = !userNotificationSettings || userNotificationSettings.status === "enabled";
      
//       if (userNotificationsEnabled) {
//         if (notificationModes?.email && user.email) {
//           recipients.push({
//             type: "User",
//             mode: "Email",
//             email: user.email,
//             userId: user._id
//           });
//         }
//         if (notificationModes?.sms && user.phonenumber) {
//           recipients.push({
//             type: "User",
//             mode: "Text",
//             phone: formatPhoneNumber(user.phonenumber),
//             userId: user._id
//           });
//         }
//       } else {
//         console.log("Skipping user notifications - disabled for this user");
//       }
//     }
    
//     // Check admin notifications
//     if (alertRecipients?.admin && admin) {
//       const adminNotificationsEnabled = !adminNotificationSettings || adminNotificationSettings.status === "enabled";
      
//       if (adminNotificationsEnabled) {
//         if (notificationModes?.email && admin.email) {
//           recipients.push({
//             type: "Admin",
//             mode: "Email",
//             email: admin.email,
//             userId: admin._id
//           });
//         }
//         if (notificationModes?.sms && admin.phonenumber) {
//           recipients.push({
//             type: "Admin",
//             mode: "Text",
//             phone: formatPhoneNumber(admin.phonenumber),
//             userId: admin._id
//           });
//         }
//       } else {
//         console.log("Skipping admin notifications - disabled for this admin");
//       }
//     }
//   } else {
//     const notifyUser = config.recipients?.user !== false;
//     const notifyAdmin = config.recipients?.admin !== false;
    
//     // Check user notifications
//     if (notifyUser) {
//       const userNotificationsEnabled = !userNotificationSettings || userNotificationSettings.status === "enabled";
      
//       if (userNotificationsEnabled) {
//         if (user.email) {
//           recipients.push({
//             type: "User",
//             mode: "Email",
//             email: user.email,
//             userId: user._id
//           });
//         }
//         if (user.phonenumber) {
//           recipients.push({
//             type: "User",
//             mode: "Text",
//             phone: formatPhoneNumber(user.phonenumber),
//             userId: user._id
//           });
//         }
//       } else {
//         console.log("Skipping user notifications - disabled for this user");
//       }
//     }
    
//     // Check admin notifications
//     if (notifyAdmin && admin) {
//       const adminNotificationsEnabled = !adminNotificationSettings || adminNotificationSettings.status === "enabled";
      
//       if (adminNotificationsEnabled) {
//         if (admin.email) {
//           recipients.push({
//             type: "Admin",
//             mode: "Email",
//             email: admin.email,
//             userId: admin._id
//           });
//         }
//         if (admin.phonenumber) {
//           recipients.push({
//             type: "Admin",
//             mode: "Text",
//             phone: formatPhoneNumber(admin.phonenumber),
//             userId: admin._id
//           });
//         }
//       } else {
//         console.log("Skipping admin notifications - disabled for this admin");
//       }
//     }
//   }

//   console.log("Final recipients:", recipients);

//   for (const recipient of recipients) {
//     try {
//       const notificationPayload = {
//         alertType: alertType || alert?.alertType,
//         message: finalMessage,
//         value: alertValue?.toString(),
//         mode: recipient.mode,
//         time,
//         notificationCategory,
//       };

//       await NotificationModel.updateOne(
//         {
//           userId: recipient.userId,
//           meterId: meter._id,
//           adminId: admin?._id || null,
//         },
//         {
//           $push: {
//             userNotification: {
//               $each: [notificationPayload],
//               $position: 0,
//               $slice: 50,
//             },
//           },
//           $set: { lastNotificationDate: time },
//         },
//         { upsert: true }
//       );

//       if (recipient.mode === "Email" && recipient.email) {
//         await sendEmail(
//           recipient.email,
//           `Alert: ${alertType || alert?.alertType}`,
//           emailHtml,
//           true
//         );
//         console.log(`Email sent to ${recipient.type}: ${recipient.email}`);
//       } else if (recipient.mode === "Text" && recipient.phone) {
//         await sendSMS(recipient.phone, smsText);
//         console.log(`SMS sent to ${recipient.type}: ${recipient.phone}`);
//       }
//     } catch (err) {
//       console.error(`Failed to send ${recipient.mode} to ${recipient.type}:`, err);
//     }
//   }
// }

// module.exports = { sendNotification };




















const Meter = require("../model/Meter");
const User = require("../model/User");
const NotificationModel = require("../model/Notification");
const Alert = require("../model/Alert");
const sendEmail = require("../utils/sendEmail");
const { sendSMS } = require("../utils/sendOTPsms");
const {
  renderEmailTemplate,
  alertColors,
  renderSMSTemplate,
} = require("../utils/emailTextTemplates");
const { formatPhoneNumber } = require("../utils/phoneFormater");

// const ALERT_CONFIG = {
//   "Low Balance": {
//     message: "Alert: Meter {METER_ID} for User {USER_ID} has low balance of ₹{VALUE}. Please recharge soon.",
//     recipients: { user: true, admin: true }
//   },
//   "Balance Expired": {
//     message: "Balance expired for Meter {METER_ID}. Emergency 2 units activated for User {USER_ID}.",
//     recipients: { user: true, admin: true }
//   },
//   "Recharge Successful": {
//     message: "Recharge successful on Meter {METER_ID}. New balance: ₹{VALUE}.",
//     recipients: { user: true, admin: true }
//   },
//   "Recharge Failed": {
//     message: "Recharge failed on Meter {METER_ID} for User {USER_ID}. Please retry.",
//     recipients: { user: true, admin: true }
//   },
//   "Reminder to Recharge": {
//     message: "Reminder: It's been a while since last recharge for Meter {METER_ID}. Balance: ₹{VALUE}.",
//     recipients: { user: true, admin: true }
//   },
//   "Magnetic Interference": {
//     message: "Possible magnetic interference detected on Meter {METER_ID} for User {USER_ID}. Please inspect.",
//     recipients: { user: true, admin: true }
//   },
//   "Neutral Voltage Issue": {
//     message: "Voltage fluctuation detected on Meter {METER_ID}. May damage appliances.",
//     recipients: { user: true, admin: true }
//   },
//   "Reverse Polarity": {
//     message: "Reverse current detected on Meter {METER_ID} (User {USER_ID}). Immediate action taken.",
//     recipients: { user: true, admin: true }
//   },
//   "High Load Usage": {
//     message: "High load usage ({VALUE}kW) detected on Meter {METER_ID} for User {USER_ID}.",
//     recipients: { user: true, admin: false }
//   },
//   "Current Imbalance": {
//     message: "Phase current imbalance detected on Meter {METER_ID}. Please check wiring.",
//     recipients: { user: true, admin: true }
//   },
//   "Over Voltage Warning": {
//     message: "Voltage {VALUE}V exceeds safe limit on Meter {METER_ID} for User {USER_ID}.",
//     recipients: { user: true, admin: true }
//   },
//   "Over Current": {
//     message: "Current {VALUE}A exceeds safe limit on Meter {METER_ID} for User {USER_ID}.",
//     recipients: { user: true, admin: true }
//   },
// };


const ALERT_CONFIG = {
  "Low Balance": {
    message: "Alert: Meter {METER_ID} for User {USER_ID} has low balance of {VALUE}. Please recharge soon.",
    recipients: { user: true, admin: true }
  },
  "Balance Expired": {
    message: "Balance expired for Meter {METER_ID}. Emergency 2 units activated for User {USER_ID}. Balance: {VALUE}",
    recipients: { user: true, admin: true }
  },
  "Recharge Successful": {
    message: "Recharge successful on Meter {METER_ID}. New balance: {VALUE}.",
    recipients: { user: true, admin: true }
  },
  "Recharge Failed": {
    message: "Recharge failed on Meter {METER_ID} for User {USER_ID}. Attempted amount: {VALUE}",
    recipients: { user: true, admin: true }
  },
  "Reminder to Recharge": {
    message: "Reminder: It's been a while since last recharge for Meter {METER_ID}. Balance: {VALUE}",
    recipients: { user: true, admin: true }
  },
  "Magnetic Interference": {
    message: "Possible magnetic interference detected on Meter {METER_ID} for User {USER_ID}. Please inspect.",
    recipients: { user: true, admin: true }
  },
  "Neutral Voltage Issue": {
    message: "Voltage fluctuation detected on Meter {METER_ID}. May damage appliances. Status: {VALUE}",
    recipients: { user: true, admin: true }
  },
  "Reverse Polarity": {
    message: "Reverse current detected on Meter {METER_ID} (User {USER_ID}). Status: {VALUE}",
    recipients: { user: true, admin: true }
  },
  "High Load Usage": {
    message: "High load usage ({VALUE}) detected on Meter {METER_ID} for User {USER_ID}.",
    recipients: { user: true, admin: false }
  },
  "Current Imbalance": {
    message: "Phase current imbalance detected on Meter {METER_ID}. Difference: {VALUE}",
    recipients: { user: true, admin: true }
  },
  "Over Voltage Warning": {
    message: "Voltage {VALUE} exceeds safe limit on Meter {METER_ID} for User {USER_ID}.",
    recipients: { user: true, admin: true }
  },
  "Over Current": {
    message: "Current {VALUE} exceeds safe limit on Meter {METER_ID} for User {USER_ID}.",
    recipients: { user: true, admin: true }
  },
};
const sendNotification = async ({ meterId, data }) => {
  try {
    // 1. Get meter with assigned user and admin info
    const meter = await Meter.findById(meterId)
      .populate({
        path: "assignedUserId",
        select: "-password -refreshToken -otp -otpExpiresAt -actionHistory -__v",
        populate: {
          path: "adminId",
          select: "-password -refreshToken -otp -otpExpiresAt -actionHistory -__v",
        },
      })
      .select("-__v");

    if (!meter) {
      console.error(`Meter not found for meterId: ${meterId}`);
      return;
    }

    const user = meter.assignedUserId;
    const admin = user?.adminId;

    if (!user) {
      console.error("User not found for this meter");
      return;
    }

    const time = new Date();

    // 2. Get all active alerts for this meter or system-wide alerts
    // const alerts = await Alert.find({
    //   $or: [
    //     { meterIds: meterId, isActive: true },
    //     { isSystemAlert: true, isActive: true }
    //   ],
    //   adminId: admin._id
    // });
        const alerts = await Alert.find({
      $or: [
        { meterIds: meterId, isActive: true },
        {  isActive: true }
      ],
      adminId: admin._id
    });

    // 3. Update system alerts with meterIds if needed
    await updateSystemAlertsWithMeters(admin._id);

    console.log("Alerts to process:", alerts.map(a => ({
      alertType: a.alertType,
      isActive: a.isActive,
      condition: a.condition,
      value: a.value,
      isSystemAlert: a.isSystemAlert,
      editable: a.editable
    })));

    // 4. Process each alert condition
    for (const alert of alerts) {
      // Skip if alert is not active
      if (!alert.isActive) {
        console.log(`Skipping ${alert.alertType} - alert is inactive`);
        continue;
      }

      // Skip non-editable system alerts (they'll be handled in tamper alerts)
      if (alert.isSystemAlert && !alert.editable) continue;

      const meetsCondition = checkCondition(alert, data);
      
      if (meetsCondition) {
        await processAlert({
          alert,
          meter,
          user,
          admin,
          data,
          time
        });
      }
    }

    // 5. Process tamper alerts (for non-editable system alerts)
    let alertsToProcess = [...(data.tamper || [])];
    // if (data.balance_amount?.value < 50) {
    //   alertsToProcess.push({
    //     value: "Low Balance",
    //     unit: data.balance_amount.value,
    //   });
    // }



    // After (uses actual alert configuration):
const lowBalanceAlert = alerts.find(a => 
  a.alertType === "Low Balance" && a.isActive
);

if (lowBalanceAlert && checkCondition(lowBalanceAlert, data)) {
  alertsToProcess.push({
    value: "Low Balance",
    unit: data.balance_amount?.value,
  });
}

    for (const alertObj of alertsToProcess) {
      const alertType = alertObj.value;
      const config = ALERT_CONFIG[alertType];

      if (!config) {
        console.warn(`Alert config not found for type: ${alertType}`);
        continue;
      }

      // Find the corresponding alert from the database to get its notificationSettings
      const dbAlert = await Alert.findOne({
        adminId: admin._id,
        alertType,
        isActive: true // Only process if alert is active
      });

      // Skip if alert is not active or not found
      if (!dbAlert || !dbAlert.isActive) {
        console.log(`Skipping ${alertType} alert - not active or not found`);
        continue;
      }

      await processAlert({
        alert: dbAlert, // Pass the actual alert document from DB
        alertType,
        value: alertObj.unit,
        meter,
        user,
        admin,
        time,
        notificationCategory: "automated",
        customMessage: config.message
          .replace(/{METER_ID}/g, meter._id || "N/A")
          .replace(/{USER_ID}/g, user._id.toString())
          .replace(/{VALUE}/g, alertObj.unit != null ? alertObj.unit : ""),
      });
    }
  } catch (err) {
    console.error("Failed to send notifications:", err.message);
    throw err;
  }
};

async function updateSystemAlertsWithMeters(adminId) {
  try {

    const meters = await Meter.find({
  adminId,
  isAssigned: true,
  status: "online",
}).select("_id");
    // const meters = await Meter.find({ adminId,status:'online' }).select("_id");
    const meterIds = meters.map((m) => m._id);

    console.log("======meterIds=====", meterIds);


    // // Get all meters for this admin
    // const meters = await Meter.find({ adminId }).select("_id");
    // const meterIds = meters.map((m) => m._id);

    // console.log("======meterIds=====", meterIds);
    await Alert.updateMany(
      { adminId, isSystemAlert: true, editable: false},
      { $set: { meterIds } } // overwrite with full meter list
    );
    // // Case 1: For system alerts that are NOT editable → always have ALL meters
    // await Alert.updateMany(
    //   // { adminId, isSystemAlert: true, editable: false },
    //      { adminId},
    //   { $set: { meterIds } } // overwrite with full meter list
    // );
  } catch (err) {
    console.error("Error updating system alerts with meters:", err);
  }
}

function checkCondition(alert, data) {
  if (!data) return false;
  
  const { condition, value: threshold, alertType, editable } = alert;
  
  // For non-editable alerts, we process them through tamper alerts
  if (!editable) return false;

  // Skip if no condition or threshold set for editable alerts
  if (!condition || threshold === null || threshold === undefined) {
    console.log(`Skipping alert ${alertType} - no condition/threshold configured`);
    return false;
  }

  const actualValue = getValueForAlert(alertType, data);
  
  if (actualValue === undefined) {
    console.log(`Could not get value for alert type: ${alertType}`);
    return false;
  }

  //   let safeThreshold = threshold;
//   if (safeThreshold === null || safeThreshold === undefined) {
//     const defaultThresholds = {
//       "Low Balance": 100,
//       "Over Voltage Warning": 260,
//       "Over Current": 25,
//       // Add other default thresholds as needed
//     };
//     safeThreshold = defaultThresholds[alertType] || 0;
//     console.log(`Using default threshold for ${alertType}: ${safeThreshold}`);
//   }

  switch (condition) {
    case "greaterThan":
    case ">":
      return actualValue > threshold;

    case "lessThan":
    case "<":
      return actualValue < threshold;

    case "equals":
    case "==":
      return actualValue === threshold;

    case "notEquals":
    case "!=":
      return actualValue !== threshold;

    case ">=":
      return actualValue >= threshold;

    case "<=":
      return actualValue <= threshold;

    default:
      console.log(`Unknown condition: ${condition}`);
      return false;
  }
}

// function getValueForAlert(alertType, data) {
//   if (!data) return undefined;
  
//   const valueMap = {
//     "Low Balance": data.balance_amount?.value,
//     "High Load Usage": data.eb_load_setting?.value,
//     "Reminder to Recharge": data.balance_amount?.value,
//     "Over Voltage Warning": data.voltage_r?.value,
//     "Over Current": Math.max(
//       data.current_r?.value || 0,
//       data.current_y?.value || 0,
//       data.current_b?.value || 0
//     ),
//     "Current Imbalance": 
//       Math.max(
//         data.current_r?.value || 0,
//         data.current_y?.value || 0,
//         data.current_b?.value || 0
//       ) - Math.min(
//         data.current_r?.value || 0,
//         data.current_y?.value || 0,
//         data.current_b?.value || 0
//       ),
//     "Neutral Voltage Issue": data.voltage_r?.value !== data.voltage_y?.value || 
//                             data.voltage_y?.value !== data.voltage_b?.value,
//     "Reverse Polarity": data.eb_dg_status?.value === 0,
//     "Magnetic Interference": data.tamper?.some(t => t.value === "Magnetic Interference"),
//   };

//   return valueMap[alertType];
// }



function getValueForAlert(alertType, data) {
  if (!data) return undefined;
  
  const valueMap = {
    "Low Balance": data.balance_amount?.value,
    "Balance Expired": data.balance_amount?.value,
    "Recharge Successful": data.balance_amount?.value,
    "Recharge Failed": data.balance_amount?.value,
    "Reminder to Recharge": data.balance_amount?.value,
    "High Load Usage": data.eb_load_setting?.value,
    "Over Voltage Warning": data.voltage_r?.value,
    "Over Current": Math.max(
      data.current_r?.value || 0,
      data.current_y?.value || 0,
      data.current_b?.value || 0
    ),
    "Current Imbalance": 
      Math.max(
        data.current_r?.value || 0,
        data.current_y?.value || 0,
        data.current_b?.value || 0
      ) - Math.min(
        data.current_r?.value || 0,
        data.current_y?.value || 0,
        data.current_b?.value || 0
      ),
    "Neutral Voltage Issue": 
      (data.voltage_r?.value !== data.voltage_y?.value || 
       data.voltage_y?.value !== data.voltage_b?.value) ? "Issue" : "Normal",
    "Reverse Polarity": data.eb_dg_status?.value === 0 ? "Detected" : "Normal",
    "Magnetic Interference": data.tamper?.some(t => t.value === "Magnetic Interference") ? "Detected" : "Normal",
  };

  return valueMap[alertType];
}

// function formatValue(alertType, value) {
//   if (value === undefined || value === null || value === '') return '';
  
//   switch(alertType) {
//     case "Low Balance":
//     case "Recharge Successful":
//     case "Reminder to Recharge":
//     case "Balance Expired":
//     case "Recharge Failed":
//       return `₹${value.toFixed(2)}`;
//     case "High Load Usage":
//       return `${value} kW`;
//     case "Over Voltage Warning":
//       return `${value} V`;
//     case "Over Current":
//       return `${value} A`;
//     case "Magnetic Interference":
//       return value ? "Detected" : "Not Detected";
//     case "Neutral Voltage Issue":
//       return value ? "Issue Detected" : "Normal";
//     case "Reverse Polarity":
//       return value ? "Detected" : "Normal";
//     case "Current Imbalance":
//       return `${value} A difference`;
//     default:
//       return value.toString();
//   }
// }



function formatValue(alertType, value) {
  if (value === undefined || value === null || value === '') return '';
  
  switch(alertType) {
    // Financial alerts
    case "Low Balance":
    case "Recharge Successful":
    case "Reminder to Recharge":
    case "Balance Expired":
    case "Recharge Failed":
      return `₹${parseFloat(value).toFixed(2)}`;
    
    // Power measurement alerts
    case "High Load Usage":
      return `${value} kW`;
    case "Over Voltage Warning":
      return `${value} V`;
    case "Over Current":
      return `${value} A`;
    case "Current Imbalance":
      return `${value} A difference`;
    
    // Technical/status alerts
    case "Magnetic Interference":
      return value ? "Detected" : "Not Detected";
    case "Neutral Voltage Issue":
      return value ? "Issue Detected" : "Normal";
    case "Reverse Polarity":
      return value ? "Detected" : "Normal";
    
    default:
      return value.toString();
  }
}




async function processAlert({
  alert,
  meter,
  user,
  admin,
  data,
  time,
  alertType,
  value,
  notificationCategory = "custom",
  customMessage
}) {
  if (alert && !alert.isActive) {
    console.log(`Skipping ${alert.alertType} alert - not active`);
    return;
  }

  // const effectiveAlertType = alertType || alert?.alertType;
  // const config = ALERT_CONFIG[effectiveAlertType] || {};
  
  // Always take from DB settings if present, else fallback
  const notificationSettings = alert?.notificationSettings || {
    user: { 
      email: config.recipients?.user !== false,
      sms: false 
    },
    admin: { 
      email: config.recipients?.admin !== false,
      sms: false 
    }
  };

  // const finalMessage = (customMessage || config.message || effectiveAlertType)
  //   .replace(/{METER_ID}/g, meter.meterSerialNumber || "N/A")
  //   .replace(/{USER_ID}/g, user.name || `User ${user._id.toString()}`)
  //   .replace(/{VALUE}/g, value !== undefined && value !== null 
  //     ? formatValue(effectiveAlertType, value) 
  //     : "");


    const effectiveAlertType = alertType || alert?.alertType;
  const config = ALERT_CONFIG[effectiveAlertType] || {};
  
  // Calculate the alert value
  const alertValue = value !== undefined ? value : getValueForAlert(effectiveAlertType, data);
  
  // Format the value for display
  const formattedValue = formatValue(effectiveAlertType, alertValue);
  
  // Create the final message with proper placeholder replacement
  const finalMessage = (customMessage || config.message || effectiveAlertType)
    .replace(/{METER_ID}/g, meter.meterSerialNumber || "N/A")
    .replace(/{USER_ID}/g, user.name || `User ${user._id.toString()}`)
    .replace(/{VALUE}/g, formattedValue || "N/A");

  // const alertValue = value || getValueForAlert(effectiveAlertType, data);

  console.log("Processing alert:", {
    alertType: effectiveAlertType,
    notificationSettings,
    value: alertValue,
    formattedMessage: finalMessage
  });

  // 🛑 Step 1: Check if notifications for this user+meter are disabled
  const existingDoc = await NotificationModel.findOne({
    userId: user._id,
    meterId: meter._id,
    adminId: admin?._id || null,
  });

  if (existingDoc && existingDoc.status === "disabled") {
    console.log(`Notifications disabled for user ${user._id}, meter ${meter._id}`);
    return;
  }

  // 🛑 Step 2: Check for duplicate (already sent today)
  const startOfDay = new Date(time);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(time);
  endOfDay.setHours(23, 59, 59, 999);
// console.log("=====notiii====abdb=",user,admin)
  const alreadySent = await NotificationModel.findOne({
    userId: user._id,
    meterId: meter._id,
    adminId: admin?._id || null,
    "userNotification.alertType": effectiveAlertType,
    "userNotification.time": { $gte: startOfDay, $lte: endOfDay },
  });

  if (alreadySent) {
    console.log(`Skipping duplicate ${alert.alertType} for ${user._id} today`);
    return; // ✅ this is fine
  }

  // --- original recipient & sending logic stays unchanged ---
  const emailHtml = renderEmailTemplate({
    alertTitle: effectiveAlertType,
    color: alertColors[effectiveAlertType] || alertColors.Default,
    meterSerialNumber: meter.meterSerialNumber,
    userName: user.name || `User ${user._id.toString()}`,
    alertMessage: finalMessage,
    value: alertValue,
    time: time.toLocaleString(),
  });


  console.log("=======emailHtml =======",emailHtml )

  const smsText = `[${effectiveAlertType} Alert]
${finalMessage}

Meter: ${meter.meterSerialNumber || "N/A"}
Value: ${formatValue(effectiveAlertType, alertValue)}
Time: ${time.toLocaleString()}

- Smartlynk Team`;

  const recipients = [];

  // User
  if (notificationSettings.user) {
    if (notificationSettings.user.email && user.email) {
      recipients.push({ type: "User", mode: "Email", email: user.email, userId: user._id });
    }
    if (notificationSettings.user.sms && user.phonenumber) {
      recipients.push({ type: "User", mode: "Text", phone: formatPhoneNumber(user.phonenumber), userId: user._id });
    }
  }

  // Admin
  if (notificationSettings.admin && admin) {
    if (notificationSettings.admin.email && admin.email) {
      recipients.push({ type: "Admin", mode: "Email", email: admin.email, userId: admin._id });
    }
    if (notificationSettings.admin.sms && admin.phonenumber) {
      recipients.push({ type: "Admin", mode: "Text", phone: formatPhoneNumber(admin.phonenumber), userId: admin._id });
    }
  }

  if (recipients.length === 0) {
    console.warn(`No recipients found for alert ${effectiveAlertType} with settings:`, notificationSettings);
    return;
  }

  console.log("Final recipients:", recipients);

  // Send to all recipients
  for (const recipient of recipients) {
    try {
      const notificationPayload = {
        alertType: effectiveAlertType,
        message: finalMessage,
        value: alertValue?.toString(),
        mode: recipient.mode,
        time,
        notificationCategory,
      };

      await NotificationModel.updateOne(
        { userId: recipient.userId, meterId: meter._id, adminId: admin?._id || null },
        {
          $push: {
            userNotification: { $each: [notificationPayload], $position: 0 },
          },
          $set: { lastNotificationDate: time, status: "enabled" }, // keep status enabled by default
        },
        { upsert: true }
      );

      if (recipient.mode === "Email" && recipient.email) {
        await sendEmail(recipient.email, `Alert: ${effectiveAlertType}`, emailHtml, true);
        console.log(`Email sent to ${recipient.type}: ${recipient.email}`);
      } else if (recipient.mode === "Text" && recipient.phone) {
        await sendSMS(recipient.phone, smsText);
        console.log(`SMS sent to ${recipient.type}: ${recipient.phone}`);
      }
    } catch (err) {
      console.error(`Failed to send ${recipient.mode} to ${recipient.type}:`, err);
    }
  }
}


module.exports = { sendNotification };

