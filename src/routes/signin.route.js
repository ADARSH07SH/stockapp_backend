const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const userNameGenerator = require("../utils/usernameGenerator");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await userNameGenerator(); 

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      fullName,
      about:"I love investing"
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      user: {
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
