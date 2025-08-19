const express = require("express");
const router = express.Router();
const { generateImage } = require("../controllers/imageGenController");

router.post("/image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const imageBuffer = await generateImage(prompt);
    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    res.status(500).json({ error: "Image generation failed" });
  }
});

module.exports = router;
