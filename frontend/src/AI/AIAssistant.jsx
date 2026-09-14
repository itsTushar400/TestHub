import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AIAssistant.css";

const API_URL = "${import.meta.env.VITE_API_URL}";

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [doubt, setDoubt] = useState("");
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAskAI = async () => {
    const question = doubt.trim();

    if (!question || aiLoading) return;

    // User message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    setDoubt("");
    setAiLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/doubt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doubt: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "AI response failed"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "No answer received.",
        },
      ]);
    } catch (error) {
      console.error("AI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `❌ ${error.message}`,
          error: true,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setDoubt("");
  };

  const copyAnswer = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="ai-floating-button"
          onClick={() => setIsOpen(true)}
          title="AI Doubt Solver"
        >
          <span>🤖</span>
        </button>
      )}

      {/* AI Window */}
      {isOpen && (
        <div className="ai-popup">

          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-avatar">
                🤖
              </div>

              <div>
                <h3>AI Doubt Solver</h3>

                <div className="ai-status">
                  <span className="status-dot"></span>
                  Online
                </div>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                onClick={clearChat}
                title="Clear chat"
              >
                🗑️
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="ai-chat">

            {/* Welcome */}
            {messages.length === 0 && (
              <div className="ai-welcome">
                <div className="welcome-icon">
                  🤖
                </div>

                <h2>Hi! I'm your AI Assistant</h2>

                <p>
                  Ask me anything about your test,
                  programming, mathematics, aptitude
                  or other educational topics.
                </p>

                <div className="suggestions">

                  <button
                    onClick={() =>
                      setDoubt("What is React.js?")
                    }
                  >
                    💻 What is React.js?
                  </button>

                  <button
                    onClick={() =>
                      setDoubt(
                        "Explain JavaScript variables"
                      )
                    }
                  >
                    🧠 Explain JavaScript
                  </button>

                  <button
                    onClick={() =>
                      setDoubt(
                        "How can I improve my aptitude?"
                      )
                    }
                  >
                    📚 Aptitude tips
                  </button>

                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${
                  message.role === "user"
                    ? "user-row"
                    : "ai-row"
                }`}
              >

                {message.role === "ai" && (
                  <div className="message-avatar">
                    🤖
                  </div>
                )}

                <div
                  className={`message-bubble ${
                    message.role === "user"
                      ? "user-message"
                      : "ai-message"
                  } ${
                    message.error ? "error-message" : ""
                  }`}
                >
                  <div className="message-text">
  {message.role === "ai" ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {message.text}
    </ReactMarkdown>
  ) : (
    message.text
  )}
</div>

                  {message.role === "ai" &&
                    !message.error && (
                      <button
                        className="copy-btn"
                        onClick={() =>
                          copyAnswer(message.text)
                        }
                        title="Copy answer"
                      >
                        📋 Copy
                      </button>
                    )}
                </div>

                {message.role === "user" && (
                  <div className="message-avatar user-avatar">
                    👤
                  </div>
                )}

              </div>
            ))}

            {/* Typing */}
            {aiLoading && (
              <div className="message-row ai-row">
                <div className="message-avatar">
                  🤖
                </div>

                <div className="message-bubble ai-message">
                  <div className="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <small>AI is thinking...</small>
                </div>
              </div>
            )}

          </div>

          {/* Input */}
          <div className="ai-input-area">

            <textarea
              value={doubt}
              onChange={(e) =>
                setDoubt(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask your doubt..."
              rows="2"
              disabled={aiLoading}
            />

            <button
              className="send-btn"
              onClick={handleAskAI}
              disabled={
                aiLoading || !doubt.trim()
              }
              title="Send"
            >
              {aiLoading ? "..." : "➤"}
            </button>

          </div>

          <div className="ai-footer">
            AI can make mistakes. Check important answers.
          </div>

        </div>
      )}
    </>
  );
}

export default AIAssistant;
