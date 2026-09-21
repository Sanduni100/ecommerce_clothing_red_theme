"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/faq", label: "Live chat FAQ", icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || user?.role !== "admin") {
    return <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-muted">Checking admin access…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 flex gap-10">
      <aside className="w-52 shrink-0 space-y-1">
        <h2 className="font-display text-lg mb-4">Admin panel</h2>
        {LINKS.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={active ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-muted)" }}
            >
              <Icon size={16} /> {l.label}
            </Link>
          );
        })}
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
