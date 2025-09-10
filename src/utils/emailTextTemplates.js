








const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <title>{ALERT_TITLE}</title>
  <style>
    .alert-box {
      border-left: 5px solid {COLOR};
      padding: 10px;
      background-color: #f8f9fa;
      margin: 10px 0;
    }
  </style>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <table width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    <tr>
      <td>
        <h2 style="color: {COLOR}; margin-top: 0;">{ALERT_TITLE}</h2>
        <div class="alert-box">
          <p style="margin: 0;">{ALERT_MESSAGE}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 5px 0; border-bottom: 1px solid #eee;">Meter Serial</td>
            <td style="padding: 5px 0; border-bottom: 1px solid #eee; text-align: right;"><strong>{METER_SERIAL}</strong></td>
          </tr>
          {VALUE_DISPLAY}
          <tr>
            <td style="padding: 5px 0;">Timestamp</td>
            <td style="padding: 5px 0; text-align: right;"><strong>{TIME}</strong></td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee;"/>
        <p style="text-align: center; color: #6c757d; font-size: 0.9em;">Thank you,<br/>Smartlynk Metering Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;







const renderEmailTemplate = ({
  alertTitle,
  color,
  meterSerialNumber,
  alertMessage,
  value,
  time,
}) => {
  // Format value row if value exists
  // let valueDisplay = '';
  // if (value !== undefined && value !== null && value !== '') {
  //   const formattedValue = formatValue(alertTitle, value);
  //   valueDisplay = `
  //     <tr>
  //       <td style="padding: 5px 0; border-bottom: 1px solid #eee;">Alert Value</td>
  //       <td style="padding: 5px 0; border-bottom: 1px solid #eee; text-align: right;"><strong>${formattedValue}</strong></td>
  //     </tr>
  //   `;
  // }

  // return EMAIL_TEMPLATE
  //   .replace(/{ALERT_TITLE}/g, alertTitle)
  //   .replace(/{COLOR}/g, color)
  //   .replace(/{METER_SERIAL}/g, meterSerialNumber || "N/A")
  //   .replace(/{ALERT_MESSAGE}/g, alertMessage)
  //   .replace(/{VALUE_DISPLAY}/g, valueDisplay)
  //   .replace(/{TIME}/g, time);



  let valueDisplay = '';
  if (value !== undefined && value !== null && value !== '') {
    const formattedValue = formatValue(alertTitle, value);
    valueDisplay = `
      <tr>
        <td style="padding: 5px 0; border-bottom: 1px solid #eee;">Alert Value</td>
        <td style="padding: 5px 0; border-bottom: 1px solid #eee; text-align: right;"><strong>${formattedValue}</strong></td>
      </tr>
    `;
  }

  return EMAIL_TEMPLATE
    .replace(/{ALERT_TITLE}/g, alertTitle)
    .replace(/{COLOR}/g, color)
    .replace(/{METER_SERIAL}/g, meterSerialNumber || "N/A")
    .replace(/{ALERT_MESSAGE}/g, alertMessage) // This contains the formatted value
    .replace(/{VALUE_DISPLAY}/g, valueDisplay) // Additional value display
    .replace(/{TIME}/g, time);
};

const renderSMSTemplate = ({
  alertType,
  meterSerialNumber,
  value,
  time,
  message,
}) => {
  // Simplify SMS message - remove HTML tags and extra formatting
  const cleanMessage = message
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n\s+/g, '\n') // Remove extra spaces
    .trim();

  const formattedValue = (value !== undefined && value !== null && value !== '') 
    ? formatValue(alertType, value)
    : null;

  return `[${alertType} Alert]
${cleanMessage}

Meter: ${meterSerialNumber || "N/A"}
${formattedValue ? `Value: ${formattedValue}\n` : ''}Time: ${time}

- Smartlynk Team`.trim();
};
// Complete value formatting for all 12 alert types
function formatValue(alertType, value) {
  switch(alertType) {
    // Financial alerts
    case "Low Balance":
    case "Recharge Successful":
    case "Reminder to Recharge":
    case "Balance Expired":
    case "Recharge Failed":
      return `₹${value}`;
    
    // Power measurement alerts
    case "High Load Usage":
      return `${value}kW`;
    case "Over Voltage Warning":
      return `${value}V`;
    case "Over Current":
      return `${value}A`;
    
    // Technical/status alerts
    case "Magnetic Interference":
      return value ? "Detected" : "Not Detected";
    case "Neutral Voltage Issue":
      return value ? "Issue Detected" : "Normal";
    case "Reverse Polarity":
      return value ? "Detected" : "Normal";
    case "Current Imbalance":
      return `${value}A difference between phases`;
    
    default:
      return value;
  }
}

const alertColors = {
  // Financial alerts
  "Low Balance": "#d9534f", // Red
  "Balance Expired": "#dc3545", // Dark red
  "Recharge Successful": "#28a745", // Green
  "Recharge Failed": "#dc3545", // Dark red
  "Reminder to Recharge": "#007bff", // Blue
  
  // Technical alerts
  "Magnetic Interference": "#fd7e14", // Orange
  "Neutral Voltage Issue": "#ff851b", // Dark orange
  "Reverse Polarity": "#dc3545", // Dark red
  "Current Imbalance": "#ff851b", // Dark orange
  
  // Power measurement alerts
  "High Load Usage": "#ffcc00", // Yellow
  "Over Voltage Warning": "#ff851b", // Dark orange
  "Over Current": "#ff851b", // Dark orange
  
  // Default
  Default: "#333333", // Dark gray
};

module.exports = {
  renderEmailTemplate,
  alertColors,
  renderSMSTemplate,
  formatValue
};
