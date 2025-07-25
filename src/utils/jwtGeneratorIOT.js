const jwt = require("jsonwebtoken");

const generateTokenFromIOT = (email) => {
  const payload = {
    email,
    iat: Math.floor(Date.now() / 1000),
    iss: "metering-backend",
  };

  return jwt.sign(payload, process.env.SMARTLYNK_SHARED_SECRET, {
    expiresIn: "5m", // Token valid for 5 minutes
  });
};

module.exports = generateTokenFromIOT;
