const axios = require("axios");
require("dotenv").config();

const visionHandler = async (req, res) => {
  try {
    const { prompt = "" } = req.body;

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: "No image uploaded or buffer missing" });
    }

    const imageBuffer = req.file.buffer;

    // Step 1: Get classification labels from resnet-50
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/resnet-50",
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        timeout: 15000,
      }
    );

    const labels = response.data.map((item) => item.label.toLowerCase());
    const normalizedPrompt = prompt.toLowerCase();

    // Step 2: Match prompt against labels
    const matchedLabels = labels.filter((label) =>
      normalizedPrompt.includes(label)
    );

    res.json({
      prompt,
      labels,
      matchedLabels,
      matchFound: matchedLabels.length > 0,
    });
  } catch (err) {
    console.error("❌ Vision Error:", err.message);
    res.status(500).json({ error: "Image analysis failed." });
  }
};

module.exports = visionHandler;
