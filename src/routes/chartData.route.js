const express = require("express");
const router = express.Router();
const { getChartData } = require("../services/fyers/fyers.service");

router.get("/", async (req, res) => {
    try {
      console.log("called");
    const symbol = "NSE:SBIN-EQ";
    const resolution = "D";
    const range_from = Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60); // 7 days ago
    const range_to = Math.floor(Date.now() / 1000);

    const data = await getChartData(symbol, resolution, range_from, range_to);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Nifty50 chart data" });
  }
});

module.exports = router;
