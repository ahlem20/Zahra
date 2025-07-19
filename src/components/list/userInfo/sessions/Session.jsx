import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./session.css";
import { toast } from "react-toastify";

const Session = ({ onClose }) => {
  const user = JSON.parse(localStorage.getItem("chat-user"));
  const userId = user?.id || user?._id;
  const userRole = user?.roles;

  const [pendingSessions, setPendingSessions] = useState([]);
  const [acceptedSessions, setAcceptedSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editPopup, setEditPopup] = useState(null);
  const [editData, setEditData] = useState({ date: "", time: "", note: "", price: "" });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [pendingRes, acceptedRes] = await Promise.all([
          axios.get(`https://zahrabackend.onrender.com/session/pending/${userId}`),
          axios.get(`https://zahrabackend.onrender.com/session/accepted/${userId}`),
        ]);

        setPendingSessions(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        setAcceptedSessions(Array.isArray(acceptedRes.data) ? acceptedRes.data : []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        toast.error("فشل تحميل الجلسات.");
      }
    };

    fetchSessions();
  }, [userId]);

  const handleAccept = async (id) => {
    try {
      const res = await axios.patch(`https://zahrabackend.onrender.com/session/accept/${id}`);
      toast.success("تم قبول الجلسة.");

      const acceptedSession = pendingSessions.find((s) => s._id === id);
      setPendingSessions((prev) => prev.filter((s) => s._id !== id));
      setAcceptedSessions((prev) => [...prev, { ...acceptedSession, isAccepted: true }]);
    } catch (err) {
      console.error("Failed to accept session:", err);
      toast.error("فشل في قبول الجلسة.");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`https://zahrabackend.onrender.com/session/update/${editPopup}`, editData);
      toast.success("تم تعديل الجلسة.");
  
      setAcceptedSessions((prev) =>
        prev.map((s) => (s._id === editPopup ? { ...s, ...editData } : s))
      );
  
      setPendingSessions((prev) =>
        prev.map((s) => (s._id === editPopup ? { ...s, ...editData } : s))
      );
  
      setEditPopup(null);
    } catch (err) {
      console.error("Error updating session:", err?.response?.data || err.message);
      toast.error("فشل في تعديل الجلسة.");
    }
  };
  

  const renderTable = (sessions, showAccept = false, editable = false) => (
    <table className="session-table">
      <thead>
        <tr>
          <th>اسم المستخدم</th>
          <th>التاريخ</th>
          <th>الوقت</th>
          <th>ملاحظة</th>
          <th>السعر</th>
          <th>الحالة</th>
          {showAccept && <th>الإجراء</th>}
          {editable && userRole === "doctor" && <th>تعديل</th>}
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <tr key={session._id}>
            <td>{session.requesterName || "—"}</td>
            <td>{session.date}</td>
            <td>{session.time}</td>
            <td>{session.note || "—"}</td>
            <td>{session.price || "—"}</td>
            <td>{session.isAccepted ? "مقبولة" : "قيد الانتظار"}</td>
            {showAccept && (
              <td>
                <button className="accept-btn" onClick={() => handleAccept(session._id)}>
                  قبول
                </button>
              </td>
            )}
            {editable && (
  <td>
    {((userRole === "doctor") || (userRole === "sick" && !session.isAccepted)) && (
      <button
        className="edit-btn"
        onClick={() => {
          setEditPopup(session._id);
          setEditData({
            date: session.date || "",
            time: session.time || "",
            note: session.note || "",
            price: session.price || "",
          });
        }}
      >
        تعديل
      </button>
    )}
  </td>
)}


          </tr>
        ))}
      </tbody>
    </table>
  );

  const canAccept = userRole === "doctor" || userRole !== "sick";
  const acceptedDates = acceptedSessions.map((s) => new Date(s.date));

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isSessionDay = acceptedDates.some((d) =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
      return isSessionDay ? "session-day" : null;
    }
  };

  return (
    <div className="session-wrapper" onClick={onClose} dir="rtl">
      <div className="session-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="session-section">
          <h3 className="session-title">الجلسات قيد الانتظار</h3>
          {pendingSessions.length > 0
  ? renderTable(pendingSessions, canAccept, true) // Already passed editable as true
  : <p>لا توجد جلسات قيد الانتظار.</p>}
        </div>

        <div className="session-section">
          <h3 className="session-title">الجلسات المقبولة</h3>
          {acceptedSessions.length > 0
            ? renderTable(acceptedSessions, false, true)
            : <p>لا توجد جلسات مقبولة.</p>}
        </div>

        <div className="session-section">
          <h3 className="session-title">تقويم الجلسات</h3>
          <div className="calendar-wrapper" dir="ltr">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              locale="ar-EG"
            />
          </div>
        </div>
      </div>

      {editPopup && (
        <div className="edit-popup">
          <div className="edit-form" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-center font-bold text-lg mb-4">تعديل الجلسة</h4>
            <input
              type="date"
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              className="input-field"
            />
            <input
              type="time"
              value={editData.time}
              onChange={(e) => setEditData({ ...editData, time: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="ملاحظة"
              value={editData.note}
              onChange={(e) => setEditData({ ...editData, note: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="السعر"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              className="input-field"
            />
            <div className="edit-actions">
              <button className="save-btn" onClick={handleUpdate}>حفظ</button>
              <button className="cancel-btn" onClick={() => setEditPopup(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Session;
