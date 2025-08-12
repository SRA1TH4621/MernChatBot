import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const saveToLocalStorage = (msgs) => {
    localStorage.setItem("chatMessages", JSON.stringify(msgs));
  };

  const handleSend = async (retryInput = null) => {
    const userInput = retryInput || input.trim();
    if (!userInput) return;

    const newUserMessage = { sender: "user", text: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    saveToLocalStorage(updatedMessages);
    setInput("");
    setTyping(true);
    setRetryMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat",
        { message: userInput },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Bot Reply:", response.data.response);

      const newBotMessage = { sender: "bot", text: response.data.response };
      const finalMessages = [...updatedMessages, newBotMessage];
      setMessages(finalMessages);
      saveToLocalStorage(finalMessages);
    } catch (err) {
      console.error("API Error:", err);
      setRetryMessage(userInput);
      const errorMsg = {
        sender: "bot",
        text: "❗ Failed to get response. Please Retry.",
      };
      const errorMessages = [...updatedMessages, errorMsg];
      setMessages(errorMessages);
      saveToLocalStorage(errorMessages);
    } finally {
      setTyping(false);
    }
  };

  const handleRetry = () => {
    if (retryMessage) handleSend(retryMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="chat-container">
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
