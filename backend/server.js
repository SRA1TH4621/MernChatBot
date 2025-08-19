// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Controllers
const sttController = require("./controllers/sttController");
const ttsController = require("./controllers/ttsController");
const visionController = require("./controllers/visionController");
const imageGenRoutes = require("./routes/imageGen");
const historyRoutes = require("./routes/historyRoutes"); // ✅ import added

// Environment Variables
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Validate environment variables
const requiredKeys = [
  "GROQ_API_KEY",
  "ASSEMBLYAI_API_KEY",
  "HF_API_KEY",
  "MONGO_URI",
  "DEEPAI_API_KEY",
];
requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing ${key} in .env`);
  }
});

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/history", historyRoutes); // <-- history routes mounted
app.use("/api", imageGenRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Chat endpoint (Groq)
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "No message provided" });

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply =
      response.data.choices?.[0]?.message?.content || "No response generated.";
    res.json({ response: botReply });
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ response: "Sorry, I am unable to respond right now." });
  }
});

// ✅ STT (Speech to Text)
app.post(
  "/api/stt",
  upload.single("audio"),
  (req, res, next) => {
    console.log("🎙️ Received audio file:", req.file?.originalname);
    next();
  },
  sttController
);

// ✅ TTS (Text to Speech)
app.post("/api/tts", ttsController);
// Serve static files for TTS audio
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Vision (Image Analysis)
app.post(
  "/api/vision",
  upload.single("image"),
  (req, res, next) => {
    console.log("🖼️ Received image file:", req.file?.originalname);
    next();
  },
  visionController
);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
