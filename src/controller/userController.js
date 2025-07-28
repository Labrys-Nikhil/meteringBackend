const bcrypt = require('bcrypt');
const User = require('../model/User');

const { createUserSchema, updateUserSchema, userSchema } = require('../validator/userValidator');;
const userService = require("../service/userService");

const createUser = async (req, res) => {
    try {
        const validated = createUserSchema.parse(req.body);
        const user = await userService.createUser(validated);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        // console.log("6",err)
        res.status(400).json({ success: false, message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const validated = updateUserSchema.parse(req.body);
        console.log("======", req.body)
        const updated = await userService.updateUser(req.params.id, validated);
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

const getUsers = async (req, res) => {
    try {
        console.log("data",req.query);
        const users = await userService.getUsers(req.query);
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {createUser,updateUser,deleteUser,getUsers,getUserById}