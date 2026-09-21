"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import api from "@/lib/api";

type Faq = { id: number; question: string; answer: string };

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/chat/faqs").then((res) => setFaqs(res.data)).catch(() => setFaqs([]));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Frequently asked questions</h1>
      <p className="text-sm text-muted mb-10">
        Can't find what you need? Open the chat in the bottom-right corner and ask us directly.
      </p>
      <div className="space-y-3">
        {faqs.map((f) => {
          const isOpen = openId === f.id;
          return (
            <div key={f.id} className="card rounded-xl2 overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : f.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium"
              >
                {f.question}
                <ChevronDown size={16} className={`transition-transform shrink-0 ml-3 ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--accent)" }} />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-muted leading-relaxed animate-fade-up">{f.answer}</div>
              )}
            </div>
          );
        })}
        {faqs.length === 0 && <p className="text-sm text-muted">No FAQs published yet.</p>}
      </div>
    </div>
  );
}
