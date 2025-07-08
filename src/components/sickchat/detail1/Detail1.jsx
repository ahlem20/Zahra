import { useState, useEffect } from "react";
import "./detail1.css";
import axios from "axios";
import useConversation from "../../../zustand/useConversation";

const Detail = () => {
  const [showDemandForm, setShowDemandForm] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const price = 5;
  const [showPhotos, setShowPhotos] = useState(false);
  const [sharedImages, setSharedImages] = useState([]);
  const [receiverData, setReceiverData] = useState(null);

  const { selectedUser } = useConversation();

  const currentUser = JSON.parse(localStorage.getItem("chat-user"));
  const storedReceiver = JSON.parse(localStorage.getItem("selected-conversation"));
  const userId = currentUser?._id || currentUser?.id;
  const receiverId = selectedUser?._id;

  const conversationName =
    storedReceiver?.name ||
    receiverData?.username ||
    selectedUser?.username ||
    "بدون اسم";

  const conversationEmail =
    storedReceiver?.email ||
    receiverData?.email ||
    selectedUser?.email ||
    "لا يوجد بريد إلكتروني";

  const avatarUrl =
    storedReceiver?.avatar
      ? `https://zahrabackend.onrender.com${storedReceiver.avatar}`
      : receiverData?.avatar
      ? `https://zahrabackend.onrender.com${receiverData.avatar}`
      : "./avatar.png";

  const isGroup = selectedUser?.type === "group" || storedReceiver?.type === "group";

  useEffect(() => {
    const fetchReceiver = async () => {
      if (!receiverId) return;
      try {
        const res = await axios.get(`https://zahrabackend.onrender.com/users/${receiverId}`);
        setReceiverData(res.data);
      } catch (err) {
        console.error("فشل في جلب بيانات المستخدم:", err);
      }
    };
    fetchReceiver();
  }, [receiverId]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!userId || !receiverId) return;
      try {
        const res = await axios.get(
          `https://zahrabackend.onrender.com/message/messages/image/${userId}/${receiverId}`
        );
        setSharedImages(res.data?.messages || []);
      } catch (err) {
        console.error("فشل في جلب الصور المشتركة", err);
      }
    };
    fetchImages();
  }, [userId, receiverId]);

  const handleDemandClick = () => {
    setShowDemandForm(!showDemandForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sessionData = {
        requesterId: userId,
        receiverId,
        date,
        time,
        note,
        price,
      };

      const res = await axios.post("https://zahrabackend.onrender.com/session/", sessionData);

      if (res.status === 201 || res.status === 200) {
        alert("تم إرسال طلب الحصة بنجاح!");
        setDate("");
        setTime("");
        setNote("");
        setShowDemandForm(false);
      } else {
        alert("حدث خطأ. حاول مرة أخرى.");
      }
    } catch (err) {
      console.error("خطأ في إرسال طلب الحصة:", err);
      alert("فشل في إرسال طلب الحصة.");
    }
  };

  return (
    <div className="detail" style={{ direction: "rtl", textAlign: "right" }}>
      <div className="userInfo">
        <div className="user">
          <img src={avatarUrl} alt="صورة الملف" />
          <h2>{conversationName}</h2>
          <p>{conversationEmail}</p>
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
          <div className="title">
            <span>مساعدة الخصوصية</span>
          </div>
        </div>

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

        {showPhotos && (
          <div className="photos">
            {sharedImages.length === 0 ? (
              <p style={{ color: "#999", padding: "10px" }}>لا توجد صور مشتركة.</p>
            ) : (
              sharedImages.map((img, i) => (
                <div className="photoItem" key={img._id || i}>
                  <div className="photoDetail">
                    <img
                      src={`https://zahrabackend.onrender.com${img.imageUrl}`}
                      alt={`img-${i}`}
                      onClick={() =>
                        window.open(`https://zahrabackend.onrender.com${img.imageUrl}`, "_blank")
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span>{img.imageUrl.split("/").pop()}</span>
                  </div>
                  <a href={`https://zahrabackend.onrender.com${img.imageUrl}`} download>
                    <img src="./download.png" className="icon" alt="تحميل" />
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {!isGroup && (
          <>
            <button onClick={handleDemandClick}>طلب حصة</button>

            {showDemandForm && (
              <form className="demandForm" onSubmit={handleSubmit}>
                <label>التاريخ:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />

                <label>الوقت:</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />

                <label>ملاحظة:</label>
                <textarea
                  placeholder="ملاحظة اختيارية..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <label>السعر:</label>
                <input type="text" value={`${price} دج`} disabled />

                <button type="submit" className="sendBtn">
                  إرسال الطلب
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Detail;
