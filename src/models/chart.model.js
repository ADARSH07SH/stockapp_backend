const mongoose = require("mongoose");

const CandleSchema = new mongoose.Schema({
  timestamp: { type: Number, required: true }, // UNIX timestamp
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
});

const ChartSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // e.g., NIFTY50, SENSEX
  lastUpdated: { type: Date, default: Date.now }, // last update timestamp
  candles: [CandleSchema], // array of OHLCV candles
});

module.exports = mongoose.model("Chart", ChartSchema);
