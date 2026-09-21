"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";
import api, { apiErrorMessage } from "@/lib/api";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
function imageUrl(path?: string) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("/placeholder")) return path;
  return `${API_ORIGIN}${path}`;
}

type Category = { id: number; name: string; slug: string };
type Product = {
  id: number; name: string; price: number; stock: number; category_name?: string;
  images: string[]; description: string; sizes: string; colors: string; compare_at_price?: number | null; featured: number;
};

const EMPTY_FORM = { name: "", description: "", price: "", compare_at_price: "", category_id: "", stock: "10", sizes: "S,M,L,XL", colors: "", featured: false };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  function loadProducts() {
    api.get("/products").then((res) => setProducts(res.data)).catch(() => setProducts([]));
  }

  useEffect(() => {
    loadProducts();
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Name and price are required");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === "boolean" ? (v ? "1" : "0") : String(v)));
      files.forEach((f) => fd.append("images", f));
      await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Product created");
      setForm(EMPTY_FORM);
      setFiles([]);
      setFormOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create product"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete product"));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Products</h1>
        <button
          onClick={() => setFormOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white"
          style={{ background: "var(--accent)" }}
        >
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "Add product"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="card rounded-xl2 p-6 mb-8 grid md:grid-cols-2 gap-4">
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm md:col-span-2" style={{ borderColor: "var(--border)" }} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm md:col-span-2" rows={3} style={{ borderColor: "var(--border)" }} />
          <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <input type="number" step="0.01" placeholder="Compare-at price (optional)" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <input placeholder="Sizes (comma separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />
          <input placeholder="Colours (comma separated)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="rounded-lg border bg-transparent px-3 py-2.5 text-sm" style={{ borderColor: "var(--border)" }} />

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Feature on homepage
          </label>

          <div className="md:col-span-2">
            <label className="text-sm font-medium block mb-2">Product images (you can select multiple)</label>
            <input
              type="file" multiple accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="text-sm"
            />
            {files.length > 0 && <p className="text-xs text-muted mt-2">{files.length} image(s) selected</p>}
          </div>

          <button type="submit" disabled={saving} className="md:col-span-2 rounded-full py-3 text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>
            {saving ? "Saving…" : "Create product"}
          </button>
        </form>
      )}

      <div className="card rounded-xl2 divide-y" style={{ borderColor: "var(--border)" }}>
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="relative w-14 h-16 rounded-lg overflow-hidden shrink-0">
              <Image src={imageUrl(p.images?.[0])} alt={p.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted">{p.category_name || "Uncategorised"} · {p.images?.length || 0} image(s) · stock {p.stock}</p>
            </div>
            <span className="text-sm" style={{ color: "var(--accent)" }}>${Number(p.price).toFixed(2)}</span>
            <button onClick={() => handleDelete(p.id)} aria-label="Delete product" className="text-muted">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-muted p-4">No products yet — add your first one above.</p>}
      </div>
    </div>
  );
}
