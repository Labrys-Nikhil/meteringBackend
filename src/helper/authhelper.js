const bcrypt = require('bcrypt');
const {generateAccessToken,generateRefreshToken} = require('./tokenGeneration');

const loginLogicHepler = async (user, password) => {
  // Compare the password with the hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { status: 401, message: "Invalid password" };
  }

  // Generate JWT token
  const refreshToken = generateRefreshToken(user);
  const token = generateAccessToken(user);

  //save the refresh token in the db.
  user.refreshToken = refreshToken;

  await user.save();
  user.authToken = token;
  const newUser = {
    id:user.id,
    authToken:token,
    refreshToken:refreshToken,
    role:user.role,
    email:user.email,
  } 
  console.log("USER---->",user);

  return { status: 200, message: "Login successful", user:newUser};
}
function generatePassword(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

module.exports = {generatePassword,loginLogicHepler}