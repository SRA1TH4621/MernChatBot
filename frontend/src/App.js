// App.js - Copilot-style layout
import React, { useState, useEffect, useRef } from "react";
import { sendMessage, generateImage } from "./lib/api";
import VoiceControls from "./components/VoiceControls";
import PlusMenu from "./components/PlusMenu";
import HistoryDrawer from "./components/HistoryDrawer";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsPDF from "jspdf";
import confetti from "canvas-confetti";
import { fetchWeather, fetchNews } from "./lib/api";

import "./App.css";

// === ICONS ===
import HistoryIcon from "./icons/history.svg";
import RetryIcon from "./icons/retry.svg";
import DownloadIcon from "./icons/download.svg";
import SendIcon from "./icons/send.svg";
import ThemeIcon from "./icons/theme.png";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Suggestions

  const inlineSuggestions = [
    "🌦 Get Weather",
    "📰 Latest News",
    "Create an image",
    "Improve writing",
    "Draft a text",
  ];

  // Celebration confetti
  const triggerCelebration = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  // Startup message
  useEffect(() => {
    setMessages([
      { sender: "bot", text: "👋 Hi! I'm Esmeray 2.0 — your AI assistant." },
    ]);
    triggerCelebration();
  }, []);

  // Smooth scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Typewriter effect
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

  // === Send ===
  const handleSend = async (retryInput = null) => {
    const userInput = retryInput || input.trim();
    if (!userInput) return;
    if (!hasStarted) setHasStarted(true);

    setInput(""); // clear instantly like Copilot
    inputRef.current?.blur();

    // /img command
    if (userInput.startsWith("/img")) {
      const promptText = userInput.replace("/img", "").trim();
      if (!promptText) return;
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `🎨 Generate: ${promptText}` },
      ]);
      setTyping(true);
      try {
        const res = await generateImage(promptText);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "🖼 Image generated:", image: res.url },
        ]);
        triggerCelebration();
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

    // Normal chat
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setTyping(true);
    setRetryMessage(null);
    try {
      const res = await sendMessage(userInput);
      typeMessage(res.data.response);
    } catch {
      setRetryMessage(userInput);
      typeMessage("❗ Failed to get response. Please Retry.");
    }
  };

  const handleRetry = () => retryMessage && handleSend(retryMessage);

  // === PlusMenu Handlers ===
  const handleImageUpload = (file) => {
    const url = URL.createObjectURL(file);
    setHasStarted(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "📤 Uploaded an image:", image: url },
    ]);
  };

  const handleImageGen = async (prompt) => {
    if (!prompt) return;
    setHasStarted(true);

    // Add user bubble
    setMessages((prev) => [...prev, { sender: "user", text: `🎨 ${prompt}` }]);
    setTyping(true);

    try {
      const res = await generateImage(prompt);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "🖼 Image generated:", image: res.url },
      ]);
      triggerCelebration();
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❗ Failed to generate image." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleGifGen = (gifList) => {
    setHasStarted(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "🔎 Searching GIFs..." },
      { sender: "bot", text: "Here are some GIFs:", gifs: gifList },
    ]);
  };

  const handleGhibliGen = (res) => {
    setHasStarted(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "🎬 Show me a Ghibli image" },
      { sender: "bot", text: `🌸 From: ${res.title}`, image: res.image },
    ]);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    messages.forEach((msg) => {
      const sender = msg.sender === "user" ? "🧑 You:" : "🤖 Bot:";
      doc.text(`${sender} ${msg.text || ""}`, 10, y);
      y += 10;
      if (msg.image) {
        try {
          doc.addImage(msg.image, "PNG", 10, y, 80, 60);
          y += 70;
        } catch {}
      }
    });
    doc.save("chat-history.pdf");
  };

  // Export TXT
  const handleExportTXT = () => {
    const text = messages
      .map(
        (msg) =>
          `${msg.sender === "user" ? "🧑 You:" : "🤖 Bot:"} ${msg.text || ""}`
      )
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  // 🌦 Weather Handler
  const handleWeather = async () => {
    const city = window.prompt("Enter a city for weather:");
    if (!city) return; // cancel if user presses "Cancel"

    setHasStarted(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `🌦 Get Weather for ${city}` },
    ]);
    setTyping(true);

    try {
      const res = await fetchWeather(city);
      if (res && res.location) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            weather: {
              city: res.location,
              country: res.country,
              temp_c: res.temperature_c,
              condition: res.condition,
              icon: res.icon,
              feelslike_c: res.feelslike_c,
              humidity: res.humidity,
              wind_kph: res.wind_kph,
            },
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❌ Weather not found." },
        ]);
      }
    } catch (err) {
      console.error("Weather Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error fetching weather." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // 📰 News Handler
  const handleNews = async (topic = "technology") => {
    setHasStarted(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📰 Latest News on ${topic}` },
    ]);
    setTyping(true);

    try {
      const res = await fetchNews(topic);
      if (res?.articles?.length) {
        const topArticles = res.articles.slice(0, 10); // show 10 articles

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            news: topArticles.map((a) => ({
              title: a.title,
              url: a.url,
              image: a.urlToImage,
              source: a.source?.name,
            })),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❌ No news found." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error fetching news." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="copilot-container">
      {/* Cosmic Background */}
      <div className="cosmic-bg">
        
        <div className="stars"></div> {/* global stars */}
        <div className="moon-wrapper">
          <div className="moon"></div>
          <div className="moon-stars"></div> {/* halo stars */}
        </div>
      </div>

      {/* Sidebar button – only show if history is closed */}
      {!historyOpen && (
        <div className="sidebar-btn">
          <button onClick={() => setHistoryOpen(true)} title="History">
            <img src={HistoryIcon} alt="History" width="24" />
          </button>
          <button onClick={toggleTheme} title="Toggle Theme">
            <img src={ThemeIcon} alt="Theme" width="22" />
          </button>
        </div>
      )}

      {/* === Welcome State === */}
      {!hasStarted ? (
        <div className="welcome-screen">
          <div className="stars"></div> {/* twinkling stars */}
          <div className="moon"></div> {/* main glowing moon */}
          <h2>Hi User, what should we dive into today?</h2>
          <div
            className="chat-input"
            style={{ maxWidth: "700px", width: "100%" }}
          >
            <PlusMenu
              onImageUpload={handleImageUpload}
              onImageGen={handleImageGen}
              onGifGen={handleGifGen}
              onGhibliGen={handleGhibliGen}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Copilot..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend}>
              <img src={SendIcon} alt="Send" width="18" />
            </button>
            <VoiceControls onTranscribed={(text) => setInput(text)} />
          </div>
          {/* Suggestions */}
          <div className="suggestions">
            {inlineSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  if (s === "Create an image") {
                    const prompt = window.prompt(
                      "Enter a prompt for image generation:"
                    );
                    if (prompt) handleImageGen(prompt);
                  } else if (s === "🌦 Get Weather") {
                    handleWeather(); // ✅ now works
                  } else if (s === "📰 Latest News") {
                    handleNews(); // ✅ now works
                  } else {
                    handleSend(s);
                  }
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
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
                {msg.image && (
                  <div className="chat-image">
                    <img src={msg.image} alt="generated" width="250" />
                    <a href={msg.image} download="generated.png">
                      <img src={DownloadIcon} alt="Download" width="18" />
                    </a>
                  </div>
                )}
                {msg.icon && (
                  <div className="chat-weather">
                    <img
                      src={msg.icon}
                      alt="weather icon"
                      width="48"
                      height="48"
                    />
                  </div>
                )}
                {msg.weather && (
                  <div className="glass-card weather-card">
                    {msg.weather.icon && (
                      <img
                        src={msg.weather.icon}
                        alt="weather"
                        className="weather-icon"
                      />
                    )}
                    <div className="weather-info">
                      <h4>
                        {msg.weather.city}, {msg.weather.country}
                      </h4>
                      <p>
                        🌡 {msg.weather.temp_c}°C (Feels like{" "}
                        {msg.weather.feelslike_c}°C)
                      </p>
                      <p>☁ {msg.weather.condition}</p>
                      <p>💧 Humidity: {msg.weather.humidity}%</p>
                      <p>💨 Wind: {msg.weather.wind_kph} kph</p>
                    </div>
                  </div>
                )}

                {msg.news && (
                  <div className="chat-news">
                    {msg.news.map((article, i) => (
                      <div key={i} className="glass-card news-card">
                        {article.image && (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="news-image"
                          />
                        )}
                        <div className="news-content">
                          <h4>{article.title}</h4>
                          <p>{article.source || "Unknown Source"}</p>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🔗 Read More
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.gifs && (
                  <div className="chat-gifs">
                    {msg.gifs.map((gif, j) => (
                      <img key={j} src={gif} alt="gif" width="120" />
                    ))}
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

          {/* Input at bottom */}
          <div className="chat-input">
            <PlusMenu
              onImageUpload={handleImageUpload}
              onImageGen={handleImageGen}
              onGifGen={handleGifGen}
              onGhibliGen={handleGhibliGen}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Copilot..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend}>
              <img src={SendIcon} alt="Send" width="18" />
            </button>
            <VoiceControls onTranscribed={(text) => setInput(text)} />
          </div>

          {/* Suggestions */}
          {/* Suggestions */}
          {!hasStarted && !input && !typing && (
            <div className="suggestions">
              {inlineSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (s === "Create an image") {
                      // 🖼 Directly open image generation flow
                      const prompt = window.prompt(
                        "Enter a prompt for image generation:"
                      );
                      if (prompt) handleImageGen(prompt);
                    } else {
                      handleSend(s);
                    }
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* History Drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={chatHistory}
        onSelectHistory={(item) => setMessages(item.fullChat || [])}
        onClearHistory={() => setChatHistory([])}
      />

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
