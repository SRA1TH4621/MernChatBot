import React, { useState, useEffect, useRef } from "react";
import { sendMessage, generateImage, fetchTTS } from "./lib/api";
import VoiceControls from "./components/VoiceControls";
import PlusMenu from "./components/PlusMenu";
import HistoryDrawer from "./components/HistoryDrawer";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsPDF from "jspdf"; // ✅ For PDF Export

import "./App.css";

// === ICON IMPORTS ===
import ChatbotIcon from "./icons/chatbot.svg";
import HistoryIcon from "./icons/history.svg";
import ClearIcon from "./icons/clear.svg";
import SendIcon from "./icons/send.svg";
import RetryIcon from "./icons/retry.svg";
import CopyIcon from "./icons/copy.svg";
import SoundIcon from "./icons/sound.svg";
import DownloadIcon from "./icons/download.svg";
import PdfIcon from "./icons/pdf.svg";
import TxtIcon from "./icons/txt.svg";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(16);
  const messagesEndRef = useRef(null);
  const [toast, setToast] = useState(null);

  const fonts = [
    "Arial, sans-serif",
    "Verdana, sans-serif",
    "Tahoma, sans-serif",
    "'Courier New', monospace",
    "'Trebuchet MS', sans-serif",
    "'Comic Sans MS', cursive",
    "'Lucida Console', monospace",
    "'Georgia', serif",
    "'Times New Roman', serif",
    "'Garamond', serif",
    "'Palatino Linotype', serif",
    "'Brush Script MT', cursive",
    "'Segoe UI', sans-serif",
    "'Roboto', sans-serif",
    "'Poppins', sans-serif",
    "'Montserrat', sans-serif",
    "'Raleway', sans-serif",
    "'Merriweather', serif",
    "'Playfair Display', serif",
    "'Dancing Script', cursive",
    "'Indie Flower', cursive",
    "'Pacifico', cursive",
    "'Orbitron', sans-serif",
    "'Press Start 2P', cursive",
  ];

  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Hi! I'm Esmeray 2.0 — your AI assistant. How can I help you today?",
      },
    ]);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "dark" : "lightpink");
    const handleChange = (e) => setTheme(e.matches ? "dark" : "lightpink");
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const typeMessage = (text) => {
    let i = 0;
    setTyping(true);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "", typingText: true },
    ]);
    const interval = setInterval(() => {
      i++;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = text.slice(0, i);
        return updated;
      });
      if (i === text.length) {
        clearInterval(interval);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].typingText = false;
          return updated;
        });
        setTyping(false);
      }
    }, 25);
  };

  const handleSend = async (retryInput = null) => {
    const userInput = retryInput || input.trim();
    if (!userInput) return;

    // === Handle /img command ===
    if (userInput.startsWith("/img")) {
      const promptText = userInput.replace("/img", "").trim();
      if (!promptText) return;
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `🎨 Generate: ${promptText}` },
      ]);
      setInput("");
      setTyping(true);

      try {
        const res = await generateImage(promptText);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "🖼 Image generated:", image: res.url },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❗ Failed to generate image." },
        ]);
      } finally {
        setTyping(false);
      }
      return;
    }

    // === Normal Chat Flow ===
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setInput("");
    setTyping(true);
    setRetryMessage(null);

    try {
      const res = await sendMessage(userInput);

      // === Handle /gif command ===
      if (res.data.response.startsWith("/gif")) {
        const query = res.data.response.replace("/gif", "").trim();
        try {
          const gifRes = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=YOUR_GIPHY_API_KEY&q=${query}&limit=5`
          );
          const gifData = await gifRes.json();
          const gifList = gifData.data.map(
            (g) => g.images?.downsized_medium?.url
          );
          setMessages((prev) => [
            ...prev,
            { sender: "bot", type: "gif-selection", gifs: gifList },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "❗ Failed to fetch GIFs." },
          ]);
        } finally {
          setTyping(false);
        }
      } else {
        typeMessage(res.data.response);
      }
    } catch {
      setRetryMessage(userInput);
      typeMessage("❗ Failed to get response. Please Retry.");
    }
  };

  const handleRetry = () => retryMessage && handleSend(retryMessage);

  const handleClearChat = () => {
    setMessages([
      { sender: "bot", text: "👋 Hi! I'm Esmeray 2.0 — starting fresh!" },
    ]);
    setChatHistory([]);
    setRetryMessage(null);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setMessages([
      { sender: "bot", text: "👋 Hi! I'm Esmeray 2.0 — all history cleared." },
    ]);
    setRetryMessage(null);
  };

  const handleTranscribed = (text) => setInput(text);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSelectHistory = (item) => {
    setMessages(
      item.fullChat?.length > 0
        ? item.fullChat
        : [{ sender: "bot", text: "👋 Hi! I'm Esmeray — ready again!" }]
    );
    setHistoryOpen(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "lightpink" : "dark"));
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    document.body.style.fontFamily = randomFont;
    setToast(
      `Theme: ${
        theme === "dark" ? "🌸 Pink Gradient" : "🌌 Dark Gradient"
      } | Font: ${randomFont.replace(/['"]+/g, "")}`
    );
    setTimeout(() => setToast(null), 2000);
  };

  const increaseFont = () => setFontSize((s) => Math.min(s + 2, 28));
  const decreaseFont = () => setFontSize((s) => Math.max(s - 2, 12));

  // === Export Chat as PDF ===
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 10;

      messages.forEach((msg) => {
        const sender = msg.sender === "user" ? "🧑 You:" : "🤖 Bot:";
        doc.text(`${sender} ${msg.text || ""}`, 10, y);
        y += 10;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });

      doc.save("chat-history.pdf");
    } catch (err) {
      alert("❌ PDF export failed. Try TXT export instead.");
    }
  };

  // === Export Chat as TXT ===
  const handleExportTXT = () => {
    const text = messages
      .map((msg) => {
        const sender = msg.sender === "user" ? "🧑 You:" : "🤖 Bot:";
        return `${sender} ${msg.text || ""}`;
      })
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`chat-container theme-${theme}`}>
      <div className="sidebar">
        <button onClick={() => setHistoryOpen(true)} title="History">
          <img src={HistoryIcon} alt="History" width="22" />
        </button>

        <button onClick={handleExportPDF} title="Export PDF">
          <img src={PdfIcon} alt="Export PDF" width="22" />
        </button>

        <button onClick={handleExportTXT} title="Export TXT">
          <img src={TxtIcon} alt="Export TXT" width="22" />
        </button>
      </div>

      {/* === MAIN CHAT === */}
      <div className="chat-main">
        <div className="chat-header">
          <h2>
            <img src={ChatbotIcon} alt="Chatbot" width="24" /> Esmeray Chatbot
          </h2>
          <small> Esmeray 2.0 – AI Assistant</small>
          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme}>
              🎨 Theme
            </button>
            <button className="theme-btn" onClick={decreaseFont}>
              A-
            </button>
            <button className="theme-btn" onClick={increaseFont}>
              A+
            </button>
            <button className="clear-btn" onClick={handleClearChat}>
              <img src={ClearIcon} alt="Clear" width="18" /> Clear Chat
            </button>
          </div>
        </div>

        {/* === CHAT MESSAGES === */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${msg.sender} ${
                msg.typingText ? "typing-text" : ""
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {/* === Normal text === */}
              {msg.type !== "gif-selection" && (
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}

              {/* === Bot actions (sound / copy) === */}
              {msg.sender === "bot" &&
                msg.text &&
                msg.type !== "gif-selection" && (
                  <div className="message-actions">
                    <button
                      className="icon-btn"
                      title="Play Sound"
                      onClick={async () => {
                        try {
                          const audioUrl = await fetchTTS(msg.text, "en");
                          new Audio(audioUrl).play();
                        } catch {
                          alert("❌ Failed to play speech");
                        }
                      }}
                    >
                      <img src={SoundIcon} alt="Sound" width="18" />
                    </button>
                    <button
                      className="icon-btn"
                      title="Copy to Clipboard"
                      onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                        setToast("✅ Copied!");
                        setTimeout(() => setToast(null), 1500);
                      }}
                    >
                      <img src={CopyIcon} alt="Copy" width="18" />
                    </button>
                  </div>
                )}

              {/* === Single Image/GIF === */}
              {msg.image && (
                <div className="chat-image-wrapper">
                  <div
                    className="chat-image"
                    onClick={() => setLightboxImage(msg.image)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={msg.image} alt="generated" width="250" />
                  </div>
                  <div className="message-actions">
                    <button
                      className="icon-btn"
                      title="Copy Image URL"
                      onClick={() => {
                        navigator.clipboard.writeText(msg.image);
                        setToast("✅ Image URL copied!");
                        setTimeout(() => setToast(null), 1500);
                      }}
                    >
                      <img src={CopyIcon} alt="Copy" width="18" />
                    </button>
                    <a
                      href={msg.image}
                      download="generated-image.png"
                      className="icon-btn"
                      title="Download Image"
                    >
                      <img src={DownloadIcon} alt="Download" width="18" />
                    </a>
                  </div>
                </div>
              )}

              {/* === GIF Selection Row === */}
              {msg.type === "gif-selection" && (
                <div className="gif-selection">
                  {msg.gifs.map((gif, idx) => (
                    <img
                      key={idx}
                      src={gif}
                      alt="gif-option"
                      style={{ cursor: "pointer" }}
                      onClick={async () => {
                        // 1. Replace selection with chosen GIF
                        setMessages((prev) => [
                          ...prev.filter((m) => m.type !== "gif-selection"),
                          { sender: "user", type: "gif", image: gif },
                        ]);

                        // 2. Fetch & download directly
                        try {
                          const res = await fetch(gif);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);

                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `giphy-${idx + 1}.gif`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);

                          URL.revokeObjectURL(url);

                          setToast("💾 GIF downloaded!");
                          setTimeout(() => setToast(null), 1500);
                        } catch (err) {
                          console.error("GIF Download Failed:", err);
                          setToast("❌ Failed to download GIF");
                          setTimeout(() => setToast(null), 1500);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div
              className="chat-bubble bot typing"
              style={{ fontSize: `${fontSize}px` }}
            >
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

        {/* === CHAT INPUT === */}
        <div className="chat-input">
          <PlusMenu
            onImageUpload={() => {
              const inputEl = document.createElement("input");
              inputEl.type = "file";
              inputEl.accept = "image/*";
              inputEl.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "user",
                      text: "📤 Uploaded an image:",
                      image: reader.result,
                    },
                  ]);
                };
                reader.readAsDataURL(file);
              };
              inputEl.click();
            }}
            onImageGen={() => {
              const promptText = prompt("Enter a prompt to generate an image:");
              if (!promptText) return;
              setMessages((prev) => [
                ...prev,
                { sender: "user", text: `🎨 Generate: ${promptText}` },
              ]);
              setTyping(true);
              generateImage(promptText)
                .then((res) =>
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "bot",
                      text: "🖼 Image generated:",
                      image: res.url,
                    },
                  ])
                )
                .catch(() =>
                  setMessages((prev) => [
                    ...prev,
                    { sender: "bot", text: "❗ Failed to generate image." },
                  ])
                )
                .finally(() => setTyping(false));
            }}
            onGifGen={(gifList) => {
              setMessages((prev) => [
                ...prev,
                { sender: "bot", type: "gif-selection", gifs: gifList },
              ]);
            }}
            onGhibliGen={(res) => {
              setMessages((prev) => [
                ...prev,
                {
                  sender: "bot",
                  text: `🌸 Studio Ghibli: ${res.title}`,
                  image: res.image,
                },
              ]);
            }}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{ fontSize: `${fontSize}px` }}
          />
          <button onClick={() => handleSend()}>
            <img src={SendIcon} alt="Send" width="18" />
          </button>
          <VoiceControls onTranscribed={handleTranscribed} />
        </div>

        <HistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          history={chatHistory}
          onSelectHistory={handleSelectHistory}
          onClearHistory={handleClearHistory}
        />

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
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
              }}
            />
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

export default App;
