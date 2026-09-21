"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import api, { apiErrorMessage } from "@/lib/api";
import ProductCard, { Product } from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<(Product & { favorite_id: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/favorites").then((res) => setFavorites(res.data)).catch((err) => toast.error(apiErrorMessage(err))).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <Heart size={40} className="mx-auto mb-4 text-muted" />
        <h1 className="font-display text-2xl mb-2">Sign in to see your wishlist</h1>
        <Link href="/login" className="inline-block mt-4 rounded-full px-6 py-3 text-sm text-white" style={{ background: "var(--accent)" }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-2xl mb-8">My wishlist</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-muted">You haven't saved any favourites yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {favorites.map((p) => <ProductCard key={p.favorite_id} product={p} />)}
        </div>
      )}
    </div>
  );
}
