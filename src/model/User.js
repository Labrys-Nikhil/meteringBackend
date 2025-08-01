const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const actionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  userName: {
    type: String,
    required: false
  },
  actionType: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    required: false
  },
  performedBy: {
    type: String,
    required: true
  }
});

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
      enum: ["superAdmin", "admin", "user"],
      required: true,
      default: "user",
    },
    firstLogin: {
      type: Boolean,
      default: false
    },
    otp: String,
    phonenumber: String,
    refreshToken: {
      type: String,
      default: ""
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    otpExpiresAt: Date,

    actionHistory: {
      type: [actionSchema],
      default: []
    },
    lastLogin: { type: Date, default: null },
    loginCount: { type: Number, default: 0 },
    status: { type: String },
    superAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    bio: {
      type: String,
      default: ""
    },
    avatar: {
      type: String,  // You can store image URL or file path here
      default: ""
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    website: {
      type: String,
      default: ""
    },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      github: { type: String, default: '' }
    }

  },
  { timestamps: true }
);



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
