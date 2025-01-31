const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    ref: "Category",
  },
  subcategories: [{
    category: {
      type: String,
      required: true,
      ref: "Category",
    },
    amount: {
      type: Number,
      required: true,
    },
  }],
  currency: {
    type: String,
    required: true,
    ref: "Currency",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: String,
  isExcluded: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  title: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

mongoose.model("Activity", activitySchema, "Activities");