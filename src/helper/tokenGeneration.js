const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id,role:user.role}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '3h',
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id,role:user.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = { generateAccessToken, generateRefreshToken };