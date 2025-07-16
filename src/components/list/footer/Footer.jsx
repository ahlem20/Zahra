import React, { useState, useEffect } from "react";
import "./footer.css";
import { LuWallet } from "react-icons/lu";
import { IoLogOutOutline } from "react-icons/io5";
import Wallet from "./wallet/Wallet";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const [addMony, setAddMony] = useState(false);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("chat-user"));

  const fetchWalletBalance = async () => {
    if (!user) return;

    try {
      const response = await axios.get(`https://zahrabackend.onrender.com/wallet/${user.id}`);
      setBalance(response.data.wallet.balance);
    } catch (err) {
      console.error("Failed to fetch wallet:", err.message);
      setBalance(0); // fallback
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, [addMony]); // refetch when wallet popup closes or opens

  const handleLogout = async () => {
    try {
      await axios.post("https://zahrabackend.onrender.com/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("chat-user");
      console.log("Logged out successfully");
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="footer">
      <div className="wallet" onClick={() => setAddMony((prev) => !prev)}>
        <LuWallet size={28} />
        <div className="walletInfo">
          <span>My Wallet</span>
          <p>{balance.toFixed(2)} DA</p>
        </div>
      </div>
  
      {/* Line Divider */}
      <div className="divider"></div>
  
      <div className="icona" onClick={handleLogout}>
        <IoLogOutOutline size={28} />
      </div>
  
      {addMony && <Wallet />}
    </div>
  );
  
};

export default Footer;
