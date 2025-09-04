import React, { useState, useRef } from "react";
import { fetchTTS, fetchGhibliImage, generateImage } from "../lib/api";

// === ICONS ===
import UploadIcon from "../icons/upload.svg";
import GenerateIcon from "../icons/generate.svg";
import TTSIcon from "../icons/tts.svg";
import GifIcon from "../icons/gif.svg";
import GhibliIcon from "../icons/ghibli.svg";
import PlusIcon from "../icons/plus.svg";
import CloseIcon from "../icons/close.svg";

function PlusMenu({ onImageUpload, onImageGen, onGifGen, onGhibliGen }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);

  // === Upload Image ===
  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onImageUpload(file);
  };

  // === Generate Image ===
  const handleImageGen = () => {
    const prompt = window.prompt("Enter a prompt for image generation:");
    if (!prompt) return;
    onImageGen(prompt); // ✅ just send prompt to App.js
    setOpen(false);
  };


  // === Text-to-Speech ===
  const handleTTS = async () => {
    const text = prompt("Enter text to speak:");
    if (!text) return;
    try {
      const res = await fetchTTS(text, "en");
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.play();
      }
    } catch (err) {
      console.error("TTS Error:", err);
      alert("❌ TTS failed.");
    }
    setOpen(false);
  };

  // === GIF Search ===
  const handleGIF = async () => {
    const keyword = prompt("Enter a keyword for GIF:");
    if (!keyword) return;
    try {
      const apiKey = "MZbjqUJw2qOzr50I2AfZQ7hVUyFDb4kK"; // Replace with your Giphy API key
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${keyword}&limit=5`
      );
      const data = await res.json();
      if (data.data.length > 0) {
        const gifList = data.data.map((gif) => gif.images.fixed_height.url);
        onGifGen(gifList);
      } else {
        alert("❌ No GIF found!");
      }
    } catch (err) {
      console.error("GIF Error:", err);
      alert("❌ Failed to fetch GIFs.");
    }
    setOpen(false);
  };

  // === Ghibli Image ===
  const handleGhibli = async () => {
    try {
      const res = await fetchGhibliImage();
      if (res) {
        onGhibliGen(res);
      } else {
        alert("❌ No Ghibli image found.");
      }
    } catch (err) {
      console.error("Ghibli Error:", err);
      alert("❌ Ghibli fetch failed.");
    }
    setOpen(false);
  };

  return (
    <div className="plusmenu-wrapper">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Toggle Button */}
      <button
        className="plus-button"
        onClick={() => setOpen((prev) => !prev)}
        title="More options"
      >
        <img src={open ? CloseIcon : PlusIcon} alt="Toggle" width="20" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="plusmenu-dropdown">
          <button onClick={handleUpload}>
            <img src={UploadIcon} alt="Upload" width="18" /> Upload Image
          </button>
          <button onClick={handleImageGen}>
            <img src={GenerateIcon} alt="Gen" width="18" /> Generate Image
          </button>
          <button onClick={handleTTS}>
            <img src={TTSIcon} alt="TTS" width="18" /> Text-to-Speech
          </button>
          <button onClick={handleGIF}>
            <img src={GifIcon} alt="GIF" width="18" /> Search GIFs
          </button>
          <button onClick={handleGhibli}>
            <img src={GhibliIcon} alt="Ghibli" width="18" /> Ghibli Image
          </button>
        </div>
      )}
    </div>
  );
}

export default PlusMenu;
