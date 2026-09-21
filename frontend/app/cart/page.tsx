"use client";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/format";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
function imageUrl(path?: string | null) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("/placeholder")) return path;
  return `${API_ORIGIN}${path}`;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { currency } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">Your bag is empty</h1>
        <p className="text-sm text-muted mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/shop" className="inline-block rounded-full px-6 py-3 text-sm text-white" style={{ background: "var(--accent)" }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-5">
        <h1 className="font-display text-2xl mb-4">Your bag</h1>
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 card rounded-xl2 p-4">
            <div className="relative w-24 h-28 rounded-lg overflow-hidden shrink-0">
              <Image src={imageUrl(item.image)} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">{item.name}</p>
                <button onClick={() => removeItem(item.id)} aria-label="Remove"><Trash2 size={16} /></button>
              </div>
              {(item.size || item.color) && (
                <p className="text-xs text-muted mt-1">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 border rounded-full px-3 py-1.5" style={{ borderColor: "var(--border)" }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus size={13} /></button>
                  <span className="text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={13} /></button>
                </div>
                <span style={{ color: "var(--accent)" }}>{formatPrice(item.price * item.quantity, currency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card rounded-xl2 p-6 h-fit">
        <h2 className="font-display text-lg mb-4">Order summary</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">Subtotal</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-muted">Shipping</span>
          <span className="text-muted">Calculated at checkout</span>
        </div>
        <div className="flex justify-between font-semibold mb-6 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
        <Link href="/checkout" className="block text-center rounded-full py-3 text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
