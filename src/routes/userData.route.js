const express = require("express");
const User = require("../models/user.model");

const router = express.Router();

router.get("/", async (req, res) => {
  const username = req.query.username;
  console.log(username)
  const userData = await User.findOne({ username: username });
  
  res.status(200).send(userData);
});

router.post("/", async (req, res) => {
  const { username, field, value } = req.query;
  const edited=await User.updateOne({ username: username }, { $set: { [field]: value } });
  console.log(edited);
  res.status(200).send(message="edited");
})
module.exports = router;
