import React, { useEffect, useState } from "react";
import axios from "axios";
import "./adminNotes.css";

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminNotes = async () => {
    try {
      const res = await axios.get("http://localhost:3500/note/admin");
      setNotes(res.data || []);
    } catch (error) {
      console.error("Error fetching admin notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminNotes();
  }, []);

  return (
    <div className="admin-notes-container">
      <h2>Messages to Admin</h2>

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note._id} className="note-card">
              <p className="note-text">{note.text}</p>
              <div className="note-meta">
                <span>From: {note.userId}</span>
                <span>{new Date(note.createdAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNotes;
