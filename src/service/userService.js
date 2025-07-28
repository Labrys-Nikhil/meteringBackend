const User = require("../model/User");
const bcrypt = require("bcrypt");

// models/userModel.js
const mongoose = require('mongoose');


const sendOtpSMS = require('../utils/sendOTPsms');
const { generateOTP, generateRandomPassWord } = require("../utils/otpGenerator");
exports.createUser = async (data) => {
    try {

        // first create the otp and save in the db and send to the user on mobile no or email  (with login or varification  url and wellcome)
        console.log("======createUser======", JSON.stringify(data))

        // Check if user already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return {
                success: false,
                status: 400,
                message: "Email already exists",
                data: null,
            };
        }

        // Generate OTP and set expiry (10 mins from now)

        const { otp, otpExpiresAt } = generateOTP(6, 10); // 10 minutes expiry

        // // Create and save the user
        // const user = new User(data);
        // const savedUser = await user.save();

        // Create user object with OTP and expiry
        const tempPassword = generateRandomPassWord();
        const user = new User({
            ...data,
            password: tempPassword,
            otp,
            otpExpiresAt,
        });

        // console.log("====user =====",user )


        // Save user to DB
        const savedUser = await user.save();

        // // Send OTP via SMS
        // if (data.phonenumber) {
        //   console.log("===data.phonenumber======",data.phonenumber,otp)
        //   await sendOtpSMS(data.phonenumber, otp);
        // }

        return {
            success: true,
            status: 201,
            message: "User created successfully",
            data: savedUser,
        };
    } catch (error) {
        console.error("Error in createUser service:", error.message);
        return {
            success: false,
            status: 500,
            message: "An error occurred while creating the user",
            error: error.message,
        };
    }
};


exports.updateUser = async (id, data) => {

    // if the status is suspended then add the reason also and send downlink for the userMeter for suspended time 
    // if status is inactive then remove the users data and meter data 
    console.log("======updateUser======", JSON.stringify(data))
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
    }

    // Update user data
    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    return updatedUser;
};

exports.deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    return await User.findByIdAndDelete(id);
};

exports.getUserById = async (id) => {
    const user = await User.findById(id).select("-password");
    if (!user) throw new Error("User not found");
    return user;
};

exports.getUsers = async ({ superAdminId, adminId, search }) => {
    const query = {};
    if (superAdminId) query.superAdminId = superAdminId;
    if (adminId) query.adminId = adminId;
    if (search) {
        query.$or = [
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
        ];
    }
    //console.log("=====user======", query)

    let user = await User.find(query).select("-password");
    console.log("=====user======", query, user)
    return user
};
