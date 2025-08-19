import React, { useMemo, useState } from "react";

function HistoryDrawer({
  open,
  onClose,
  history = [],
  onSelectHistory,
  onClearHistory,
}) {
  const [expandedGroup, setExpandedGroup] = useState(null);

  // Group chats for display
  const groupedHistory = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) return [];
    return history.map((chat, idx) => ({
      preview: chat.preview || `Conversation ${idx + 1}`,
      items: chat.fullChat || [],
    }));
  }, [history]);

  return (
    <div className={`history-drawer ${open ? "open" : ""}`}>
      {/* Header */}
      <div className="history-header">
        <h3>🕘 Chat History</h3>
        <div className="history-header-actions">
          {history.length > 0 && (
            <button className="history-clear-btn" onClick={onClearHistory}>
              🗑 Clear All
            </button>
          )}
          <button className="history-close-btn" onClick={onClose}>
            ✖
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="history-content">
        {groupedHistory.length === 0 ? (
          <p style={{ color: "#888" }}>No history yet.</p>
        ) : (
          groupedHistory.map((group, idx) => (
            <div key={idx} className="history-group">
              {/* Group Preview */}
              <div
                className="history-group-header"
                onClick={() =>
                  setExpandedGroup(expandedGroup === idx ? null : idx)
                }
                style={{
                  cursor: "pointer",
                  background: "#f2f2f2",
                  padding: "8px",
                  borderRadius: "5px",
                  marginBottom: "5px",
                }}
              >
                <span>{group.preview}</span>
                <span className="history-count">({group.items.length})</span>
                <span className="history-toggle">
                  {expandedGroup === idx ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded Items */}
              {expandedGroup === idx && (
                <div
                  className="history-group-items"
                  style={{ marginLeft: "10px" }}
                >
                  {group.items.map((msg, i) => (
                    <div
                      key={i}
                      className={`history-item history-item-${msg.sender}`}
                      onClick={() => onSelectHistory(group)}
                      style={{
                        padding: "5px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                      }}
                    >
                      <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryDrawer;
