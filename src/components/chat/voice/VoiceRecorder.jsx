import React, { useState } from "react";
import axios from "axios";
import { Mic, MicOff } from "lucide-react";

const VoiceRecorder = ({ senderId, receiverId, onSent }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        sendVoice(chunks);
        stream.getTracks().forEach(track => track.stop()); // Stop mic stream
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const sendVoice = async (chunks) => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "voice.webm"); // the backend must accept field name `audio`
    formData.append("senderId", senderId);
    formData.append("receiverId", receiverId);
    formData.append("timestamp", new Date().toISOString());

    try {
      const res = await axios.post("http://localhost:3500/message/send-audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (onSent) onSent(res.data); // optional callback
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div
      onClick={recording ? stopRecording : startRecording}
      className={`p-2 rounded-full shadow-md cursor-pointer transition-colors duration-200 ${
        recording ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"
      }`}
      title={recording ? "Stop recording" : "Start voice message"}
    >
      {recording ? <MicOff size={20} /> : <Mic size={20} />}
    </div>
  );
};

export default VoiceRecorder;
