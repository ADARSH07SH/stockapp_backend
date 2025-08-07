const mongoose = require("mongoose");

const StockHoldingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true },
    name: { type: String }, 
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
    buyValue: { type: Number },
    currentPrice: { type: Number },
    closingValue: { type: Number },
    unrealisedPL: { type: Number },
    isin: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
); 
const MutualFundHoldingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    folio: { type: String },
    quantity: { type: Number, required: true },
    nav: { type: Number },
    avgBuyPrice: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OtherAssetSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },  
    name: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    quantity: { type: Number },
    price: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserPortfolioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  stocks: [StockHoldingSchema],
  mutualFunds: [MutualFundHoldingSchema],
  others: [OtherAssetSchema],
  totalInvestment: { type: Number, default: 0 },
  totalCurrentValue: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserPortfolio", UserPortfolioSchema);
