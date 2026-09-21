"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Stats = {
  totalOrders: number; totalRevenue: number; totalProducts: number; totalUsers: number;
  recentOrders: { id: number; total: number; status: string; created_at: string; customer_name: string }[];
  topProducts: { name: string; sold: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(() => setStats(null));
  }, []);

  if (!stats) return <p className="text-sm text-muted">Loading dashboard…</p>;

  const cards = [
    { label: "Total revenue", value: `$${Number(stats.totalRevenue).toFixed(2)}` },
    { label: "Orders", value: stats.totalOrders },
    { label: "Products", value: stats.totalProducts },
    { label: "Customers", value: stats.totalUsers },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card rounded-xl2 p-5">
            <p className="text-xs text-muted mb-1">{c.label}</p>
            <p className="text-2xl font-display">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-sm mb-3">Recent orders</h2>
          <div className="card rounded-xl2 divide-y" style={{ borderColor: "var(--border)" }}>
            {stats.recentOrders.length === 0 && <p className="text-sm text-muted p-4">No orders yet.</p>}
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">#{o.id} · {o.customer_name}</p>
                  <p className="text-xs text-muted">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p>${Number(o.total).toFixed(2)}</p>
                  <p className="text-xs capitalize text-muted">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-sm mb-3">Top-selling products</h2>
          <div className="card rounded-xl2 divide-y" style={{ borderColor: "var(--border)" }}>
            {stats.topProducts.length === 0 && <p className="text-sm text-muted p-4">No sales yet.</p>}
            {stats.topProducts.map((p) => (
              <div key={p.name} className="flex justify-between p-4 text-sm">
                <span>{p.name}</span>
                <span className="text-muted">{p.sold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
