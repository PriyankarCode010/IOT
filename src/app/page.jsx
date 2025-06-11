"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/log")
      .then((res) => res.json())
      .then((data) => setLogs(data));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📋 Button Press Logs</h1>
      {logs.length === 0 ? (
        <p>No logs yet.</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              🕓 {log.timestamp} — 💬 {log.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
