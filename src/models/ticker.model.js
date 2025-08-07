const mongoose = require("mongoose");

const tickerSchema = new mongoose.Schema({
  source: String, // NSE or BSE
  symbol: { type: String, index: true }, 
  name: String,
  series: String,
  isin: { type: String, index: true },
  bseCode: String,
  faceValue: Number,

  // FYERS-specific
  fyToken: { type: String, index: true },
  exchange: String,
  segment: String,
  tickSize: Number,
  lotSize: Number,

  lastPrice: Number,
  openPrice: Number,
  highPrice: Number,
  lowPrice: Number,
  prevClosePrice: Number,
  volume: Number,
  totalBuyQty: Number,
  totalSellQty: Number,
  averageTradePrice: Number,
  upperCircuitLimit: Number,
  lowerCircuitLimit: Number,
  lastTradedQty: Number,

  ask: Number,
  bid: Number,
  change: Number,
  changePercent: Number,
  tradeTimestamp: String,
  description: String,
  shortName: String,
  spread: Number,

  lastFetchedAt: Date,
});

module.exports = mongoose.model("Ticker", tickerSchema);
