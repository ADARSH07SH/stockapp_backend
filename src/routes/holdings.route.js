require("dotenv").config();
const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const UserPortfolio = require("../models/userPortfolio.model");
const Ticker = require("../models/ticker.model");
const { getStockData } = require("../services/fyers/fyers.service");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const findSymbolFromMongo = async (isin, name) => {
  if (isin) {
    const byIsin = await Ticker.findOne({ isin: isin.trim() });
    if (byIsin?.symbol) return byIsin.symbol;
  }
  if (name) {
    const byName = await Ticker.findOne({
      name: new RegExp(`^${name.trim()}`, "i"),
    });
    if (byName?.symbol) return byName.symbol;
  }
  return "";
};

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const username = req.query.username;
    if (!username)
      return res.status(400).json({ error: "Username is required" });

    const buffer = req.file.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = xlsx.utils.sheet_to_json(sheet, {
      range: 10,
      defval: "",
      raw: true,
    });

    const newStocks = await Promise.all(
      rows.map(async (row) => {
        let symbol = row["Symbol"] || "";
        const name = row["Stock Name"] || row["Name"] || "";
        const isin = row["ISIN"] || "";

        if (!symbol && (isin || name)) {
          symbol = await findSymbolFromMongo(isin, name);
        }

        return {
          symbol,
          name,
          quantity: Number(row["Quantity"] || 0),
          avgBuyPrice: Number(row["Average buy price"] || 0),
          buyValue: Number(row["Buy value"] || 0),
          currentPrice: Number(row["Closing price"] || 0),
          closingValue: Number(row["Closing value"] || 0),
          unrealisedPL: Number(row["Unrealised P&L"] || 0),
          isin,
          lastUpdated: new Date(),
        };
      })
    );

    await UserPortfolio.findOneAndUpdate(
      { username },
      {
        $set: {
          stocks: newStocks,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Stocks uploaded and symbols enriched",
      count: newStocks.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const userPortfolio = await UserPortfolio.findOne({
      username: req.params.username,
    });
    if (!userPortfolio)
      return res.status(404).json({ error: "Portfolio not found" });
    res.json(userPortfolio);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.put("/updateHolding/:isin/:username", async (req, res) => {
  const { isin, username } = req.params;

  try {
    const user = await UserPortfolio.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const stock = user.stocks.find(
      (s) => (s.isin || "").trim().toUpperCase() === isin.trim().toUpperCase()
    );
    if (!stock)
      return res.status(404).json({ error: "Stock not found in portfolio" });

    const ticker = await Ticker.findOne({ isin: isin.trim().toUpperCase() });
    if (!ticker?.symbol)
      return res.status(404).json({ error: "Fyers symbol not found for ISIN" });

    const fyersSymbol = ticker.symbol;
    const fyersData = await getStockData(fyersSymbol);
    const fyersDataRaw = fyersData?.d?.[0]?.v;

    if (!fyersDataRaw || typeof fyersDataRaw.lp !== "number") {
      return res.status(500).json({ error: "Invalid stock data from Fyers" });
    }

    const currentPrice = fyersDataRaw.lp;
    const closingValue = currentPrice * stock.quantity;
    const unrealisedPL = closingValue - stock.buyValue;

    const updateFields = {
      "stocks.$.currentPrice": currentPrice,
      "stocks.$.closingValue": closingValue,
      "stocks.$.unrealisedPL": unrealisedPL,
      "stocks.$.lastUpdated": new Date(),
    };

    if (!stock.symbol && ticker.symbol) {
      updateFields["stocks.$.symbol"] = ticker.symbol;
    }

    await UserPortfolio.updateOne(
      { username, "stocks.isin": isin.trim().toUpperCase() },
      { $set: updateFields }
    );

    res.json({
      success: true,
      message: "Stock updated successfully",
      updated: {
        currentPrice,
        closingValue,
        unrealisedPL,
        lastUpdated: new Date(),
        isin,
        symbol: ticker.symbol,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
