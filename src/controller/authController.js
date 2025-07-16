const { generateAccessToken,generateRefreshToken } = require('../helper/tokenGeneration')
const User = require('../model/User');
const bcrypt = require('bcrypt');
require('dotenv').config();
//validation
const{userSchema} = require('../validator/userValidator');

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

//register the USer for specific Admin
const register = async (req, res) => {
  try {
 
    const checkUserData = userSchema.parse(req.body);

    //check if the user already exists
    const exixtingUser = await User.findOne({ email: checkUserData.email });

    if (exixtingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({
      name: checkUserData.name,
      email: checkUserData.email,
      password: checkUserData.password,
      role: checkUserData.role,
      firstLogin:true
    });

    newUser.save();

    //return success response
    return res.status(201).json({ message: "User registered successfully",redirect:{url:'/reset-password'} });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
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

    if (!["admin", "user"].includes(user.role)) {
      return res.status(403).json({ error: "Access denied: Invalid role" });
    }

    const loginResponse = await loginLogicHepler(user, password);
    if (loginResponse.status !== 200) {
      return res.status(loginResponse.status).json({ error: loginResponse.message });
    }
    return res.status(loginResponse.status).json({
      message: loginResponse.message,
      userData: loginResponse.userData,
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


const loginLogicHepler = async (user, password) => {
  // Compare the password with the hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { status: 401, message: "Invalid password" };
  }

  // Generate JWT token
  const refershToken = generateRefreshToken(user);
  const token = user.generateAuthToken(user);

  //save the refresh token in the db.
  user.refershToken = refershToken;

  await user.save();
  user.token = token;

  return { status: 200, message: "Login successful", userData: user };
}
function generatePassword(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
module.exports = { smartlynkRegistration, register, logout, login }