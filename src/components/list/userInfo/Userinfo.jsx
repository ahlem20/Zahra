import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./userInfo.css";
import Session from "./sessions/Session";
import { FaCalendarCheck } from "react-icons/fa";
import { MdScreenSearchDesktop } from "react-icons/md";
import { useSocketContext } from "../../../context/SocketContext";
import { toast } from "react-toastify";

const Userinfo = () => {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showSession, setShowSession] = useState(false);
  const { socket } = useSocketContext();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("chat-user"));
    if (storedUser) {
      setUsername(storedUser.username);
      setAvatar(storedUser.avatar);
    } else {
      navigate("/welcome");
    }
  }, [navigate]);

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
        
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <FaCalendarCheck
            className="session-icon"
            onClick={() => setShowSession(true)}
            title="عرض الجلسات"
            style={{ cursor: "pointer" }}
          />
          <MdScreenSearchDesktop
            className="session-icon"
            onClick={() => navigate("/welcome")}
            title="تسجيل الخروج"
            style={{ cursor: "pointer" }}
          />
      </div>

      {showSession && <Session onClose={() => setShowSession(false)} />}
    </div>
  );
};

export default Userinfo;
