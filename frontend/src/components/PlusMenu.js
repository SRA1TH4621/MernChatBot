import React, { useState } from "react";
import { fetchTTS } from "../lib/api"; // ✅ import TTS

function PlusMenu({ onImageUpload, onImageGen }) {
  const [open, setOpen] = useState(false);

  // ✅ Handle TTS request
  const handleTTS = async () => {
    const text = prompt("Enter text to speak:");
    if (!text) return;

    try {
      const res = await fetchTTS(text, "en");
      if (res.audioUrl) {
        console.log("🎵 Playing TTS:", res.audioUrl); // debug
        const audio = new Audio(res.audioUrl);
        audio.play().catch((err) => console.error("Audio play error:", err));
      }
    } catch (err) {
      console.error("TTS Error:", err);
      alert("❌ Failed to generate speech.");
    }
  };

  return (
    <div className="plus-menu-container">
      {/* Menu options */}
      <div className={`menu-options ${open ? "show" : ""}`}>
        <button onClick={onImageUpload}>📷 Upload Image</button>
        <button onClick={onImageGen}>🎨 Generate Image</button>
        <button onClick={handleTTS}>🗣 Text-to-Speech</button> {/* ✅ NEW */}
      </div>

      {/* Plus button */}
      <button className="plus-button" onClick={() => setOpen((prev) => !prev)}>
        {open ? "✖" : "+"}
      </button>
    </div>
  );
}

export default PlusMenu;
