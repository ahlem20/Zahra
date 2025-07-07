import React, { useState, useEffect } from "react";
import axios from "axios";
import "./wallet.css";

const Wallet = () => {
  const [form, setForm] = useState({
    userId: "",
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
    amount: ""
  });

  // ⬇️ Load user ID from localStorage when component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("chat-user"));
    if (user && user.id) {
      setForm((prev) => ({ ...prev, userId: user.id }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3500/wallet", form);
      alert("Wallet topped up! New balance: $" + response.data.wallet.balance);
    } catch (err) {
      console.error(err);
      alert("Top-up failed!");
    }
  };

  return (
    <div className="wallet-overlay">
      <div className="wallet-container">
        <h2 className="wallet-title">Top Up Your Wallet</h2>
        <form className="wallet-form" onSubmit={handleSubmit}>
          {/* Card Number */}
          <div className="wallet-form-group">
            <label className="wallet-label">Card Number</label>
            <input name="cardNumber" onChange={handleChange} className="wallet-input" />
          </div>

          {/* Card Holder */}
          <div className="wallet-form-group">
            <label className="wallet-label">Card Holder Name</label>
            <input name="cardHolder" onChange={handleChange} className="wallet-input" />
          </div>

          {/* Expiry and CVV */}
          <div className="wallet-form-row">
            <div className="wallet-form-group half-width">
              <label className="wallet-label">Expiry Date</label>
              <input name="expiry" onChange={handleChange} className="wallet-input" />
            </div>
            <div className="wallet-form-group half-width">
              <label className="wallet-label">CVV</label>
              <input name="cvv" type="password" onChange={handleChange} className="wallet-input" />
            </div>
          </div>

          {/* Amount */}
          <div className="wallet-form-group">
            <label className="wallet-label">Amount</label>
            <input name="amount" type="number" onChange={handleChange} className="wallet-input" />
          </div>

          <button type="submit" className="wallet-button">Top Up Now</button>
        </form>
      </div>
    </div>
  );
};

export default Wallet;
