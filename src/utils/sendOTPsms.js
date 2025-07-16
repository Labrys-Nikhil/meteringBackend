const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendOtpSMS = async (toPhone, otp) => {
  try {
    const message = await client.messages.create({
      body: `
          Your OTP is: ${otp}.
          To complete verification, submit otp to this url:${process.env.OTP_URL} 
       `,
      from: twilioPhone,
      to: toPhone.startsWith('+') ? toPhone : `+91${toPhone}` 
    });

    console.log(` OTP sent to ${toPhone}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(` Failed to send OTP to ${toPhone}:`, error.message);
    throw error;
  }
};

module.exports = sendOtpSMS;
