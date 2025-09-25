// App.js - Copilot-style layout
import React, { useState, useEffect, useRef } from "react";

import {
  sendMessage,
  generateImage,
  fetchWeather,
  fetchNews,
  fetchWiki,
  fetchDefinition,
  fetchQuote,
  fetchJoke,
} from "./lib/api";

import VoiceControls from "./components/VoiceControls";
import PlusMenu from "./components/PlusMenu";
import HistoryDrawer from "./components/HistoryDrawer";
import KnowledgeMenu from "./components/KnowledgeMenu";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import confetti from "canvas-confetti";

import "./App.css";

// === ICONS ===
import HistoryIcon from "./icons/history.svg";
import RetryIcon from "./icons/retry.svg";
import DownloadIcon from "./icons/download.svg";
import SendIcon from "./icons/send.svg";
import ThemeIcon from "./icons/theme.svg";
import StopIcon from "./icons/stop.svg";
import ThumbsUpIcon from "./icons/thumbs-up.svg";
import ThumbsDownIcon from "./icons/thumbs-down.svg";
import CopyIcon from "./icons/copy.svg";
import RefreshIcon from "./icons/refresh.svg";


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [toast] = useState(null);
  const [theme, setTheme] = useState("light");
  const [autoScroll, setAutoScroll] = useState(true);
  const [relatedSuggestions, setRelatedSuggestions] = useState({});
  const [showSuggestionsTab, setShowSuggestionsTab] = useState(false);



  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  const intervalRef = useRef(null); // 🔑 for typewriter effect

  // Suggestions
  const inlineSuggestions = [
    "☁️ Get Weather",
    "📰 Latest News",
    "📷 Create an image",
    "📖 Ask Wikipedia",
    "📚 Define a Word",
    "💡 Motivational Quote",
    "😂 Tell me a Joke",
    "📈 Check Stock Price",
    "🔥 Reddit Trending",
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
      {
        sender: "bot",
        text: "👋 Hi! I'm Esmeray vs Eclipse — Your AI assistant.",
      },
    ]);
    triggerCelebration();
  }, []);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, autoScroll]);


  // Stop current bot response
  const handleStop = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTyping(false);
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length && updated[updated.length - 1].typingText) {
        updated[updated.length - 1].typingText = false;
      }
      return updated;
    });
  };
  // Show full reply instantly
  const typeMessage = (text) => {
    setTyping(false);
    setMessages((prev) => [...prev, { sender: "bot", text }]);
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
    if (userInput === "/wiki") {
      const q = prompt("Enter topic for Wikipedia:");
      const res = await fetchWiki(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `📖 ${res.data.title}\n\n${res.data.extract}\n🔗 ${res.data.url}`,
        },
      ]);
      return;
    }

    if (userInput === "/define") {
      const word = prompt("Enter word to define:");
      const res = await fetchDefinition(word);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `📚 **${res.data.word}** (${res.data.phonetic})\n\n${
            res.data.meaning
          }\nSynonyms: ${res.data.synonyms.join(", ")}`,
        },
      ]);
      return;
    }

    if (userInput === "/quote") {
      const res = await fetchQuote();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `💡 "${res.data.quote}" — *${res.data.author}*`,
        },
      ]);
      return;
    }

    if (userInput === "/joke") {
      const res = await fetchJoke();
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `😂 ${res.data.joke}` },
      ]);
      return;
    }

    // Normal chat
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setTyping(true);
    setRetryMessage(null);
    controllerRef.current = new AbortController();

   try {
     const res = await sendMessage(userInput, controllerRef.current.signal);

     // 1. Add bot reply
     typeMessage(res.data.response);

     // 2. Fetch related suggestions
     const sugRes = await fetch("/api/suggestions", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ input: userInput, reply: res.data.response }),
     });
     const sugData = await sugRes.json();

     // 3. Store in state + open suggestions tab
     setRelatedSuggestions({
       list: sugData.suggestions || [],
       forMessage: res.data.response,
     });
     setShowSuggestionsTab(false);
     setTimeout(() => setShowSuggestionsTab(true), 50);
   } catch (err) {
     if (err.name === "CanceledError") {
       console.log("❌ Request aborted by user");
     } else {
       setRetryMessage(userInput);
       typeMessage("❗ Failed to get response. Please Retry.");
     }
   } finally {
     controllerRef.current = null;
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

  // 🌦 Weather Handler
  const handleWeather = async () => {
    const city = window.prompt("Enter a city for weather:");
    if (!city) return;
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
        const topArticles = res.articles.slice(0, 10);
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
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    setAutoScroll(bottom);
  };

  return (
    <div className="copilot-container">
      {/* Cosmic Background */}
      <div className="cosmic-bg">
        <div className="stars"></div>
        <div className="moon-wrapper">
          <div className="moon"></div>
          <div className="moon-stars"></div>
        </div>
      </div>

      {/* Sidebar button */}
      {!historyOpen && (
        <div className="sidebar-btn">
          <button onClick={() => setHistoryOpen(true)} title="History">
            <img
              src={HistoryIcon}
              alt="History"
              width="24"
              className="icon-img"
            />
          </button>
          <button onClick={toggleTheme} title="Toggle Theme">
            <img src={ThemeIcon} alt="Theme" width="22" className="icon-img" />
          </button>
        </div>
      )}

      {/* === Welcome State === */}
      {!hasStarted ? (
        <div className="welcome-screen">
          <h1 className="moon-title-behind">
            {theme === "dark" ? "Esmeray" : "Eclipse"}
          </h1>
          <div className="stars"></div>
          <div className="moon-scene"></div>

          <div
            className="chat-input"
            style={{ maxWidth: "700px", width: "100%" }}
          >
            <PlusMenu
              onImageUpload={handleImageUpload}
              onImageGen={handleImageGen}
              onGifGen={handleGifGen}
            />
            <KnowledgeMenu
              onWiki={() => handleSend("/wiki")}
              onDictionary={() => handleSend("/define")}
              onQuote={() => handleSend("/quote")}
              onJoke={() => handleSend("/joke")}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Esmeray vs. Eclipse anything..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={() => {
                if (typing) {
                  handleStop();
                } else if (input.trim()) {
                  handleSend();
                  setHasStarted(true);
                }
              }}
            >
              <img
                src={typing ? StopIcon : SendIcon}
                alt={typing ? "Stop" : "Send"}
                width="18"
              />
            </button>
            <VoiceControls onTranscribed={(text) => setInput(text)} />
          </div>

          <div className="suggestions">
            {inlineSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  if (s === "📷 Create an image") {
                    const prompt = window.prompt(
                      "Enter a prompt for image generation:"
                    );
                    if (prompt) {
                      handleImageGen(prompt);
                      setHasStarted(true);
                    }
                  } else if (s === "☁️ Get Weather") {
                    handleWeather();
                    setHasStarted(true);
                  } else if (s === "📰 Latest News") {
                    handleNews();
                    setHasStarted(true);
                  } else if (s === "📖 Ask Wikipedia") {
                    handleSend("/wiki");
                    setHasStarted(true);
                  } else if (s === "📚 Define a Word") {
                    handleSend("/define");
                    setHasStarted(true);
                  } else if (s === "💡 Motivational Quote") {
                    handleSend("/quote");
                    setHasStarted(true);
                  } else if (s === "😂 Tell me a Joke") {
                    handleSend("/joke");
                    setHasStarted(true);
                  } else {
                    handleSend(s);
                    setHasStarted(true);
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
          <div className="chat-messages" onScroll={handleScroll}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                {/* === Markdown text === */}
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

                {/* === Message Reactions (only for bot replies) === */}
                {msg.sender === "bot" && (
                  <div className="message-actions">
                    {/* Like */}
                    <button
                      className={`action-btn ${msg.liked ? "active" : ""}`}
                      onClick={() => {
                        setMessages((prev) =>
                          prev.map((m, idx) =>
                            idx === i
                              ? { ...m, liked: !m.liked, disliked: false }
                              : m
                          )
                        );
                      }}
                      title="Like"
                    >
                      <img
                        src={ThumbsUpIcon}
                        alt="Like"
                        width="16"
                        className="icon-img"
                      />
                    </button>

                    {/* Dislike */}
                    <button
                      className={`action-btn ${msg.disliked ? "active" : ""}`}
                      onClick={() => {
                        setMessages((prev) =>
                          prev.map((m, idx) =>
                            idx === i
                              ? { ...m, disliked: !m.disliked, liked: false }
                              : m
                          )
                        );
                      }}
                      title="Dislike"
                    >
                      <img
                        src={ThumbsDownIcon}
                        alt="Dislike"
                        width="16"
                        className="icon-img"
                      />
                    </button>

                    {/* Copy */}
                    <button
                      className={`action-btn ${msg.copied ? "active" : ""}`}
                      onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                        setMessages((prev) =>
                          prev.map((m, idx) =>
                            idx === i ? { ...m, copied: true } : m
                          )
                        );
                        setTimeout(() => {
                          setMessages((prev) =>
                            prev.map((m, idx) =>
                              idx === i ? { ...m, copied: false } : m
                            )
                          );
                        }, 1500); // reset after 1.5s
                      }}
                      title={msg.copied ? "Copied!" : "Copy"}
                    >
                      <img
                        src={CopyIcon}
                        alt="Copy"
                        width="16"
                        className="icon-img"
                      />
                    </button>

                    {/* Regenerate */}
                    <button
                      className="action-btn"
                      onClick={() => {
                        if (messages[i - 1]?.sender === "user") {
                          handleSend(messages[i - 1].text);
                        }
                      }}
                      title="Regenerate"
                    >
                      <img
                        src={RefreshIcon}
                        alt="Regenerate"
                        width="16"
                        className="icon-img"
                      />
                    </button>
                  </div>
                )}

                {/* === Images === */}
                {msg.image && (
                  <div className="chat-image">
                    <img
                      src={msg.image}
                      alt="generated"
                      width="250"
                      className="icon-img"
                    />
                    <a href={msg.image} download="generated.png">
                      <img
                        src={DownloadIcon}
                        alt="Download"
                        width="18"
                        className="icon-img"
                      />
                    </a>
                  </div>
                )}

                {/* === Weather card === */}
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

                {/* === News cards === */}
                {msg.news && (
                  <div className="chat-news">
                    {msg.news.map((article, j) => (
                      <div key={j} className="glass-card news-card">
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

                {/* === GIFs === */}
                {msg.gifs && (
                  <div className="chat-gifs">
                    {msg.gifs.map((gif, j) => (
                      <img key={j} src={gif} alt="gif" width="120" />
                    ))}
                  </div>
                )}

                {/* === Related Suggestions (only for last bot message) === */}
                {msg.sender === "bot" &&
                  i === messages.length - 1 &&
                  showSuggestionsTab &&
                  relatedSuggestions.list?.length > 0 && (
                    <div className="related-tab">
                      <h4>🔎 Related Suggestions</h4>
                      <div className="suggestion-buttons">
                        {relatedSuggestions.list.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleSend(s);
                              setShowSuggestionsTab(false);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <button
                        className="close-tab"
                        onClick={() => setShowSuggestionsTab(false)}
                      >
                        ✖ Close
                      </button>
                    </div>
                  )}
              </div>
            ))}

            {/* === Typing indicator === */}
            {typing && (
              <div className="chat-bubble bot typing">
                🤖 <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}

            {/* === Retry button === */}
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
            />
            {/* NEW KnowledgeMenu */}
            <KnowledgeMenu
              onWiki={() => handleSend("/wiki")}
              onDictionary={() => handleSend("/define")}
              onQuote={() => handleSend("/quote")}
              onJoke={() => handleSend("/joke")}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Esmeray vs. Eclipse anything..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={() => {
                if (typing) {
                  handleStop();
                } else if (input.trim()) {
                  handleSend();
                  setHasStarted(true);
                }
              }}
            >
              <img
                src={typing ? StopIcon : SendIcon}
                alt={typing ? "Stop" : "Send"}
                width="18"
              />
            </button>
            <VoiceControls onTranscribed={(text) => setInput(text)} />
          </div>
        </>
      )}

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={chatHistory}
        onSelectHistory={(item) => setMessages(item.fullChat || [])}
        onClearHistory={() => setChatHistory([])}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
