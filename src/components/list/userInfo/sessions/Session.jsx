import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./session.css";

const Session = ({ onClose }) => {
  const user = JSON.parse(localStorage.getItem("chat-user"));
  const userId = user?.id;
  const userRole = user?.roles;

  const [pendingSessions, setPendingSessions] = useState([]);
  const [acceptedSessions, setAcceptedSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [pendingRes, acceptedRes] = await Promise.all([
          axios.get(`https://zahrabackend.onrender.com/session/pending/${userId}`),
          axios.get(`https://zahrabackend.onrender.com/session/accepted/${userId}`),
        ]);
        setPendingSessions(pendingRes.data || []);
        setAcceptedSessions(acceptedRes.data || []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchSessions();
  }, [userId]);

  const handleAccept = async (id) => {
    try {
      await axios.patch(`https://zahrabackend.onrender.com/session/accept/${id}`);
      setPendingSessions((prev) => prev.filter((s) => s._id !== id));
      const acceptedSession = pendingSessions.find((s) => s._id === id);
      setAcceptedSessions((prev) => [...prev, { ...acceptedSession, isAccepted: true }]);
    } catch (err) {
      console.error("Failed to accept session:", err);
    }
  };

  const renderTable = (sessions, showAccept = false) => (
    <table className="session-table">
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>الوقت</th>
          <th>ملاحظة</th>
          <th>السعر</th>
          <th>الحالة</th>
          {showAccept && <th>الإجراء</th>}
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <tr key={session._id}>
            <td>{session.date}</td>
            <td>{session.time}</td>
            <td>{session.note || "—"}</td>
            <td>{session.price || "—"}</td>
            <td>{session.isAccepted ? "مقبولة" : "قيد الانتظار"}</td>
            {showAccept && (
              <td>
                {!session.isAccepted && (
                  <button
                    className="accept-btn"
                    onClick={() => handleAccept(session._id)}
                  >
                    قبول
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

  const acceptedDates = acceptedSessions.map(s => new Date(s.date));

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isSessionDay = acceptedDates.some(d =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
      return isSessionDay ? 'session-day' : null;
    }
  };

  return (
    <div className="session-wrapper" onClick={onClose} dir="rtl">
      <div className="session-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="session-section">
          <h3 className="session-title">الجلسات قيد الانتظار</h3>
          {pendingSessions.length > 0 ? renderTable(pendingSessions, canAccept) : <p>لا توجد جلسات قيد الانتظار.</p>}
        </div>

        <div className="session-section">
          <h3 className="session-title">الجلسات المقبولة</h3>
          {acceptedSessions.length > 0 ? renderTable(acceptedSessions, false) : <p>لا توجد جلسات مقبولة.</p>}
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
    </div>
  );
};

export default Session;
