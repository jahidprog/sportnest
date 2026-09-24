"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

type SortOption = "default" | "price-asc" | "price-desc";

function ProductsGridInner({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("default");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Deep-linkable category filter — a homepage category tile or a link
  // like /products?category=jerseys should land pre-filtered, not just
  // dump the visitor on the full unfiltered catalog.
  useEffect(() => {
    const slug = searchParams.get("category");
    if (!slug) {
      setActiveCategory(null);
      return;
    }
    const match = categories.find((c) => c.slug === slug);
    setActiveCategory(match?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categories.length]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Search, sort, and category filtering all happen client-side because
  // the backend's GET /products doesn't support query params yet — it
  // always returns the full list.
  const visible = useMemo(() => {
    let list = products;
    if (activeCategory !== null) {
      list = list.filter((p) => p.category_id === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, query, sort, activeCategory]);

  if (products.length === 0) {
    return (
      <div className="py-24 text-center border border-ink/10">
        <p className="font-heading font-bold text-lg text-ink">No products yet.</p>
        <p className="text-ink-60 mt-2 text-sm">
          Add some through the API (or the admin dashboard, once it&apos;s built).
        </p>
      </div>
    );
  }

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 font-heading font-bold text-sm tracking-wide transition-all duration-200 ${
              activeCategory === null
                ? "bg-ink text-chalk scale-[1.03]"
                : "bg-transparent text-ink-60 hover:text-ink hover:border-ink border border-ink/15"
            }`}
          >
            ALL
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 font-heading font-bold text-sm tracking-wide transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-ink text-chalk scale-[1.03]"
                  : "bg-transparent text-ink-60 hover:text-ink hover:border-ink border border-ink/15"
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-10 border-b border-ink/10 pb-8">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-60"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 border border-ink/20 bg-chalk focus:border-ink outline-none text-sm transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 border border-ink/20 bg-chalk outline-none text-sm font-heading font-bold"
        >
          <option value="default">Default order</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-heading font-bold text-xl text-ink">
            No products match your filters.
          </p>
        </div>
      ) : (
        <div
          key={`${activeCategory}-${sort}-${query}`}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 animate-grid-in"
        >
          {visible.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function ProductsGrid(props: { products: Product[]; categories: Category[] }) {
  return (
    <Suspense fallback={null}>
      <ProductsGridInner {...props} />
    </Suspense>
  );
}
