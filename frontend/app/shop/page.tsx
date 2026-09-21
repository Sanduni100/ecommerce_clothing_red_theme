"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ProductCard, { Product } from "@/components/ProductCard";
import Sidebar from "@/components/Sidebar";
import { SlidersHorizontal } from "lucide-react";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10 text-sm text-muted">Loading…</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", {
        params: {
          category: category || undefined,
          search: search || undefined,
          sort: sort || undefined,
          maxPrice: priceRange[1],
        },
      })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, priceRange, search]);

  function changeCategory(slug: string) {
    setCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug); else params.delete("category");
    router.replace(`/shop?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">{search ? `Results for "${search}"` : "Shop all"}</h1>
          <p className="text-sm text-muted mt-1">{products.length} items</p>
        </div>
        <button className="md:hidden flex items-center gap-2 text-sm border rounded-full px-3 py-2" style={{ borderColor: "var(--border)" }} onClick={() => setMobileFiltersOpen((o) => !o)}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className={`${mobileFiltersOpen ? "block" : "hidden"} md:block`}>
          <Sidebar
            selectedCategory={category}
            onCategoryChange={changeCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <div className="flex-1">
          {loading ? (
            <p className="text-sm text-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted">No products match your filters yet. Try widening your search.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
