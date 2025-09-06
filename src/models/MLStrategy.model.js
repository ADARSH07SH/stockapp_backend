const mongoose = require("mongoose");

const MLStrategySchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true },
    crossover: String,
    rsi: String,
    userStrategy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MLStrategy", MLStrategySchema);
