const axios = require("axios");
require("dotenv").config();

const sttHandler = async (req, res) => {
  try {
    // ✅ Validate file upload
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No audio file uploaded." });
    }

    console.log("🎙️ Received audio file:", req.file.originalname);
    console.log("🎙️ Uploading audio to AssemblyAI:", req.file.originalname);

    // ✅ Step 1: Upload audio to AssemblyAI
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      req.file.buffer,
      {
        headers: {
          Authorization: process.env.ASSEMBLYAI_API_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    const audioUrl = uploadResponse.data.upload_url;
    console.log("✅ Audio uploaded:", audioUrl);

    // ✅ Step 2: Request transcription with advanced features
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: audioUrl,
        speaker_labels: true,
        sentiment_analysis: true,
        entity_detection: true,
      },
      {
        headers: {
          Authorization: process.env.ASSEMBLYAI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const transcriptId = transcriptResponse.data.id;
    console.log("📝 Transcription requested. ID:", transcriptId);

    // ✅ Step 3: Poll until transcription is complete
    let completed = false;
    let transcriptText = "";

    while (!completed) {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            Authorization: process.env.ASSEMBLYAI_API_KEY,
          },
        }
      );

      const status = pollingResponse.data.status;
      console.log("⏳ Transcription status:", status);

      if (status === "completed") {
        completed = true;
        transcriptText = pollingResponse.data.text;
      } else if (status === "error") {
        throw new Error("Transcription failed.");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2 seconds
      }
    }

    console.log("✅ Transcription complete.");

    // ✅ Return full response
    res.json({
      filename: req.file.originalname,
      audioUrl,
      transcript: transcriptText,
    });
  } catch (err) {
    console.error(
      "❌ AssemblyAI STT Error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "STT failed." });
  }
};

module.exports = sttHandler;
