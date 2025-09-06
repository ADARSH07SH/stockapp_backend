const express = require("express");
const MLStrategy = require("../models/MLStrategy.model");

const router = express.Router();

router.post("/ml-strategy", async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  let strategy = await MLStrategy.findOne({
    symbol,
    updatedAt: { $gte: oneMonthAgo },
  });

  if (!strategy) {
    strategy = await MLStrategy.findOneAndUpdate(
      { symbol },
      {
        crossover: `Bullish crossover detected for ${symbol}`,
        rsi: `RSI is at ${Math.floor(Math.random() * 40) + 30}`,
      },
      { upsert: true, new: true }
    );
  }

  res.json(strategy);
});

router.post("/user-strategy", async (req, res) => {
  const { symbol, text } = req.body;
  if (!symbol || !text) {
    return res.status(400).json({ error: "Symbol and text are required" });
  }

  const strategy = await MLStrategy.findOneAndUpdate(
    { symbol },
    { userStrategy: text, updatedAt: new Date() },
    { upsert: true, new: true }
  );

  res.json(strategy);
});

module.exports = router;
