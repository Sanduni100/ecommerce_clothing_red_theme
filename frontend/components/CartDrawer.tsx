"use client";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/format";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
function imageUrl(path?: string | null) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("/placeholder")) return path;
  return `${API_ORIGIN}${path}`;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCart();
  const { currency } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div className="relative w-full max-w-md h-full bg-elevated flex flex-col animate-slide-in" style={{ background: "var(--bg-elevated)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display text-lg">Your bag ({items.length})</h3>
          <button onClick={closeCart} aria-label="Close cart"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && <p className="text-sm text-muted">Your bag is empty. Time to browse the new arrivals.</p>}
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 card">
                <Image src={imageUrl(item.image)} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <button onClick={() => removeItem(item.id)} aria-label="Remove item" className="text-muted shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
                {(item.size || item.color) && (
                  <p className="text-xs text-muted mt-0.5">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 border rounded-full px-2 py-1" style={{ borderColor: "var(--border)" }}>
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity">
                      <Minus size={13} />
                    </button>
                    <span className="text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-sm" style={{ color: "var(--accent)" }}>{formatPrice(item.price * item.quantity, currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t px-5 py-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{formatPrice(total, currency)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block text-center rounded-full py-3 text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
