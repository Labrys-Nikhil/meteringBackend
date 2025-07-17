const bcrypt = require('bcrypt');
const {generateAuthToken,generateRefreshToken} = require('./tokenGeneration');

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

module.exports = {generatePassword,loginLogicHepler}