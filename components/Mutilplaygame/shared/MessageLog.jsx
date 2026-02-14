// components/MessageLog.jsx
import React from "react";

export default function MessageLog({ messages }) {
  if (!Array.isArray(messages)) {
    return <div className="message-log">⛔ Log chưa load đúng dạng.</div>;
  }

  if (messages.length === 0) {
    return <div className="message-log">Không có dòng log nào.</div>;
  }

  return (
    <>
      <style>{`
  @media (max-height: 500px) {
    .message-log {
      display: none !important;
    }
  }
`}</style>

      <div
        className="message-log"
        style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6,
          maxHeight: 150,
          overflowY: "auto",
        }}
      >
        {[...messages].reverse().map((msg, i) => (
          <div key={i}>
            🔸 {typeof msg === "string" ? msg : JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </>
  );
}
