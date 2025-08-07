const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const loginRoute = require("./src/routes/login.route");
const signinRoute = require("./src/routes/signin.route");
const userData = require("./src/routes/userData.route");
const stockData = require('./src/routes/StockData.route');
const holdings = require("./src/routes/holdings.route");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.json("hello from backend!");
});

app.use("/login", loginRoute);
app.use("/signin", signinRoute);
app.use("/userData", userData);
app.use("/stockData", stockData);
app.use("/holdings", holdings);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
