import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Doctor from "./components/doctor";
import Login from "./components/login/Login";
import { useAuthContext } from "./context/AuthContext";
import UserActivation from "./components/admin/UserActivation";
import Signup from "./components/admin/Signup";
import AdminNotes from "./components/admin/AdminNotes";
import Sickchat from "./components/sickchat/Sickchat";
import Notification from "./components/notification/Notification";
import "./index.css";
import WelcomePage from "./mainpage/WelcomePage";

const App = () => {
  const { authUser } = useAuthContext();

  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 6 && currentHour < 18;
  const videoSrc = isMorning ? "/night.mp4" : "/morning.mp4";

  const storedUser = localStorage.getItem("chat-user");
  const role = storedUser ? JSON.parse(storedUser).roles : null;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getHomePage = () => {
    if (!authUser) return <Login />;
    return role === "sick" ? <Sickchat /> : <Doctor />;
  };

  if (isMobile) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        textAlign: "center", 
        padding: "20px",
        backgroundColor: "#f0f0f0"
      }}>
        <h2 style={{ fontSize: "1.5rem", color: "#333" }}>
          📱 الرجاء فتح الموقع على الحاسوب
        </h2>
      </div>
    );
  }

  return (
    <>
      <video autoPlay muted loop id="bgVideo">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="container">
        <Routes>
          <Route path="/" element={getHomePage()} />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/activate-users" element={<UserActivation />} />
          <Route path="/signup-doctor" element={<Signup />} />
          <Route path="/notes" element={<AdminNotes />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} replace />} />
        </Routes>
      </div>

      <Notification />
    </>
  );
};

export default App;
