const express = require("express");
const router = express.Router();
const Ticker = require("../models/ticker.model");
const UserPortfolio = require("../models/userPortfolio.model");
const { getStockData } = require("../services/fyers/fyers.service");

router.get("/:isin", async (req, res) => {
  const { isin } = req.params;
  console.log("Stock request from App Frontend:", isin);

  try {
    const ticker = await Ticker.findOne({ isin });

    if (!ticker) {
      console.error("Ticker not found for ISIN:", isin);
      return res.status(404).json({ error: "Ticker not found" });
    }

    const fyersResponse = await getStockData(ticker.symbol);

    if (!fyersResponse?.d?.[0]?.v) {
      console.error("Invalid response from FYERS:", fyersResponse);
      return res.status(500).json({ error: "Invalid response from FYERS" });
    }

    const d = fyersResponse.d[0].v;

    const mappedData = {
      lastPrice: d.lp,
      openPrice: d.open_price,
      highPrice: d.high_price,
      lowPrice: d.low_price,
      prevClosePrice: d.prev_close_price,
      volume: d.volume,
      averageTradePrice: d.atp,
      ask: d.ask,
      bid: d.bid,
      change: d.ch,
      changePercent: d.chp,
      fyToken: d.fyToken,
      tradeTimestamp: d.tt,
      description: d.description,
      shortName: d.short_name,
      spread: d.spread,
      lastFetchedAt: new Date(),
    };

    await Ticker.updateOne({ isin }, { $set: mappedData });

    const responseData = {
      currentPrice: mappedData.lastPrice,
      open: mappedData.openPrice,
      high: mappedData.highPrice,
      low: mappedData.lowPrice,
      prevClose: mappedData.prevClosePrice,
      volume: mappedData.volume,
      atp: mappedData.averageTradePrice,
      ask: mappedData.ask,
      bid: mappedData.bid,
      change: mappedData.change,
      changePercent: mappedData.changePercent,
      tradeTimestamp: mappedData.tradeTimestamp,
      isin,
      symbol: ticker.symbol,
      name: ticker.name,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error in app backend route:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search/:query", async (req, res) => {
  const { query } = req.params;

  try {
    const results = await Ticker.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { symbol: { $regex: query, $options: "i" } },
      ],
    }).limit(5);

    console.log("Search matched results:", results.length);
    res.json(
      results.map((t) => ({
        name: t.name,
        symbol: t.symbol,
        isin: t.isin,
      }))
    );
  } catch (error) {
    console.error("Ticker search failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/holding/:username/:isin", async (req, res) => {
  const { username, isin } = req.params;
console.log(username+isin)
  try {
    const user = await UserPortfolio.findOne({ username });
    if (!user) {
      console.error("User not found:", username);
      return res.status(404).json({ error: "User not found" });
    }

    const stock = user.stocks.find(
      (s) => (s.isin || "").trim().toUpperCase() === isin.trim().toUpperCase()
    );

    if (!stock) {
      console.log("Stock not found in portfolio:", isin);
      return res.status(404).json({});
    }

    console.log("Found holding:", stock.symbol || stock.isin);
    res.json(stock);
  } catch (error) {
    console.error("Get holding by ISIN failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
