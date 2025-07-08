// context/SocketContext.js

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [user] = useState(() => JSON.parse(localStorage.getItem("chat-user")));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const socketInstance = io("https://zahrabackend.onrender.com", {
        query: {
          userId: user._id || user.id,
        },
      });
  
      socketInstance.on("connect", () => {
        console.log("🟢 Socket connected:", socketInstance.id);
      });
  
      setSocket(socketInstance);
      return () => socketInstance.disconnect();
    }
  }, [user]);
  

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
