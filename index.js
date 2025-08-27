require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const loginRoute = require("./src/routes/login.route");
const signinRoute = require("./src/routes/signin.route");
const userData = require("./src/routes/userData.route");
const stockData = require("./src/routes/stockData.route");
const holdings = require("./src/routes/holdings.route");
const chartData = require("./src/routes/chartData.route");
const changePassword = require('./src/routes/changePassword.route');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB ONCE
connectDB();

app.get("/", (req, res) => {
  res.json("hello from backend!");
});

app.use("/login", loginRoute);
app.use("/signin", signinRoute);
app.use("/userData", userData);
app.use("/stockData", stockData);
app.use("/holdings", holdings);
app.use("/chartData", chartData);
app.use("/changePassword", changePassword);


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
