const express = require("express");
const router = express.Router();
const { getChartData } = require("../services/fyers/fyers.service");

const getRangeParams = (range, offsetDays = 0) => {
  // offsetDays will allow us to go back in time
  const now = Math.floor(Date.now() / 1000) - 60 - offsetDays * 24 * 60 * 60;
  let resolution = "D";
  let range_from = now - 7 * 24 * 60 * 60;

  switch (range) {
    case "1D":
      resolution = "1";
      range_from = now - 24 * 60 * 60;
      break;
    case "1W":
      resolution = "D";
      range_from = now - 7 * 24 * 60 * 60;
      break;
    case "1M":
      resolution = "D";
      range_from = now - 30 * 24 * 60 * 60;
      break;
    case "6M":
      resolution = "D";
      range_from = now - 6 * 30 * 24 * 60 * 60;
      break;
    case "1Y":
      resolution = "D";
      range_from = now - 365 * 24 * 60 * 60;
      break;
    case "5Y":
      resolution = "W";
      range_from = now - 5 * 365 * 24 * 60 * 60;
      break;
  }

  return { resolution, range_from, range_to: now };
};

const fetchWithFallback = async (symbol, range, maxPrevDays = 15) => {
  for (let i = 0; i <= maxPrevDays; i++) {
    const { resolution, range_from, range_to } = getRangeParams(range, i);
    const data = await getChartData(symbol, resolution, range_from, range_to);

    if (data.candles && data.candles.length > 0) {
      return data; // return as soon as we get valid candles
    }

    if (i === maxPrevDays) {
      return {
        success: false,
        message: "No data available for last 15 days",
        candles: [],
      };
    }
  }
};

router.get("/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const range = req.query.range || "1D";

    

    const data = await fetchWithFallback(symbol, range);

    
    if (data.candles && data.candles.length > 0) {
      res.json({ success: true, candles: data.candles });
    } else {
      res.json({
        success: false,
        candles: [],
        message: data.message || "No data",
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, candles: [], message: "Server error" });
  }
});

module.exports = router;
