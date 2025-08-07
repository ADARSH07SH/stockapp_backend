const axios = require("axios");

const getStockData = async (symbol) => {
  try {
    const url = `${process.env.FYER_ENDPOINT}/stockData/${symbol}`;
    const headers = { "x-api-key": process.env.FYER_API_KEY };
    const response = await axios.get(url, { headers });
    
    return response.data;
  } catch (err) {
    console.error("FYERS fetch error:", err.response?.data || err.message);
    return { error: "Failed to fetch stock data" };
  }
};

module.exports = { getStockData };
