
const ByDefault_ALERT_CONFIG = [
  { alertType: "Low Balance", isSystemAlert: true, editable: true },
  { alertType: "Balance Expired", isSystemAlert: true, editable: false },
  { alertType: "Recharge Successful", isSystemAlert: true, editable: false },
  { alertType: "Recharge Failed", isSystemAlert: true, editable: false },
  { alertType: "Reminder to Recharge", isSystemAlert: true, editable: true },
  { alertType: "Magnetic Interference", isSystemAlert: true, editable: false },
  { alertType: "Neutral Voltage Issue", isSystemAlert: true, editable: false },
  { alertType: "Reverse Polarity", isSystemAlert: true, editable: false },
  { alertType: "High Load Usage", isSystemAlert: true, editable: false },
  { alertType: "Current Imbalance", isSystemAlert: true, editable: true },
  { alertType: "Over Voltage Warning", isSystemAlert: true, editable: true },
];

module.exports = ByDefault_ALERT_CONFIG;
