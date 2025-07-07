import "./detail.css";
import { FaEdit } from "react-icons/fa";
import Note from "./note/Note";
import { useEffect, useState } from "react";
import axios from "axios";
import useConversation from "../../zustand/useConversation";

const Detail = () => {
  const [addNote, setAddNote] = useState(false);
  const [sharedImages, setSharedImages] = useState([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const [receiverData, setReceiverData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const { selectedUser } = useConversation();

  const currentUser = JSON.parse(localStorage.getItem("chat-user"));
  const storedConversation = JSON.parse(localStorage.getItem("selected-conversation"));

  const userId = currentUser?._id || currentUser?.id;
  const receiverId = selectedUser?._id;
  const groupId = storedConversation?._id;

  const isGroup =
    storedConversation?.isGroup ||
    Array.isArray(storedConversation?.members) ||
    false;

  const conversationName =
    storedConversation?.name ||
    storedConversation?.username ||
    "لا يوجد اسم";

  const conversationEmail = receiverData?.email || storedConversation?.email || "لا يوجد بريد إلكتروني";

  useEffect(() => {
    const fetchReceiver = async () => {
      if (!receiverId || isGroup) return;
      try {
        const res = await axios.get(`http://localhost:3500/users/${receiverId}`);
        setReceiverData(res.data);
      } catch (err) {
        console.error("فشل في جلب بيانات المستخدم:", err);
      }
    };
    fetchReceiver();
  }, [receiverId, isGroup]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!userId || !receiverId || isGroup) return;
      try {
        const res = await axios.get(`http://localhost:3500/message/messages/image/${userId}/${receiverId}`);
        setSharedImages(res.data?.messages || []);
      } catch (err) {
        console.error("فشل في جلب الصور المشاركة", err);
      }
    };
    fetchImages();
  }, [userId, receiverId, isGroup]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!userId || !receiverId || isGroup) return;
      try {
        const res = await axios.get(`http://localhost:3500/session/accepted/${userId}`);
        const sessions = res.data;

        const session = sessions.find(
          (s) =>
            (s.requesterId === userId && s.receiverId === receiverId) ||
            (s.requesterId === receiverId && s.receiverId === userId)
        );

        setActiveSession(session || null);
      } catch (err) {
        console.error("فشل في جلب الجلسات:", err);
      }
    };

    fetchSession();
  }, [userId, receiverId, isGroup]);

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      await axios.delete(`http://localhost:3500/session/${activeSession._id}`);
      setActiveSession(null);
      alert("تم إنهاء الجلسة بنجاح.");
    } catch (err) {
      console.error("فشل في إنهاء الجلسة:", err);
      alert("فشل في إنهاء الجلسة.");
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف المجموعة؟");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3500/groups/${groupId}`);
      alert("تم حذف المجموعة بنجاح.");
      window.location.reload();
    } catch (err) {
      console.error("فشل في حذف المجموعة", err);
      alert("فشل في حذف المجموعة.");
    }
  };

  const handlePrivacyHelp = async () => {
    const message = prompt("أدخل رسالتك للمشرف:");
    if (!message || !message.trim()) return;

    try {
      await axios.post("http://localhost:3500/note/admin", {
        text: message.trim(),
        userId,
      });
      alert("تم إرسال رسالتك إلى المشرف.");
    } catch (err) {
      console.error("فشل في إرسال الرسالة", err);
      alert("فشل في إرسال الرسالة.");
    }
  };

  return (
    <div className="detail" dir="rtl">
      <div className="userInfo">
        <div className="user">
          <img
            src={
              isGroup
                ? "./group-icon.png"
                : receiverData?.avatar
                ? `http://localhost:3500${receiverData.avatar}`
                : "./avatar.png"
            }
            alt="صورة الملف الشخصي"
          />
          <h2>{conversationName}</h2>
          <p>{isGroup ? "محادثة جماعية" : conversationEmail}</p>
        </div>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>إعدادات المحادثة</span>
            <img src="./arrowUp.png" alt="توسيع" />
          </div>
        </div>

        <div className="option">
          <div className="title" onClick={() => setAddNote((prev) => !prev)}>
            <span>ملاحظتي</span>
            <FaEdit size={24} />
          </div>
        </div>

        <div className="option">
          <div className="title" onClick={handlePrivacyHelp}>
            <span>مساعدة الخصوصية</span>
          </div>
        </div>

        {!isGroup && (
          <div className="option">
            <div className="title" onClick={() => setShowPhotos(!showPhotos)}>
              <span>الصور المشتركة</span>
              <img
                src={showPhotos ? "./arrowUp.png" : "./arrowDown.png"}
                alt="تبديل الصور"
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        )}

        {!isGroup && showPhotos && (
          <div className="photos">
            {sharedImages.length === 0 ? (
              <p style={{ color: "#999", padding: "10px" }}>لا توجد صور مشتركة.</p>
            ) : (
              sharedImages.map((img, i) => (
                <div className="photoItem" key={img._id || i}>
                  <div className="photoDetail">
                    <img
                      src={`http://localhost:3500${img.imageUrl}`}
                      alt={`img-${i}`}
                      onClick={() => window.open(`http://localhost:3500${img.imageUrl}`, "_blank")}
                      style={{ cursor: "pointer" }}
                    />
                    <span>{img.imageUrl.split("/").pop()}</span>
                  </div>
                  <a href={`http://localhost:3500${img.imageUrl}`} download>
                    <img src="./download.png" className="icon1" alt="تحميل" />
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {!isGroup && activeSession && (
          <button
            onClick={handleEndSession}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            إنهاء الجلسة
          </button>
        )}

        {isGroup && (
          <button
            onClick={handleDeleteGroup}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#b82e2e",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            حذف المجموعة
          </button>
        )}
      </div>

      {addNote && <Note />}
    </div>
  );
};

export default Detail;