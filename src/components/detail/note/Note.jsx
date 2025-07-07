import { useEffect, useState } from "react";
import axios from "axios";
import "./note.css";
import useConversation from "../../../zustand/useConversation";

const Note = () => {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);

  const user = JSON.parse(localStorage.getItem("chat-user"));
  const { selectedUser } = useConversation();
  const storedConversation = JSON.parse(localStorage.getItem("selected-conversation"));

  const userId = user?._id || user?.id;
  const isGroup = selectedUser?.type === "group";
  const conversationId = !isGroup ? selectedUser?._id : null;
  const groupId = isGroup ? storedConversation?._id : null;

  useEffect(() => {
    const fetchNotes = async () => {
      const id = isGroup ? groupId : conversationId;
      if (!id) return;

      try {
        const res = await axios.get(
          `http://localhost:3500/note/${isGroup ? "group" : "conversation"}/${id}`
        );
        setNotes(res.data);
      } catch (err) {
        console.error("فشل في جلب الملاحظات", err);
      }
    };

    fetchNotes();
  }, [conversationId, groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId || (!conversationId && !groupId)) return;

    try {
      if (editId) {
        await axios.patch(`http://localhost:3500/note/${editId}`, { text: input });
        setEditId(null);
      } else {
        await axios.post("http://localhost:3500/note", {
          text: input,
          userId,
          ...(isGroup ? { groupId } : { conversationId }),
        });
      }

      setInput("");
      const fetchNotes = async () => {
        const id = isGroup ? groupId : conversationId;
        if (!id) return;

        try {
          const res = await axios.get(
            `http://localhost:3500/note/${isGroup ? "group" : "conversation"}/${id}`
          );
          setNotes(res.data);
        } catch (err) {
          console.error("فشل في جلب الملاحظات", err);
        }
      };
      fetchNotes();
    } catch (err) {
      console.error("خطأ في حفظ الملاحظة", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3500/note/${id}`);
      setNotes(notes.filter(note => note._id !== id));
    } catch (err) {
      console.error("خطأ في حذف الملاحظة", err);
    }
  };

  const handleEdit = (note) => {
    setInput(note.text);
    setEditId(note._id);
  };

  return (
    <div className="note-overlay" dir="rtl">
      <div className="note-container">
        <h2 className="note-title">{editId ? "تعديل الملاحظة" : "إضافة ملاحظة"}</h2>

        <form className="note-form" onSubmit={handleSubmit}>
          <textarea
            className="note-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب ملاحظتك هنا..."
          />
          <button type="submit" className="note-button">
            {editId ? "تحديث" : "إضافة"}
          </button>
        </form>

        <div className="note-list">
          <h3 className="note-list-title">ملاحظاتك</h3>
          {notes.length === 0 ? (
            <p className="note-empty">لا توجد ملاحظات بعد</p>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="note-item">
                <p>{note.text}</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: "8px",
                    marginTop: "5px",
                  }}
                >
                  <button
                    onClick={() => handleEdit(note)}
                    className="note-button"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="note-button"
                    style={{
                      backgroundColor: "#f44336",
                      padding: "4px 10px",
                      fontSize: "12px",
                    }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Note;
