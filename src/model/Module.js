const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      default: null,
    },
    icon:{
      type: String,
      default: null,
    },
    color:{
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },
    is_sidebar: {
      type: Boolean,
      default: false, // Sidebar visibility
    },
  },
  { timestamps: true }
);

// Self-relation for parent-child
moduleSchema.virtual("children", {
  ref: "Module",
  localField: "_id",
  foreignField: "parent_id",
});

module.exports = mongoose.model("Module", moduleSchema);