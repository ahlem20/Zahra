import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthContextProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom"; // ✅ Import this
import { SocketContextProvider } from "./context/SocketContext";



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AuthContextProvider>
        <SocketContextProvider>
           <App />
        </SocketContextProvider>

        </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
