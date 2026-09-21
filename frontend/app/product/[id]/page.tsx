"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import api, { apiErrorMessage } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/format";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
function imageUrl(path?: string) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("/placeholder")) return path;
  return `${API_ORIGIN}${path}`;
}

type ProductDetail = {
  id: number; name: string; description: string; price: number;
  compare_at_price?: number | null; images: string[]; sizes: string; colors: string; stock: number;
};

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      const sizes = (res.data.sizes || "").split(",").filter(Boolean);
      if (sizes.length) setSize(sizes[0]);
      const colors = (res.data.colors || "").split(",").filter(Boolean);
      if (colors.length) setColor(colors[0]);
    }).catch(() => setProduct(null));
  }, [id]);

  async function toggleFavorite() {
    if (!user) return toast.error("Please sign in to save favourites");
    try {
      await api.post("/favorites", { product_id: Number(id) });
      toast.success("Added to favourites");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (!product) return <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-muted">Loading product…</div>;

  const sizes = (product.sizes || "").split(",").filter(Boolean);
  const colors = (product.colors || "").split(",").filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-2 gap-12">
      <div>
        <div className="relative aspect-[3/4] rounded-xl2 overflow-hidden card">
          <Image src={imageUrl(product.images[activeImage])} alt={product.name} fill className="object-cover" />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 mt-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 ${idx === activeImage ? "" : "opacity-70"}`}
                style={{ borderColor: idx === activeImage ? "var(--accent)" : "var(--border)" }}
              >
                <Image src={imageUrl(img)} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl mb-2">{product.name}</h1>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl" style={{ color: "var(--accent)" }}>{formatPrice(product.price, currency)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted line-through">{formatPrice(product.compare_at_price, currency)}</span>
          )}
        </div>
        <p className="text-sm text-muted leading-relaxed mb-8">{product.description}</p>

        {sizes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Size</p>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className="w-10 h-10 rounded-full border text-sm"
                  style={{ borderColor: size === s ? "var(--accent)" : "var(--border)", color: size === s ? "var(--accent)" : undefined }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Colour</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="px-3 py-1.5 rounded-full border text-xs"
                  style={{ borderColor: color === c ? "var(--accent)" : "var(--border)", color: color === c ? "var(--accent)" : undefined }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-8 border rounded-full px-3 py-2 w-fit" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">+</button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => addToCart(product.id, quantity, size, color)}
            disabled={product.stock < 1}
            className="flex-1 rounded-full py-3 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {product.stock < 1 ? "Out of stock" : "Add to bag"}
          </button>
          <button onClick={toggleFavorite} aria-label="Add to favourites" className="w-12 h-12 rounded-full border flex items-center justify-center" style={{ borderColor: "var(--border)" }}>
            <Heart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
