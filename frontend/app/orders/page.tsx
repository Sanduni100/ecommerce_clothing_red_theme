"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/format";

type OrderItem = { id: number; product_name: string; price: number; quantity: number; size?: string; color?: string };
type Order = { id: number; total: number; status: string; created_at: string; items: OrderItem[] };

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-600",
  paid: "text-emerald-600",
  shipped: "text-sky-600",
  delivered: "text-emerald-700",
  cancelled: "text-rose-600",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/orders/mine").then((res) => setOrders(res.data)).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-muted">Loading your orders…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <Package size={40} className="mx-auto mb-4 text-muted" />
        <h1 className="font-display text-2xl mb-2">Sign in to see your orders</h1>
        <Link href="/login" className="inline-block mt-4 rounded-full px-6 py-3 text-sm text-white" style={{ background: "var(--accent)" }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl mb-8">My orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted mb-4">You haven't placed any orders yet.</p>
          <Link href="/shop" className="inline-block rounded-full px-6 py-3 text-sm text-white" style={{ background: "var(--accent)" }}>Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.id} className="card rounded-xl2 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">Order #{o.id}</p>
                  <p className="text-xs text-muted">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium capitalize ${STATUS_STYLES[o.status] || "text-muted"}`}>{o.status}</span>
              </div>
              <div className="space-y-1.5 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-muted truncate pr-2">
                      {it.product_name} × {it.quantity}
                      {(it.size || it.color) && ` (${[it.size, it.color].filter(Boolean).join(", ")})`}
                    </span>
                    <span>{formatPrice(it.price * it.quantity, currency)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-sm mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span>Total</span>
                <span style={{ color: "var(--accent)" }}>{formatPrice(o.total, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
