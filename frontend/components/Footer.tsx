import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className="font-display text-xl mb-3" style={{ color: "var(--accent)" }}>Lumine</h3>
          <p className="text-sm text-muted max-w-xs">
            Soft, durable, thoughtfully made womenswear — designed to move with you.
          </p>
          <div className="flex gap-3 mt-4 text-muted">
            <Instagram size={18} /> <Facebook size={18} /> <Twitter size={18} />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/shop?category=dresses">Dresses</Link></li>
            <li><Link href="/shop?category=tops">Tops</Link></li>
            <li><Link href="/shop?category=trousers">Trousers</Link></li>
            <li><Link href="/shop?category=accessories">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/wishlist">My wishlist</Link></li>
            <li><Link href="/orders">My orders</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Stay in the loop</h4>
          <p className="text-sm text-muted mb-3">New arrivals and offers, no spam.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex">
            <input
              placeholder="Email address"
              className="flex-1 rounded-l-full border px-3 py-2 text-sm bg-transparent outline-none"
              style={{ borderColor: "var(--border)" }}
            />
            <button
              className="rounded-r-full px-4 text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted" style={{ borderColor: "var(--border)" }}>
        © {new Date().getFullYear()} Lumine. All rights reserved.
      </div>
    </footer>
  );
}
