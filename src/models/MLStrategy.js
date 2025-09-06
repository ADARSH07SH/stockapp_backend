import mongoose from "mongoose";

const MLStrategySchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true },
    crossover: String,
    rsi: String,
    userStrategy: String,
  },
  { timestamps: true }
);

export default mongoose.model("MLStrategy", MLStrategySchema);
