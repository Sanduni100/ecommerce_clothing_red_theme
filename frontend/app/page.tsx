"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProductCard, { Product } from "@/components/ProductCard";

const CATEGORY_TILES = [
  { label: "Dresses", slug: "dresses" },
  { label: "Tops", slug: "tops" },
  { label: "Trousers", slug: "trousers" },
  { label: "Outerwear", slug: "outerwear" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/products", { params: { featured: "true" } }).then((res) => setFeatured(res.data)).catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, #ef6b84 55%, #f9a4b3 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-white animate-fade-up">
            <p className="text-sm uppercase tracking-wide text-white/80 mb-3">New season edit</p>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-5">
              Wear your glow, every single day.
            </h1>
            <p className="text-white/90 max-w-md mb-8">
              Soft, durable fabrics cut for real movement — made for the woman who doesn't slow down.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-white px-7 py-3 rounded-full text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Shop the collection
            </Link>
          </div>
          <div className="relative h-72 md:h-96">
            <div className="absolute inset-0 rounded-xl2 bg-white/10 backdrop-blur-sm border border-white/20" />
            <div className="absolute inset-6 rounded-xl2 bg-white/15 border border-white/25 flex items-center justify-center text-white/70 font-display text-2xl">
              Lookbook
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_TILES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="rounded-xl2 card p-6 text-center hover:shadow-soft transition-shadow"
            >
              <p className="font-display text-lg">{c.label}</p>
              <p className="text-xs text-muted mt-1">Shop now</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl">Featured pieces</h2>
          <Link href="/shop" className="text-sm" style={{ color: "var(--accent)" }}>View all</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-muted">New arrivals are on their way — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
