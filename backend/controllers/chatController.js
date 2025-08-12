const axios = require("axios");

const sendMessage = async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_ID}`,
      { inputs: message },
      { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } }
    );

    const botReply =
      response.data?.[0]?.generated_text || "Sorry, I could not process that.";
    res.json({ reply: botReply });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get response from Hugging Face API" });
  }
};

module.exports = { sendMessage };
