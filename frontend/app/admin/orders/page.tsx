"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { apiErrorMessage } from "@/lib/api";

type Order = {
  id: number; total: number; status: string; created_at: string;
  customer_name: string; customer_email: string;
};

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  function load() {
    api.get("/orders").then((res) => setOrders(res.data)).catch(() => setOrders([]));
  }
  useEffect(load, []);

  async function updateStatus(id: number, status: string) {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Order updated");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update order"));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Orders</h1>
      <div className="card rounded-xl2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b" style={{ borderColor: "var(--border)" }}>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                <td className="p-4">#{o.id}</td>
                <td className="p-4">
                  <p>{o.customer_name}</p>
                  <p className="text-xs text-muted">{o.customer_email}</p>
                </td>
                <td className="p-4">${Number(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="rounded-lg border bg-transparent px-2 py-1.5 text-xs capitalize"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
