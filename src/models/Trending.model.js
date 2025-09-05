const mongoose = require("mongoose");

const TrendingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    url: { type: String, default: "#" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trending", TrendingSchema);
