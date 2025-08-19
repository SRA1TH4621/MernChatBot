import React, { useState } from "react";
import { transcribeAudio } from "../lib/api";

import MicIcon from "../icons/mic.svg";
import StopIcon from "../icons/stop.svg";

function VoiceControls({ onTranscribed }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      chunks = []; // ✅ reset after stop

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");

      try {
        const res = await transcribeAudio(formData);
        if (res?.data?.transcript) {
          onTranscribed(res.data.transcript); // ✅ this updates input
        }
      } catch (err) {
        console.error("STT Error:", err);
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        marginLeft: "8px",
      }}
      title={recording ? "Stop Recording" : "Start Recording"}
    >
      <img
        src={recording ? StopIcon : MicIcon}
        alt={recording ? "Stop" : "Mic"}
        width="26"
      />
    </button>
  );
}

export default VoiceControls;
