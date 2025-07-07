// VoicePlayer.jsx
import React from "react";
import "./voicePlayer.css";

const VoicePlayer = ({ audioUrl }) => {
  return (
    <div className="voice-player">
      <audio controls src={`http://localhost:3500${audioUrl}`} />
    </div>
  );
};

export default VoicePlayer;
