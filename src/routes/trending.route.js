const express = require("express");
const router = express.Router();
const Trending = require("../models/Trending.model");

router.get("/", async (req, res) => {
  try {
    const news = await Trending.find({}).sort({ createdAt: -1 });
    res.json({ success: true, news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/add", async (req, res) => {
  const { news } = req.body; // Expecting array [{title, url}]
  if (!news || !Array.isArray(news))
    return res
      .status(400)
      .json({ success: false, message: "news array required" });

  try {
    const insertedNews = [];
    for (const item of news) {
      if (!item.title || typeof item.title !== "string") continue;

      const exists = await Trending.findOne({
        title: { $regex: new RegExp("^" + item.title + "$", "i") },
      });
      if (exists) continue;

      const newNews = new Trending({
        title: item.title.trim(),
        url: item.url && typeof item.url === "string" ? item.url.trim() : "#",
      });
      await newNews.save();
      insertedNews.push(newNews);
    }

    res.json({
      success: true,
      inserted: insertedNews.length,
      news: insertedNews,
      message: insertedNews.length
        ? `Inserted ${insertedNews.length} new items`
        : "No new items inserted (duplicates or empty titles)",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/remove", async (req, res) => {
  const { id } = req.body;
  if (!id)
    return res.status(400).json({ success: false, message: "id required" });

  try {
    const removed = await Trending.findByIdAndDelete(id);
    if (!removed)
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    res.json({ success: true, message: "News removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
