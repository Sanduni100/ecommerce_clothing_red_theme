"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";
import api, { apiErrorMessage } from "@/lib/api";

type Faq = { id: number; question: string; answer: string; keywords: string; sort_order: number };
const EMPTY = { question: "", answer: "", keywords: "", sort_order: "0" };

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/chat/faqs").then((res) => setFaqs(res.data)).catch(() => setFaqs([]));
  }
  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question || !form.answer) return toast.error("Question and answer are required");
    setSaving(true);
    try {
      await api.post("/chat/faqs", form);
      toast.success("FAQ added — the chat bot will start using it right away");
      setForm(EMPTY);
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not add FAQ"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await api.delete(`/chat/faqs/${id}`);
      toast.success("FAQ deleted");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete FAQ"));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Live chat FAQ</h1>
          <p className="text-sm text-muted mt-1">These power the auto-answers customers get in the chat widget.</p>
        </div>
        <button onClick={() => setFormOpen((o) => !o)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white" style={{ background: "var(--accent)" }}>
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "Add FAQ"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="card rounded-xl2 p-6 mb-8 space-y-4">
          <input required placeholder="Question shown to customers" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <textarea required placeholder="Auto-reply answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3}
            className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <input placeholder="Trigger keywords, comma separated (e.g. shipping,delivery,when)" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <button type="submit" disabled={saving} className="rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>
            {saving ? "Saving…" : "Save FAQ"}
          </button>
        </form>
      )}

      <div className="card rounded-xl2 divide-y" style={{ borderColor: "var(--border)" }}>
        {faqs.map((f) => (
          <div key={f.id} className="p-4 flex justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{f.question}</p>
              <p className="text-xs text-muted mt-1">{f.answer}</p>
              {f.keywords && <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>Keywords: {f.keywords}</p>}
            </div>
            <button onClick={() => handleDelete(f.id)} aria-label="Delete FAQ" className="text-muted shrink-0"><Trash2 size={16} /></button>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-sm text-muted p-4">No FAQs yet.</p>}
      </div>
    </div>
  );
}
