const gTTS = require("gtts");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const ttsHandler = async (req, res) => {
  try {
    const { text, lang = "en" } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const filename = `tts-${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, "../uploads", filename);
    const speech = new gTTS(text, lang);

    speech.save(filePath, function (err) {
      if (err) {
        console.error("TTS Error:", err);
        return res.status(500).json({ error: "TTS failed" });
      }
      const audioUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${filename}`;
      res.json({ audioUrl });
    });
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: "TTS failed." });
  }
};

module.exports = ttsHandler;
