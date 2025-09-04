import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
 // Change if backend runs elsewhere

// ===============================
// 🤖 CHAT & AI SERVICES
// ===============================

// ✅ Send a message to chatbot
export const sendMessage = (message) =>
  axios.post(`${API_BASE}/chat`, { message });

// ✅ Speech-to-Text (Audio Transcription)
export const transcribeAudio = (formData) =>
  axios.post(`${API_BASE}/stt`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ✅ Text-to-Speech
// ✅ Text-to-Speech (gTTS backend)
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
// ✅ AI Image Generation (Frontend)
export const generateImage = async (prompt) => {
  const res = await axios.post(
    `${API_BASE}/image`,
    { prompt },
    { responseType: "arraybuffer" }
  );

  // Browser-safe conversion (no Buffer)
  const base64 = btoa(
    new Uint8Array(res.data)
      .reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  return { url: `data:image/png;base64,${base64}` };
};

// ✅ Save a note
export const saveNote = (note) => axios.post(`${API_BASE}/notes`, { note });

// ✅ Get all notes
export const getNotes = () => axios.get(`${API_BASE}/notes`);

export const exportChatPDF = async (messages) => {
  const res = await axios.post(
    `${API_BASE}/export`,
    { messages },
    { responseType: "blob" }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "chat.pdf";
  a.click();
};

// === Fetch a random Studio Ghibli image ===
export async function fetchGhibliImage() {
  try {
    // Studio Ghibli API (films) → we’ll fetch poster images
    const res = await fetch("https://ghibliapi.vercel.app/films");
    const data = await res.json();

    if (data.length > 0) {
      const randomFilm = data[Math.floor(Math.random() * data.length)];
      return {
        title: randomFilm.title,
        image: randomFilm.image, // poster image
      };
    } else {
      throw new Error("No Ghibli films found.");
    }
  } catch (err) {
    console.error("Ghibli API Error:", err);
    return null;
  }
}

// ✅ Weather API
export const fetchWeather = async (city = "London") => {
  try {
    const res = await axios.get(`${API_BASE}/weather`, {
      params: { city },
    });
    return res.data;
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
};

// ✅ News API
export const fetchNews = async (topic = "general") => {
  try {
    const res = await axios.get(`${API_BASE}/news`, {
      params: { topic },
    });
    return res.data;
  } catch (err) {
    console.error("News fetch error:", err);
    return null;
  }
};



// ===============================
// 📜 HISTORY API (with userId + conversationId)
// ===============================

// ✅ Add message to a conversation
export const addMessageToHistory = (userId, conversationId, sender, text) =>
  axios.post(`${API_BASE}/history`, { userId, conversationId, sender, text });

// ✅ Get all messages for a conversation
export const getConversationHistory = (userId, conversationId) =>
  axios.get(`${API_BASE}/history/${userId}/${conversationId}`);

// ✅ Clear a specific conversation (for a user)
export const clearConversation = (userId, conversationId) =>
  axios.delete(`${API_BASE}/history/${userId}/${conversationId}`);

// ✅ Clear ALL history for a user
export const clearAllHistory = (userId) =>
  axios.delete(`${API_BASE}/history/${userId}`);
