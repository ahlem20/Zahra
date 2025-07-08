import { useState, useEffect } from "react";
import "./chatList.css";
import AddGroup from "./addUser/AddGroup";
import axios from "axios";
import useConversation from "../../../zustand/useConversation";
import { useLocation } from "react-router-dom";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("");
  const [extraUser, setExtraUser] = useState(null);

  const { selectedUser, setSelectedUser } = useConversation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const receiverIdFromURL = searchParams.get("receiverId");

  // Get current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setRole(parsedUser.roles);
    }
  }, []);

  // Disable add group for "sick" role
  useEffect(() => {
    if (role === "sick") setAddMode(false);
  }, [role]);

  // Fetch users, groups, and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?._id && !currentUser?.id) return;

      const id = currentUser._id || currentUser.id;

      try {
        const [usersRes, groupsRes, messagesRes] = await Promise.all([
          axios.get("https://zahrabackend.onrender.com/users"),
          axios.get(`https://zahrabackend.onrender.com/groups/user/${id}`),
          axios.get(`https://zahrabackend.onrender.com/message/messages/user/${id}`),
        ]);

        const allUsers = usersRes.data;
        const allMessages = messagesRes.data.messages || [];
        const relevantUserIds = new Set();

        allMessages.forEach((msg) => {
          if (msg.senderId !== id && msg.receiverId === id) {
            relevantUserIds.add(msg.senderId);
          }
          if (msg.receiverId !== id && msg.senderId === id) {
            relevantUserIds.add(msg.receiverId);
          }
        });

        const filteredUsers = allUsers.filter(
          (user) => relevantUserIds.has(user._id) && user._id !== id
        );

        setUsers(filteredUsers);

        const groupsWithType = (groupsRes.data.groups || []).map((group) => ({
          ...group,
          type: "group",
        }));
        setGroups(groupsWithType);

        // Handle receiverId in URL
        if (receiverIdFromURL && receiverIdFromURL !== id) {
          const existingUser = filteredUsers.find((u) => u._id === receiverIdFromURL);

          if (existingUser) {
            setSelectedUser(existingUser);
            localStorage.setItem("selected-conversation", JSON.stringify(existingUser));
          } else {
            const res = await axios.get(`https://zahrabackend.onrender.com/users/${receiverIdFromURL}`);
            setExtraUser(res.data);
            setSelectedUser(res.data);
            localStorage.setItem("selected-conversation", JSON.stringify(res.data));
          }
        }

      } catch (err) {
        console.error("حدث خطأ أثناء جلب البيانات", err);
      }
    };

    if (currentUser) fetchData();
  }, [currentUser, role]);

  const handleSelectConversation = (userOrGroup) => {
    setSelectedUser(userOrGroup);
    localStorage.setItem("selected-conversation", JSON.stringify(userOrGroup));
  };

  const handleDeleteConversation = async (userIdToDelete) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذه المحادثة؟")) return;

    try {
      setUsers((prev) => prev.filter((u) => u._id !== userIdToDelete));

      if (selectedUser?._id === userIdToDelete) {
        setSelectedUser(null);
        localStorage.removeItem("selected-conversation");
      }

      alert("تم حذف المحادثة بنجاح.");
    } catch (err) {
      console.error("فشل حذف المحادثة", err);
      alert("فشل حذف المحادثة.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="chatList" dir="rtl">
      {/* Search Bar */}
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="بحث" />
          <input
            type="text"
            placeholder="ابحث هنا..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {role !== "sick" && (
          <img
            src={addMode ? "./minus.png" : "./plus.png"}
            alt="إضافة"
            className="add"
            onClick={() => setAddMode((prev) => !prev)}
          />
        )}
      </div>

      {/* Group List */}
      {filteredGroups.map((group) => (
        <div
          className="item"
          key={group._id}
          onClick={() => handleSelectConversation(group)}
          style={{
            backgroundColor:
              selectedUser?._id === group._id ? "rgb(2 66 159 / 52%)" : "transparent",
          }}
        >
          <img src="./group-icon.png" alt="مجموعة" />
          <div className="texts">
            <span>{group.name}</span>
            <p>{group.members?.length || 0} أعضاء</p>
          </div>
        </div>
      ))}

      {/* User List */}
      {filteredUsers.map((user) => (
        <div
          className="item"
          key={user._id}
          style={{
            backgroundColor:
              selectedUser?._id === user._id ? "rgb(2 66 159 / 52%)" : "transparent",
          }}
        >
          <div
            onClick={() => handleSelectConversation(user)}
            style={{ flex: 1, display: "flex", alignItems: "center" }}
          >
            <img
              src={user.avatar ? `https://zahrabackend.onrender.com${user.avatar}` : "./avatar.png"}
              alt="صورة"
            />
            <div className="texts">
              <span>
                {user.username === currentUser?.username ? "ملاحظاتي" : user.username}
              </span>
              <p>{user.email}</p>
            </div>
          </div>

          <img
            src="./delete.png"
            alt="حذف"
            className="delete-icon"
            onClick={() => handleDeleteConversation(user._id)}
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          />
        </div>
      ))}

      {/* Extra User (if coming from URL) */}
      {extraUser && !users.some((u) => u._id === extraUser._id) && (
        <div
          className="item"
          key={extraUser._id}
          onClick={() => handleSelectConversation(extraUser)}
          style={{
            backgroundColor:
              selectedUser?._id === extraUser._id ? "rgb(2 66 159 / 52%)" : "transparent",
          }}
        >
          <img
            src={extraUser.avatar ? `https://zahrabackend.onrender.com${extraUser.avatar}` : "./avatar.png"}
            alt="صورة"
          />
          <div className="texts">
            <span>{extraUser.username}</span>
            <p>{extraUser.email}</p>
          </div>
        </div>
      )}

      {/* Add Group UI */}
      {addMode && role !== "sick" && (
        <AddGroup onClose={() => setAddMode(false)} chatUsers={users} />
      )}
    </div>
  );
};

export default ChatList;
