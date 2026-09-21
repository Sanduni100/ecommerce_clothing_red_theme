"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import api from "@/lib/api";

type Faq = { id: number; question: string; answer: string };
type Msg = { from: "bot" | "user"; text: string };

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! I'm the Lumine assistant. Pick a topic below or type your question." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && faqs.length === 0) {
      api.get("/chat/faqs").then((res) => setFaqs(res.data)).catch(() => setFaqs([]));
    }
  }, [open, faqs.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post("/chat/ask", { message: text });
      setMessages((m) => [...m, { from: "bot", text: data.answer }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Sorry, I'm having trouble replying right now. Please try again shortly." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[320px] max-h-[480px] rounded-2xl card shadow-soft flex flex-col overflow-hidden animate-fade-up" style={{ background: "var(--bg-elevated)" }}>
          <div className="px-4 py-3 text-white flex items-center justify-between" style={{ background: "var(--accent)" }}>
            <span className="text-sm font-semibold">Lumine Support</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl ${m.from === "user" ? "ml-auto text-white" : "card"}`}
                style={m.from === "user" ? { background: "var(--accent-strong)" } : {}}>
                {m.text}
              </div>
            ))}
            {sending && <div className="text-xs text-muted">Typing…</div>}
            <div ref={endRef} />
          </div>

          {faqs.length > 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {faqs.slice(0, 4).map((f) => (
                <button
                  key={f.id}
                  onClick={() => sendMessage(f.question)}
                  className="text-[11px] px-2.5 py-1.5 rounded-full border text-muted hover:text-current"
                  style={{ borderColor: "var(--border)" }}
                >
                  {f.question}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2 border-t px-3 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button type="submit" aria-label="Send message" style={{ color: "var(--accent)" }}>
              <Send size={17} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open live chat"
        className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-soft"
        style={{ background: "var(--accent)" }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
