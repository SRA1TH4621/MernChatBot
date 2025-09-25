// backend/controllers/knowledgeController.js
const axios = require("axios");

// 📖 Wikipedia Summary
exports.getWiki = async (req, res) => {
  try {
    const query = req.query.q || "Studio Ghibli";
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query
    )}`;
    const { data } = await axios.get(url);

    res.json({
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page,
    });
  } catch (err) {
    console.error("Wiki Error:", err.message);
    res.status(500).json({ error: "Wikipedia lookup failed" });
  }
};

// 📚 Dictionary Lookup
exports.getDefinition = async (req, res) => {
  try {
    const word = req.query.word || "ethereal";
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const { data } = await axios.get(url);

    const meaning = data[0].meanings[0].definitions[0].definition;
    const synonyms = data[0].meanings[0].synonyms || [];

    res.json({
      word: data[0].word,
      phonetic: data[0].phonetic,
      meaning,
      synonyms,
    });
  } catch (err) {
    console.error("Dictionary Error:", err.message);
    res.status(500).json({ error: "Dictionary lookup failed" });
  }
};

// 💡 Quote of the Day
exports.getQuote = async (req, res) => {
  try {
    const { data } = await axios.get("https://zenquotes.io/api/random");
    res.json({
      quote: data[0].q,
      author: data[0].a,
    });
  } catch (err) {
    console.error("Quote Error:", err.message);
    res.status(500).json({ error: "Quote fetch failed" });
  }
};

// 😂 Joke API
exports.getJoke = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://v2.jokeapi.dev/joke/Programming?type=single"
    );
    res.json({
      joke: data.joke,
    });
  } catch (err) {
    console.error("Joke Error:", err.message);
    res.status(500).json({ error: "Joke fetch failed" });
  }
};
