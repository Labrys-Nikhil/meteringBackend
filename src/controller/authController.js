const User = require('../model/User');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { generateAccessToken,generateRefreshToken } = require('../helper/tokenGeneration')
const {generatePassword,loginLogicHepler} = require('../helper/authhelper')

//validation
const{userSchema} = require('../validator/userValidator');
const sendOtpSMS = require('../utils/sendOTPsms');
const { date } = require('zod');

const smartlynkRegistration = async (req,res) => {
  const { name, email } = req.body;

  let user = await User.findOne({ email });


  if (!user) {
    const firstPassword = generatePassword(10);
    const hashedPassword = await bcrypt.hash(firstPassword,10);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      firstLogin: true,
      adminId: process.env.SUPER_ADMIN_ID,
    });
  }

  // generate tokens and return response
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  user.refreshToken = refreshToken;
  await user.save();

  const newUser = {
    id:user._id,
    email:user.email,
    name:user.name,
    role:user.role,
    firstLogin:user.firstLogin
  }

  return res.status(201).json({ message: "Admin created sucessfully", accessToken, refreshToken, newUser });
}

//register the User for specific Admin
const register = async (req, res) => {
  try {
    const checkUserData = userSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: checkUserData.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Generate OTP
    const OneTimeOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name: checkUserData.name,
      email: checkUserData.email,
      password: checkUserData.password, // hash if not using pre-save hook
      role: checkUserData.role,
      phoneNumber: checkUserData.phoneNumber,
      firstLogin: true,
      otp:OneTimeOTP,
      adminId:checkUserData.adminId,
      otpExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now
    });

    await newUser.save();

    // Send OTP via SMS
    // const sendOtpToUser = await sendOtpSMS(newUser.phoneNumber, newUser.otp);

    // if (!sendOtpToUser || sendOtpToUser.error) {
    //   return res.status(500).json({ error: "Failed to send OTP SMS" });
    // }
    console.log("otp:",newUser.otp);

    return res.status(201).json({ message: "User registered successfully. OTP sent." });
  } catch (error) {
    console.error(" Error during user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    // Validate the request body
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!["admin", "user","superAdmin"].includes(user.role)) {
      return res.status(403).json({ error: "Access denied: Invalid role" });
    }

    const loginResponse = await loginLogicHepler(user, password);
    if (loginResponse.status !== 200) {
      return res.status(loginResponse.status).json({ error: loginResponse.message });
    }
    return res.status(loginResponse.status).json({
      message: loginResponse.message,
      data:loginResponse.user
    });

  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
const logout = async (req, res) => {
  try {
    

    // Return a success response
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during user logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
const otpVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;

    if (!otp || !userId) {
      return res.status(400).json({ message: "OTP and userId are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP not found or already verified" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP verified successfully
    user.otp = null;
    user.otpExpiresAt = null;
    user.firstLogin = false;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async(req,res)=>{
  try{

  }
  catch(error){
    
  }
}

module.exports = { smartlynkRegistration, register, logout, login,otpVerification,forgotPassword }