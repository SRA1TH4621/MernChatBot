import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
// Change if backend runs elsewhere

// ===============================
// 🤖 CHAT & AI SERVICES
// ===============================

// ✅ Send a message to chatbot
// ✅ Send a message to chatbot (supports AbortController)
export const sendMessage = (message, signal) =>
  axios.post(`${API_BASE}/chat`, { message }, { signal });
// ✅ Speech-to-Text (Audio Transcription)
export const transcribeAudio = (formData) =>
  axios.post(`${API_BASE}/stt`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Text-to-Speech
export const fetchTTS = async (text, lang = "en") => {
  const res = await axios.post(`${API_BASE}/tts`, { text, lang });
  return res.data; // backend sends the mp3 url
};

// ✅ Vision/Image Analysis
export const analyzeImage = (formData) =>
  axios.post(`${API_BASE}/vision`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ AI Image Generation
export const generateImage = async (prompt) => {
  const res = await axios.post(
    `${API_BASE}/image`,
    { prompt },
    { responseType: "arraybuffer" }
  );

  // Browser-safe conversion (no Buffer)
  const base64 = btoa(
    new Uint8Array(res.data).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  return { url: `data:image/png;base64,${base64}` };
};


// ✅ Weather API
export const fetchWeather = async (city = "London") => {
  try {
    const res = await axios.get(`${API_BASE}/weather`, { params: { city } });
    return res.data;
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
};

// ✅ News API
export const fetchNews = async (topic = "general") => {
  try {
    const res = await axios.get(`${API_BASE}/news`, { params: { topic } });
    return res.data;
  } catch (err) {
    console.error("News fetch error:", err);
    return null;
  }
};
// ✅ Knowledge APIs
export const fetchWiki = (q) =>
  axios.get(`${API_BASE}/knowledge/wiki`, { params: { q } });

export const fetchDefinition = (word) =>
  axios.get(`${API_BASE}/knowledge/define`, { params: { word } });

export const fetchQuote = () =>
  axios.get(`${API_BASE}/knowledge/quote`);

export const fetchJoke = () =>
  axios.get(`${API_BASE}/knowledge/joke`);


export const fetchTrending = (subreddit = "technology") =>
  axios.get(`${API_BASE}/special/trending/${subreddit}`).then((res) => res.data);


export async function fetchRelatedSuggestions(replyText) {
  const res = await fetch("http://localhost:5000/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reply: replyText }),
  });
  return res.json();
}
