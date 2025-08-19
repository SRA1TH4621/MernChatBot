const axios = require("axios");
const fs = require("fs");
const path = require("path");

const generateImage = async (prompt) => {
  try {
    // 🌸 2. Fallback to Pollinations
    const pollRes = await axios.get(
      "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt),
      {
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(pollRes.data);
  } catch (err) {
    console.error("❌ All image generation failed:", err.message);
    throw err;
  }
};

module.exports = { generateImage };
