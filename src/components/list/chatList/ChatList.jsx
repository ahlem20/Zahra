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

  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setRole(parsedUser.roles);
    }
  }, []);

  useEffect(() => {
    if (role === "sick") setAddMode(false);
  }, [role]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?._id && !currentUser?.id) return;
      const id = currentUser._id || currentUser.id;

      try {
        const [usersRes, groupsRes, messagesRes] = await Promise.all([
          axios.get("http://localhost:3500/users"),
          axios.get(`http://localhost:3500/groups/user/${id}`),
          axios.get(`http://localhost:3500/message/messages/user/${id}`),
        ]);

        const allUsers = usersRes.data;
        const allMessages = messagesRes.data.messages || [];
        const relevantUserIds = new Set();

        if (role === "sick") {
          allMessages.forEach((msg) => {
            if (msg.receiverId === id && msg.senderId !== id) {
              relevantUserIds.add(msg.senderId);
            }
          });
        } else {
          allMessages.forEach((msg) => {
            if (msg.senderId === id && msg.receiverId !== id) {
              relevantUserIds.add(msg.receiverId);
            }
            if (msg.receiverId === id && msg.senderId !== id) {
              relevantUserIds.add(msg.senderId);
            }
          });
        }

        const filteredUsers = allUsers.filter(
          (user) => relevantUserIds.has(user._id) && user._id !== id
        );

        setUsers(filteredUsers);

        const groupsWithType = (groupsRes.data.groups || []).map((group) => ({
          ...group,
          type: "group",
        }));
        setGroups(groupsWithType);

        if (receiverIdFromURL && receiverIdFromURL !== id) {
          const alreadyInList = filteredUsers.some((u) => u._id === receiverIdFromURL);
          if (!alreadyInList) {
            const res = await axios.get(`http://localhost:3500/users/${receiverIdFromURL}`);
            setExtraUser(res.data);
            setSelectedUser(res.data);
            localStorage.setItem("selected-conversation", JSON.stringify(res.data));
          } else {
            const existingUser = filteredUsers.find((u) => u._id === receiverIdFromURL);
            if (existingUser) {
              setSelectedUser(existingUser);
              localStorage.setItem("selected-conversation", JSON.stringify(existingUser));
            }
          }
        }

      } catch (err) {
        console.error("حدث خطأ أثناء جلب البيانات", err);
      }
    };

    if (currentUser) fetchData();
  }, [currentUser, role]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    localStorage.setItem("selected-conversation", JSON.stringify(user));
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

      {filteredGroups.map((group) => (
        <div
          className="item"
          key={group._id}
          onClick={() => handleSelectUser(group)}
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

      {filteredUsers.map((user) => (
        <div
          className="item"
          key={user._id}
          style={{
            backgroundColor:
              selectedUser?._id === user._id ? "rgb(2 66 159 / 52%)" : "transparent",
          }}
        >
          <div onClick={() => handleSelectUser(user)} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <img
              src={user.avatar ? `http://localhost:3500${user.avatar}` : "./avatar.png"}
              alt="صورة"
            />
            <div className="texts">
              <span>
                {user.username === currentUser?.username && user.email === currentUser?.email
                  ? "ملاحظاتي"
                  : user.username}
              </span>
              <p>{user.email}</p>
            </div>
          </div>

          <img
            src="./delete.png"
            alt="حذف"
            className="delete-icon"
            onClick={() => handleDeleteConversation(user._id)}
            style={{ width: "30px", height: "30px", cursor: "pointer", marginLeft: "8px" }}
          />
        </div>
      ))}

      {extraUser && (
        <div
          className="item"
          key={extraUser._id}
          onClick={() => handleSelectUser(extraUser)}
          style={{
            backgroundColor:
              selectedUser?._id === extraUser._id ? "rgb(2 66 159 / 52%)" : "transparent",
          }}
        >
          <img
            src={extraUser.avatar ? `http://localhost:3500${extraUser.avatar}` : "./avatar.png"}
            alt="صورة"
          />
          <div className="texts">
            <span>{extraUser.username}</span>
            <p>{extraUser.email}</p>
          </div>
        </div>
      )}

      {addMode && role !== "sick" && <AddGroup onClose={() => setAddMode(false)} chatUsers={users} />}
</div>
  );
};

export default ChatList;