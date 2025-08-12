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

const getChartData = async (symbol, resolution, range_from, range_to) => {
  try {
    console.log(symbol)
    const url = `${process.env.FYER_ENDPOINT}/getChart`;
    const headers = { "x-api-key": process.env.FYER_API_KEY };
    const params = { symbol, resolution, range_from, range_to };

    const response = await axios.get(url, { headers, params });
    return response.data;
  } catch (err) {
    console.error(
      "FYERS chart fetch error:",
      err.response?.data || err.message
    );
    return { error: "Failed to fetch chart data" };
  }
};


module.exports = { getStockData ,getChartData};
