"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/format";
import api, { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  images: string[];
  category_name?: string;
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function imageUrl(path?: string) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("/placeholder")) return path;
  return `${API_ORIGIN}${path}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { currency } = useCurrency();
  const { user } = useAuth();

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to save favourites");
    try {
      await api.post("/favorites", { product_id: product.id });
      toast.success("Added to favourites");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update favourites"));
    }
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl2 card">
        <Image
          src={imageUrl(product.images?.[0])}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={toggleFavorite}
          aria-label="Add to favourites"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 text-rose-600 shadow"
        >
          <Heart size={15} />
        </button>
        {product.compare_at_price && (
          <span className="absolute top-3 left-3 text-[11px] font-medium text-white px-2 py-1 rounded-full" style={{ background: "var(--accent-strong)" }}>
            Sale
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm" style={{ color: "var(--accent)" }}>{formatPrice(product.price, currency)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-muted line-through">{formatPrice(product.compare_at_price, currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
