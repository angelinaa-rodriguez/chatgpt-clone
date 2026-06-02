import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, {
        messages: updatedMessages,
      });

      setMessages([...updatedMessages, res.data.reply]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>ChatGPT Clone</h1>
      </header>

      <div className="messages">
        {messages.length === 0 && (
          <p className="empty-state">
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <span className="bubble">{msg.content}</span>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="bubble typing">Thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT Clone… (Enter to send)"
          rows={2}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
