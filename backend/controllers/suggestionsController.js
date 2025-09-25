import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateRelatedSuggestions = async (req, res) => {
  try {
    const { reply } = req.body; // ✅ only need reply

    if (!reply) {
      return res.status(400).json({ suggestions: [] });
    }

    const prompt = `
      You are an AI assistant that suggests follow-up questions based on the bot's last reply.
      Reply only with a JSON array of 4-5 concise suggestions. 
      Do not add explanation text, just the array.

      Example:
      ["Show breaking international headlines right now", "Summarize top political developments today"]

      Bot reply: "${reply}"
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ updated model
      messages: [
        {
          role: "system",
          content:
            "Generate 3-5 short related suggestions for continuing the conversation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    // Parse JSON safely
    let suggestions = [];
    try {
      suggestions = JSON.parse(response.choices[0].message.content.trim());
    } catch (err) {
      console.warn("⚠️ Failed to parse suggestions, falling back.");
      suggestions = [
        "Explain in simpler terms",
        "Give me a summary",
        "Show related topics",
      ];
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Groq Suggestion Error:", error);
    res.status(500).json({ suggestions: [] });
  }
};
