import React, { useState, useEffect, useRef } from "react";
import { sendMessage, analyzeImage, generateImage, fetchTTS } from "./lib/api";
import VoiceControls from "./components/VoiceControls";
import PlusMenu from "./components/PlusMenu";
import HistoryDrawer from "./components/HistoryDrawer";
import "./App.css";

// === ICON IMPORTS ===
import ChatbotIcon from "./icons/chatbot.svg";
import HistoryIcon from "./icons/history.svg";
import ClearIcon from "./icons/clear.svg";
import SendIcon from "./icons/send.svg";
import RetryIcon from "./icons/retry.svg";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const messagesEndRef = useRef(null);

  // Load default greeting
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Hi! I'm Esmeray 1.0 — your AI assistant. How can I help you today?",
      },
    ]);
  }, []);

  // ✅ Handle send message
  const handleSend = async (retryInput = null) => {
    const userInput = retryInput || input.trim();
    if (!userInput) return;

    // ✅ Image generation via command
    if (userInput.startsWith("/img")) {
      const promptText = userInput.replace("/img", "").trim();
      if (!promptText) return;

      const newUserMessage = {
        sender: "user",
        text: `🎨 Generate: ${promptText}`,
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");
      setTyping(true);

      try {
        const res = await generateImage(promptText);
        const newBotMessage = {
          sender: "bot",
          text: "🖼 Image generated:",
          image: res.url, // ✅ FIXED
        };
        setMessages((prev) => [...prev, newBotMessage]);
      } catch (err) {
        console.error("Image Gen Error:", err);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❗ Failed to generate image." },
        ]);
      } finally {
        setTyping(false);
      }
      return;
    }

    // ✅ Normal text chat
    const newUserMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setTyping(true);
    setRetryMessage(null);

    try {
      const res = await sendMessage(userInput);
      const botReply = res.data.response;
      const newBotMessage = { sender: "bot", text: botReply };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (err) {
      console.error("API Error:", err);
      setRetryMessage(userInput);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❗ Failed to get response. Please Retry." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // ✅ Retry failed msg
  const handleRetry = () => {
    if (retryMessage) handleSend(retryMessage);
  };

  // ✅ Clear chat (local only)
  const handleClearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Hi! I'm Esmeray 1.0 — starting fresh! How can I help you today?",
      },
    ]);
    setChatHistory([]);
    setRetryMessage(null);
  };

  // ✅ Clear all history (local only)
  const handleClearHistory = () => {
    setChatHistory([]);
    setMessages([
      {
        sender: "bot",
        text: "👋 Hi! I'm Esmeray 1.0 — your AI assistant. All history cleared, starting fresh!",
      },
    ]);
    setRetryMessage(null);
  };

  // ✅ Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ✅ Voice input
  const handleTranscribed = (text) => {
    console.log("📝 Received transcript:", text);
    setInput(text);
  };

  // ✅ Image Upload
  const handleImageUpload = () => {
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";
    inputFile.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      const newUserMessage = { sender: "user", text: "📷 Uploaded an image" };
      setMessages((prev) => [...prev, newUserMessage]);
      setTyping(true);

      try {
        const res = await analyzeImage(formData);
        const visionText = res.data.matchedLabels?.length
          ? `✅ Found: ${res.data.matchedLabels.join(", ")}`
          : `Labels: ${res.data.labels.join(", ")}`;

        setMessages((prev) => [...prev, { sender: "bot", text: visionText }]);
      } catch (err) {
        console.error("Image Analysis Error:", err);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❗ Failed to analyze image." },
        ]);
      } finally {
        setTyping(false);
      }
    };
    inputFile.click();
  };

  // ✅ Image Generation (via PlusMenu)
  const handleImageGen = async () => {
    const promptText = prompt("Enter image generation prompt:");
    if (!promptText) return;

    const newUserMessage = {
      sender: "user",
      text: `🎨 Generate: ${promptText}`,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setTyping(true);

    try {
      const res = await generateImage(promptText);
      const newBotMessage = {
        sender: "bot",
        text: "🖼 Image generated:",
        image: res.url,
      };
      setMessages((prev) => [...prev, newBotMessage]);
    } catch (err) {
      console.error("Image Gen Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❗ Failed to generate image." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // ✅ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // ✅ History selection
  const handleSelectHistory = (item) => {
    setMessages(
      item.fullChat && item.fullChat.length > 0
        ? item.fullChat
        : [{ sender: "bot", text: "👋 Hi! I'm Esmeray — your AI assistant." }]
    );
    setHistoryOpen(false);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={() => setHistoryOpen(true)}>
          <img src={HistoryIcon} alt="History" width="20" /> History
        </button>
      </div>

      {/* Main Chat */}
      <div className="chat-main">
        <div className="chat-header">
          <h2>
            <img
              src={ChatbotIcon}
              alt="Chatbot"
              width="24"
              style={{ marginRight: "8px" }}
            />
            Esmeray Chatbot
          </h2>
          <small> Esmeray 1.o – AI Assistant</small>
          <button className="clear-btn" onClick={handleClearChat}>
            <img src={ClearIcon} alt="Clear" width="18" /> Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {(messages || []).map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}>
              {msg.sender === "user" ? "🧑 " : "🤖 "}
              {msg.text}

              {/* 🔊 TTS for bot messages */}
              {msg.sender === "bot" && msg.text && (
                <button
                  onClick={async () => {
                    try {
                      const audioUrl = await fetchTTS(msg.text, "en");
                      const audio = new Audio(audioUrl);
                      audio.play();
                    } catch (err) {
                      console.error("TTS Error:", err);
                      alert("❌ Failed to play speech");
                    }
                  }}
                  style={{
                    marginLeft: "8px",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    fontSize: "16px",
                  }}
                >
                  🔊
                </button>
              )}

              {msg.image && (
                <div
                  className="chat-image"
                  onClick={() => setLightboxImage(msg.image)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={msg.image} alt="generated" width="250" />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="chat-bubble bot typing">
              🤖 <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}

          {retryMessage && (
            <div className="retry-container">
              <button onClick={handleRetry}>
                <img src={RetryIcon} alt="Retry" width="18" /> Retry
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={() => handleSend()}>
            <img src={SendIcon} alt="Send" width="18" />
          </button>
          <VoiceControls onTranscribed={handleTranscribed} />
        </div>

        <PlusMenu
          onImageUpload={handleImageUpload}
          onImageGen={handleImageGen}
        />
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={chatHistory}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="lightbox"
          onClick={() => setLightboxImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <img
            src={lightboxImage}
            alt="Full View"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
