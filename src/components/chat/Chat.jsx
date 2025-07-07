import EmojiPicker from "emoji-picker-react";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import useConversation from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import VoiceRecorder from "./voice/VoiceRecorder";
import VoicePlayer from "./voice/VoicePlayer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Chat = () => {
  const user = JSON.parse(localStorage.getItem("chat-user"));
  const { selectedUser } = useConversation();
  const storedConversation = JSON.parse(localStorage.getItem("selected-conversation"));

  const conversationId = selectedUser?._id;
  const userId = user?._id || user?.id;
  const conversationName = storedConversation?.name || storedConversation?.username || "لا يوجد اسم";
  const groupId = storedConversation?._id;
  const isGroup = selectedUser?.type === "group";

  const { socket } = useSocketContext();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      if (
        (data.senderId === conversationId && data.receiverId === userId) ||
        (data.senderId === userId && data.receiverId === conversationId) ||
        (isGroup && data.groupId === groupId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("newMessage", handleIncomingMessage);
    return () => socket.off("newMessage", handleIncomingMessage);
  }, [socket, userId, conversationId, isGroup, groupId]);

  useEffect(() => {
    const fetchAllMessages = async () => {
      if (!userId || !conversationId) return;

      try {
        if (isGroup) {
          const res = await axios.get(
            `http://localhost:3500/message/messages/group/${conversationId}`
          );
          const sorted = (res.data?.messages || []).sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sorted);
        } else {
          const [textRes, audioRes, imageRes] = await Promise.all([
            axios.get(`http://localhost:3500/message/conversation/${userId}/${conversationId}`),
            axios.get(`http://localhost:3500/message/audio-messages/${userId}/${conversationId}`),
            axios.get(`http://localhost:3500/message/messages/image/${userId}/${conversationId}`),
          ]);

          const audioMessages = Array.isArray(audioRes.data.messages)
            ? audioRes.data.messages
            : Array.isArray(audioRes.data)
            ? audioRes.data
            : [audioRes.data];

          const combined = [
            ...(textRes.data.messages || []),
            ...audioMessages,
            ...(imageRes.data.messages || []),
          ];

          const uniqueSorted = combined
            .filter((msg, index, self) => index === self.findIndex((m) => m._id === msg._id))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          setMessages(uniqueSorted);
        }
      } catch (err) {
        console.error("فشل في جلب الرسائل:", err);
      }
    };

    fetchAllMessages();
  }, [userId, conversationId, isGroup]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const messageData = {
      senderId: userId,
      message: text,
      timestamp: new Date().toISOString(),
      type: "text",
      ...(isGroup ? { groupId: conversationId } : { receiverId: conversationId }),
    };

    try {
      await axios.post("http://localhost:3500/message/send", messageData);
      setMessages((prev) => [...prev, messageData]);
      setText("");
    } catch (err) {
      const errorMessage = err?.response?.data?.error || "فشل في إرسال الرسالة.";

      if (errorMessage.includes("You can only send messages between 1 hour before")) {
        toast.warn(errorMessage);
      } else {
        toast.error("تحتاج إلى حجز جلسة.");
      }

      console.error("خطأ في إرسال الرسالة:", err);
    }
  };

  const handleEmoji = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversationId || !userId) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("senderId", userId);
    formData.append("timestamp", new Date().toISOString());

    if (isGroup) {
      formData.append("groupId", conversationId);
    } else {
      formData.append("receiverId", conversationId);
    }

    try {
      const res = await axios.post("http://localhost:3500/message/send-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [...prev, res.data.message]);
    } catch (err) {
      console.error("فشل في رفع الصورة:", err);
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat no-chat-selected" dir="rtl">
        <div className="placeholder-content">
          <h2>لا توجد محادثة مختارة</h2>
          <p>الرجاء اختيار مستخدم لبدء المحادثة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat" dir="ltr">
      <div className="top">
        <div className="user">
          <img
            src={selectedUser?.avatar ? `http://localhost:3500${selectedUser.avatar}` : "./avatar.png"}
            alt="المستخدم"
          />
          <div className="texts">
            <span>{conversationName}</span>
            <p>ابدأ المحادثة...</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="اتصال" />
          <img src="./video.png" alt="فيديو" />
          <img src="./info.png" alt="معلومات" />
        </div>
      </div>

      <div className="center">
        {messages.filter((msg) => msg && (msg.message || msg.audioUrl || msg.imageUrl)).map((msg, i) => (
          <div className={`message ${msg.senderId === userId ? "own" : ""}`} key={msg._id || i}>
            <div className="texts">
              {msg.senderId !== userId && (
                <img
                  src={selectedUser?.avatar ? `http://localhost:3500${selectedUser.avatar}` : "./avatar.png"}
                  alt="المستخدم"
                  className="small-image"
                />
              )}
              {msg.imageUrl && (
                <img
                  src={`http://localhost:3500${msg.imageUrl}`}
                  alt="صورة"
                  className="chat-image"
                />
              )}
              {msg.message && <p>{msg.message}</p>}
              {msg.audioUrl && <VoicePlayer audioUrl={msg.audioUrl} />}
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        {!isGroup && (
          <div className="icons">
            <>
              <input
                type="file"
                accept="image/*"
                ref={(ref) => (window.imageInput = ref)}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <img src="./img.png" alt="رفع صورة" style={{ cursor: "pointer" }} onClick={() => window.imageInput.click()} />
            </>
            <img src="./camera.png" alt="كاميرا" />
            <VoiceRecorder
              senderId={userId}
              receiverId={!isGroup ? conversationId : undefined}
              groupId={isGroup ? conversationId : undefined}
              onSent={(voiceMsg) => setMessages((prev) => [...prev, voiceMsg])}
            />
          </div>
        )}

        <input
          type="text"
          placeholder="اكتب رسالة..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        {!isGroup && (
          <img
            className="emoji-icon"
            src="./emoji.png"
            alt="رمز تعبيري"
            style={{ cursor: "pointer" }}
            onClick={() => setOpen((prev) => !prev)}
          />
        )}

        {open && !isGroup && (
          <div style={{ position: "absolute", bottom: "60px", right: "100px", zIndex: 999 }}>
            <EmojiPicker onEmojiClick={handleEmoji} />
          </div>
        )}

        <button className="sendButton" onClick={handleSend}>
          إرسال
        </button>
      </div>
    </div>
  );
};

export default Chat;