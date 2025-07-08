import React, { useEffect, useState } from "react";
import axios from "axios";
import "./userActivation.css";

const UserActivation = () => {
  const [groupedUsers, setGroupedUsers] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://zahrabackend.onrender.com/users");
        const inactiveUsers = res.data.filter((user) => !user.active);

        // Group users by roles
        const grouped = inactiveUsers.reduce((acc, user) => {
          const role = user.roles || "unknown";
          if (!acc[role]) acc[role] = [];
          acc[role].push(user);
          return acc;
        }, {});

        setGroupedUsers(grouped);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);

  const activateUser = async (userId) => {
    try {
      await axios.patch(`https://zahrabackend.onrender.com/users/${userId}`, {
        active: true,
      });

      // Remove from local state
      setGroupedUsers((prev) => {
        const updated = {};
        for (const role in prev) {
          updated[role] = prev[role].filter((user) => user._id !== userId);
        }
        return updated;
      });
    } catch (err) {
      console.error("Activation failed", err);
    }
  };

  return (
    <div className="user-activation">
      <h2>Inactive Users</h2>

      {Object.keys(groupedUsers).length === 0 ? (
        <p>All users are active ✅</p>
      ) : (
        Object.entries(groupedUsers).map(([role, users]) => (
          <div key={role} className="role-group">
            <h3>{role.charAt(0).toUpperCase() + role.slice(1)}s</h3>
            <div className="table-wrapper">
              <table className="user-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  {role === "doctor" && <th>Diploma</th>}
                  <th>ID Front</th>
                  <th>ID Back</th>
                  <th>Holding ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {user.avatar && (
                        <img
                          src={`https://zahrabackend.onrender.com${user.avatar}`}
                          alt="avatar"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    {role === "doctor" && (
                      <td>
                        {user.diploma &&
                          (user.diploma.endsWith(".pdf") ? (
                            <a
                              href={`https://zahrabackend.onrender.com${user.diploma}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View PDF
                            </a>
                          ) : (
                            <img
                              src={`https://zahrabackend.onrender.com${user.diploma}`}
                              alt="Diploma"
                              style={{ width: "50px" }}
                            />
                          ))}
                      </td>
                    )}
                    <td>
                      {user.idCardFront && (
                        <img
                          src={`https://zahrabackend.onrender.com${user.idCardFront}`}
                          alt="ID Front"
                          style={{ width: "50px" }}
                        />
                      )}
                    </td>
                    <td>
                      {user.idCardBack && (
                        <img
                          src={`https://zahrabackend.onrender.com${user.idCardBack}`}
                          alt="ID Back"
                          style={{ width: "50px" }}
                        />
                      )}
                    </td>
                    <td>
                      {user.holdingIdCard && (
                        <img
                          src={`https://zahrabackend.onrender.com${user.holdingIdCard}`}
                          alt="Holding ID"
                          style={{ width: "50px" }}
                        />
                      )}
                    </td>
                    <td>
                      <button onClick={() => activateUser(user._id)}>
                        Activate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserActivation;
