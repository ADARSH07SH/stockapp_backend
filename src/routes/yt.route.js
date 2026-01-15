const express = require("express");
const xml2js = require("xml2js");
const { exec } = require("child_process");
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
const path = require("path");

const router = express.Router();

const CHANNEL_ID = "UChBT5TlUeG68PKvJSg6MkqQ";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const openai = new OpenAIApi(
  new Configuration({
    apiKey: "YOUR_OPENAI_API_KEY", // Replace with your actual OpenAI API key
  })
);

async function downloadAudio(videoId) {
  const outputPath = path.join(__dirname, `${videoId}.mp3`);
  return new Promise((resolve, reject) => {
    exec(
      `yt-dlp -x --audio-format mp3 -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`,
      (error) => {
        if (error) return reject(error);
        resolve(outputPath);
      }
    );
  });
}

async function transcribeWithWhisper(audioPath) {
  const response = await openai.createTranscription(
    fs.createReadStream(audioPath),
    "whisper-1"
  );
  return response.data.text;
}

router.get("/", async (req, res) => {
  try {
    const rssResponse = await fetch(RSS_URL);
    const xmlData = await rssResponse.text();

    xml2js.parseString(xmlData, async (err, result) => {
      if (err)
        return res.status(500).json({ error: "Failed to parse RSS XML" });

      if (!result.feed.entry || result.feed.entry.length === 0) {
        return res.status(404).json({ error: "No videos found" });
      }

      const latestVideo = result.feed.entry[0];
      const videoId = latestVideo["yt:videoId"][0];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      const transcriptUrl = `https://video.google.com/timedtext?lang=en&v=${videoId}`;
      const transcriptResponse = await fetch(transcriptUrl);
      const transcriptXml = await transcriptResponse.text();

      if (transcriptXml.trim()) {
        xml2js.parseString(transcriptXml, (tErr, transcriptResult) => {
          if (tErr)
            return res
              .status(500)
              .json({ error: "Failed to parse transcript XML" });

          const transcript =
            transcriptResult.transcript.text.map((entry) => ({
              start: entry.$.start,
              duration: entry.$.dur,
              text: entry._,
            })) || [];

          return res.json({
            title: latestVideo.title[0],
            link: videoUrl,
            published: latestVideo.published[0],
            transcript,
          });
        });
      } else {
        // Fallback: Download audio and transcribe
        const audioPath = await downloadAudio(videoId);
        const text = await transcribeWithWhisper(audioPath);

        // Clean up the audio file after transcription
        fs.unlinkSync(audioPath);

        return res.json({
          title: latestVideo.title[0],
          link: videoUrl,
          published: latestVideo.published[0],
          transcript: text,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch video or transcript" });
  }
});

module.exports = router;
