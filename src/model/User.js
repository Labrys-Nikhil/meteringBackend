const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user",
    },
    firstLogin:{
      type:Boolean,
      default:false
    },
    otp: String,
    phonenumber: String,
    refreshToken: { type: String, default: "" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    otpExpiresAt: Date,
  },
  { timestamps: true }
);


//pre hook to save the hash password.
userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    return next(err);
  }
})
module.exports = mongoose.model("User", userSchema);
