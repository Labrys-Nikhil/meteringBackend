


const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send OTP SMS with URL
 * @param {string} toPhone - Recipient phone number
 * @param {string} otp - OTP code
 */
const sendOtpSMS = async (toPhone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}. To complete verification, submit OTP to this URL: ${process.env.OTP_URL}`,
      from: twilioPhone,
      to: toPhone.startsWith('+') ? toPhone : `+91${toPhone}`,
    });

    console.log(`✅ OTP sent to ${toPhone}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${toPhone}:`, error.message);
    throw error;
  }
};

/**
 * General SMS sender
 * @param {string} to - Recipient phone number
 * @param {string} messageBody - SMS body content
 */
const sendSMS = async (to, messageBody) => {
  try {
    console.log("=====messageBody======",messageBody)
    // messageBody="Hi Saif34, this message is sent via Twilio SMS API using Node.js"
    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to: to.startsWith('+') ? to : `+91${to}`,
    });

    console.log(`✅ SMS sent to ${to}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendOtpSMS, sendSMS };
