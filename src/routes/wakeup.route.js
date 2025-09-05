const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    
    res.status(200).json({ success: true, message: "🚀 Server is awake!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "⚠️ Server wakeup failed" });
  }
});

module.exports = router;
