import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // ✅ Show welcome message on load
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Hi! I'm your chatbot. How can I help you today?",
      },
    ]);
  }, []);

  const handleSend = async (retryInput = null) => {
    const userInput = retryInput || input.trim();
    if (!userInput) return;

    const newUserMessage = { sender: "user", text: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);
    setRetryMessage(null);

    try {
      const response = await axios.post(
        "https://mernchatbot-seje.onrender.com/api/chat", // ✅ Your Render backend
        { message: userInput },
        { headers: { "Content-Type": "application/json" } }
      );

      const newBotMessage = { sender: "bot", text: response.data.response };
      setMessages([...updatedMessages, newBotMessage]);
    } catch (err) {
      console.error("API Error:", err);
      setRetryMessage(userInput);
      setMessages([
        ...updatedMessages,
        { sender: "bot", text: "❗ Failed to get response. Please Retry." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleRetry = () => {
    if (retryMessage) handleSend(retryMessage);
  };

  const handleClearChat = () => {
    setMessages([
      { sender: "bot", text: "👋 Chat cleared. How can I help you now?" },
    ]);
    setRetryMessage(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // ✅ Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="chat-container">
      {/* ✅ Header with Clear Chat button */}
      <div className="chat-header">
        <h2>
          <center>💬Esmeray Chatbot</center>
        </h2>
        <button className="clear-btn" onClick={handleClearChat}>
          🗑 Clear Chat
        </button>
      </div>

      {/* Chat messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.sender === "user" ? (
              <span className="icon">🧑</span>
            ) : (
              <span className="icon">🤖</span>
            )}
            <span>{msg.text}</span>
          </div>
        ))}

        {typing && (
          <div className="chat-bubble bot typing">
            <span className="icon">🤖</span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}

        {retryMessage && (
          <div className="retry-container">
            <button onClick={handleRetry}>🔄 Retry</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={() => handleSend()}>Send</button>
      </div>
    </div>
  );
}

export default App;
