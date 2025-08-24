import React, { useState } from "react";
import { fetchTTS, fetchGhibliImage } from "../lib/api"; // ✅ add Ghibli API

// === ICON IMPORTS ===
import UploadIcon from "../icons/upload.svg";
import GenerateIcon from "../icons/generate.svg";
import TTSIcon from "../icons/tts.svg";
import GifIcon from "../icons/gif.svg"; // 🔥 GIF icon
import GhibliIcon from "../icons/ghibli.svg"; // 🎬 NEW: Add a Ghibli icon (create/download SVG)
import PlusIcon from "../icons/plus.svg";
import CloseIcon from "../icons/close.svg";

function PlusMenu({ onImageUpload, onImageGen, onGifGen, onGhibliGen }) {
  const [open, setOpen] = useState(false);

  // ✅ Handle TTS request
  const handleTTS = async () => {
    const text = prompt("Enter text to speak:");
    if (!text) return;

    try {
      const res = await fetchTTS(text, "en");
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.play().catch((err) => console.error("Audio play error:", err));
      }
    } catch (err) {
      console.error("TTS Error:", err);
      alert("❌ Failed to generate speech.");
    }
  };

  // ✅ Handle GIF request (multiple)
  const handleGIF = async () => {
    const keyword = prompt("Enter a keyword for GIF:");
    if (!keyword) return;

    try {
      const apiKey = "MZbjqUJw2qOzr50I2AfZQ7hVUyFDb4kK"; // ⚠️ Replace with your Giphy API key
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${keyword}&limit=5`
      );
      const data = await res.json();

      if (data.data.length > 0) {
        const gifList = data.data.map((gif) => gif.images.fixed_height.url);
        onGifGen(gifList); // send all results back to App.js
      } else {
        alert("❌ No GIF found!");
      }
    } catch (err) {
      console.error("GIF Error:", err);
      alert("❌ Failed to fetch GIFs.");
    }
  };

  // ✅ Handle Ghibli Image request
  const handleGhibli = async () => {
    try {
      const res = await fetchGhibliImage();
      if (res) {
        onGhibliGen(res); // send {title, image} to App.js
      } else {
        alert("❌ Failed to fetch Ghibli image.");
      }
    } catch (err) {
      console.error("Ghibli Error:", err);
      alert("❌ Ghibli image fetch failed.");
    }
  };

  return (
    <div className="plusmenu-wrapper">
      {/* Plus button inside input bar */}
      <button
        className={`plus-button ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        title="More options"
      >
        <img src={open ? CloseIcon : PlusIcon} alt="Toggle" width="20" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="plusmenu-dropdown">
          <button onClick={onImageUpload}>
            <img
              src={UploadIcon}
              alt="Upload"
              width="18"
              style={{ marginRight: "6px" }}
            />
            Upload Image
          </button>

          <button onClick={onImageGen}>
            <img
              src={GenerateIcon}
              alt="Generate"
              width="18"
              style={{ marginRight: "6px" }}
            />
            Generate Image
          </button>

          <button onClick={handleTTS}>
            <img
              src={TTSIcon}
              alt="TTS"
              width="18"
              style={{ marginRight: "6px" }}
            />
            Text-to-Speech
          </button>

          <button onClick={handleGIF}>
            <img
              src={GifIcon}
              alt="GIF"
              width="18"
              style={{ marginRight: "6px" }}
            />
            Search GIFs
          </button>

          {/* 🎬 New Ghibli Button */}
          <button onClick={handleGhibli}>
            <img
              src={GhibliIcon}
              alt="Ghibli"
              width="18"
              style={{ marginRight: "6px" }}
            />
            Ghibli Image
          </button>
        </div>
      )}
    </div>
  );
}

export default PlusMenu;
