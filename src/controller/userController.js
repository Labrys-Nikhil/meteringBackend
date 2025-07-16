const { userSchema } = require('../validator/userValidator');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const { TokenData } = require('path-to-regexp');
const { generateRefreshToken } = require('../helper/tokenGeneration');


module.exports = { register, login, logout };