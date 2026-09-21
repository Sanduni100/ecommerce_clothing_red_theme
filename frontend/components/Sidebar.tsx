"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Category = { id: number; name: string; slug: string };

export default function Sidebar({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sort,
  onSortChange,
}: {
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sort: string;
  onSortChange: (sort: string) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      <div>
        <h4 className="text-sm font-semibold mb-3">Category</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <button
              onClick={() => onCategoryChange("")}
              className={`text-muted hover:text-current ${!selectedCategory ? "font-semibold" : ""}`}
              style={!selectedCategory ? { color: "var(--accent)" } : {}}
            >
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onCategoryChange(c.slug)}
                className={`text-muted hover:text-current ${selectedCategory === c.slug ? "font-semibold" : ""}`}
                style={selectedCategory === c.slug ? { color: "var(--accent)" } : {}}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Price range</h4>
        <input
          type="range"
          min={0}
          max={300}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([0, Number(e.target.value)])}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>$0</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Sort by</h4>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="">Newest first</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}
