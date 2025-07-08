import { useEffect, useState } from "react";
import "./userInfo.css";
import Session from "./sessions/Session";
import { FaCalendarCheck } from "react-icons/fa";
import { useSocketContext } from "../../../context/SocketContext";  // Adjust path if needed
import { toast } from "react-toastify";

const Userinfo = () => {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showSession, setShowSession] = useState(false);
  const { socket } = useSocketContext();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("chat-user"));
    if (storedUser) {
      setUsername(storedUser.username);
      setAvatar(storedUser.avatar);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewSession = (session) => {
      toast.info(`📅 New session scheduled for ${session.date} at ${session.time}`);
    };

    const handleSessionAccepted = (session) => {
      toast.success(`✅ Your session on ${session.date} has been accepted!`);
    };

    socket.on("new-session", handleNewSession);
    socket.on("session-accepted", handleSessionAccepted);

    return () => {
      socket.off("new-session", handleNewSession);
      socket.off("session-accepted", handleSessionAccepted);
    };
  }, [socket]);

  return (
    <div className="userInfo1" style={{ direction: "rtl", textAlign: "right" }}>
      <div className="user">
        <img
          src={avatar ? `https://zahrabackend.onrender.com${avatar}` : "./avatar.png"}
          alt="صورة المستخدم"
        />
        <h2>{username || "المستخدم"}</h2>
        <FaCalendarCheck
          className="session-icon"
          onClick={() => setShowSession(true)}
          title="عرض الجلسات"
        />
      </div>

      {showSession && <Session onClose={() => setShowSession(false)} />}
    </div>
  );
};

export default Userinfo;
