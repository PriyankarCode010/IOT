"use client";
import { useState } from "react";

export default function Reply() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    if (!message) return;

    const res = await fetch("/api/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setStatus("✅ Message sent!");
    setMessage("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>💌 Send Her a Message</h1>
      <input
        type="text"
        placeholder="Your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ padding: "0.5rem", width: "300px", marginRight: "1rem" }}
      />
      <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>
        Send
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
