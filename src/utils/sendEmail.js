



const nodemailer = require("nodemailer");
require("dotenv").config();




const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
//   host: "smtp.privateemail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
 
  },
    tls: {
    rejectUnauthorized: false // Bypass SSL certificate validation
  }
});

module.exports = transporter;




const sendEmail = async (to, subject, content, isHtml = false) => {
  console.log("===emailcontent==",content)
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    [isHtml ? 'html' : 'text']: content,
  };

  await transporter.sendMail(mailOptions);
};




module.exports = sendEmail;
