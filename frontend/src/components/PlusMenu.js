import React, { useState } from "react";
import { fetchTTS } from "../lib/api";

// === ICON IMPORTS ===
import UploadIcon from "../icons/upload.svg";
import GenerateIcon from "../icons/generate.svg";
import TTSIcon from "../icons/tts.svg";
import PlusIcon from "../icons/plus.svg";
import CloseIcon from "../icons/close.svg";

function PlusMenu({ onImageUpload, onImageGen }) {
  const [open, setOpen] = useState(false);

  // ✅ Handle TTS request
  const handleTTS = async () => {
    const text = prompt("Enter text to speak:");
    if (!text) return;

    try {
      const res = await fetchTTS(text, "en");
      if (res.audioUrl) {
        console.log("🎵 Playing TTS:", res.audioUrl);
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
        <button onClick={onImageUpload}>
          <img
            src={UploadIcon}
            alt="Upload"
            width="20"
            style={{ marginRight: "6px" }}
          />
          Upload Image
        </button>

        <button onClick={onImageGen}>
          <img
            src={GenerateIcon}
            alt="Generate"
            width="20"
            style={{ marginRight: "6px" }}
          />
          Generate Image
        </button>

        <button onClick={handleTTS}>
          <img
            src={TTSIcon}
            alt="TTS"
            width="20"
            style={{ marginRight: "6px" }}
          />
          Text-to-Speech
        </button>
      </div>

      {/* Plus button */}
      <button className="plus-button" onClick={() => setOpen((prev) => !prev)}>
        <img src={open ? CloseIcon : PlusIcon} alt="Toggle" width="22" />
      </button>
    </div>
  );
}

export default PlusMenu;
