const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  _id: String,
  icon: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
  },
  color: {
    type: String,
    required: true,
  },
  colorName: {
    type: String,
    required: true,
  },
});

mongoose.model("Category", categorySchema, "Categories");