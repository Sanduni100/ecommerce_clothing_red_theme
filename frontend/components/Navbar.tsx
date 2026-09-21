"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Heart, ShoppingBag, Sun, Moon, User, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=dresses", label: "Dresses" },
  { href: "/shop?category=tops", label: "Tops" },
  { href: "/wishlist", label: "Wishlist" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { currency, toggleCurrency } = useCurrency();
  const { user, logout } = useAuth();
  const { count, openCart } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shop?search=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-elevated/90 backdrop-blur border-b" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Open menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="font-display text-2xl tracking-tight" style={{ color: "var(--accent)" }}>
            Lumine
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="text-muted hover:text-current transition-colors">
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin" className="text-muted hover:text-current transition-colors">Admin</Link>
            )}
          </nav>

          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for clothes..."
                className="w-full rounded-full border bg-transparent pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <button onClick={toggleCurrency} className="hidden sm:block text-xs font-medium px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)" }} title="Switch currency">
              {currency}
            </button>
            <button onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:block">
              <Heart size={19} />
            </Link>
            <button onClick={openCart} aria-label="Cart" className="relative">
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 text-[10px] rounded-full w-4 h-4 flex items-center justify-center text-white" style={{ background: "var(--accent-strong)" }}>
                  {count}
                </span>
              )}
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/orders" className="text-sm text-muted hover:text-current">Orders</Link>
                <button onClick={logout} className="flex items-center gap-1 text-sm text-muted">
                  <User size={17} /> {user.name.split(" ")[0]}
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex items-center gap-1 text-sm text-muted">
                <User size={17} /> Sign in
              </Link>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3 animate-fade-up">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for clothes..."
                className="w-full rounded-full border bg-transparent pl-9 pr-3 py-2 text-sm outline-none"
                style={{ borderColor: "var(--border)" }}
              />
            </form>
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm text-muted">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-sm text-muted">Orders</Link>
                <button onClick={logout} className="text-sm text-left text-muted">Sign out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted">Sign in</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
