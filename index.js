require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");

const loginRoute = require("./src/routes/login.route");
const signinRoute = require("./src/routes/signin.route");
const userData = require("./src/routes/userData.route");
const stockData = require("./src/routes/stockData.route");
const holdings = require("./src/routes/holdings.route");
const chartData = require("./src/routes/chartData.route");
const changePassword = require("./src/routes/changePassword.route");
const wakeupRoute = require("./src/routes/wakeup.route");
const trendingRoute = require("./src/routes/trending.route");
const mlRoutes =require("./src/routes/ml.route")
const ytRoutes=require("./src/routes/yt.route")
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


connectDB();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

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
app.use("/wakeupserver", wakeupRoute);
app.use("/trending", trendingRoute);
app.use("/ml", mlRoutes);
app.use("/yt", ytRoutes);


app.get("/admin/:password", (req, res) => {
  const { password } = req.params;
  if (password === process.env.ADMINPASS) {
    res.render("admin", { title: "Admin Panel" });
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
