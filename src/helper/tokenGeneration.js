const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateAccessToken = (user) => {
    const data = jwt.sign({ id: user.id,role:user.role}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '3h',
    });
    return data;
};

const generateRefreshToken = (user) => {
    const data = jwt.sign({ id: user.id,role:user.role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '30d',
    });
    return data;
};

module.exports = { generateAccessToken, generateRefreshToken };