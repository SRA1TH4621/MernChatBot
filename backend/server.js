const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/api/chat", async (req, res) => {
  console.log("Incoming Request Body:", req.body);

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "No message provided" });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile", // or "llama3-70b-8192"
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
