import React, { useEffect, useState } from "react";
import "./addGroup.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddGroup = ({ onClose, chatUsers = [] }) => {
  const [groupName, setGroupName] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("chat-user");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUserId(user?._id || user?.id);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = chatUsers.filter(
      (user) =>
        user._id !== currentUserId &&
        user.roles === "sick" &&
        user.username.toLowerCase().includes(username.trim().toLowerCase())
    );
    setFoundUsers(filtered || []);
    if (filtered.length === 0) {
      toast.info("لم يتم العثور على مستخدمين مطابقين.");
    }
  };

  const handleToggleUser = (user) => {
    const isAlreadyAdded = groupUsers.find((u) => u._id === user._id);
    if (isAlreadyAdded) {
      setGroupUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setGroupUsers((prev) => [...prev, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error("لم يتم العثور على المستخدم الحالي.");
      return;
    }

    const selectedUserIds = groupUsers.map((u) => u._id);
    const memberIds = [...new Set([currentUserId, ...selectedUserIds])];

    try {
      await axios.post("http://localhost:3500/groups/create", {
        name: groupName,
        members: memberIds,
      });
      toast.success("تم إنشاء المجموعة بنجاح!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("فشل إنشاء المجموعة", err);
      toast.error("فشل في إنشاء المجموعة.");
    }
  };

  return (
    <div className="popup-overlay" dir="rtl">
      <ToastContainer position="top-right" />
      <div className="popup">
        <h2 style={{ color: "white" }}>إنشاء مجموعة جديدة</h2>

        <form onSubmit={handleCreateGroup} className="group-form">
          <input
            type="text"
            placeholder="أدخل اسم المجموعة..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="search-btn">إنشاء المجموعة</button>
        </form>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="أدخل اسم المستخدم..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="search-btn">بحث</button>
        </form>

        <div className="users">
          {foundUsers.map((user) => {
            const isInGroup = groupUsers.find((u) => u._id === user._id);
            return (
              <div key={user._id} className="user-info">
                <div className="details">
                  <img src="./avatar.png" alt="صورة المستخدم" className="avatar" />
                  <span className="username" style={{ color: "black" }}>{user.username}</span>
                </div>
                <button
                  onClick={() => handleToggleUser(user)}
                  className={`add-btn ${isInGroup ? "remove" : ""}`}
                >
                  {isInGroup ? "إزالة" : "إضافة"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AddGroup;
