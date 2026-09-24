"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { getRecentlyViewedIds } from "@/lib/utils/recently-viewed";
import { Carousel } from "@/components/ui/Carousel";
import { Reveal } from "@/components/ui/Reveal";
import ProductCard from "@/components/product/ProductCard";

export function RecentlyViewed({
  allProducts,
  excludeId,
}: {
  allProducts: Product[];
  excludeId?: number;
}) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewedIds(excludeId);
    const byId = new Map(allProducts.map((p) => [p.id, p]));
    setItems(ids.map((id) => byId.get(id)).filter((p): p is Product => !!p));
  }, [allProducts, excludeId]);

  // Genuinely nothing to show — most first-time visitors — so render
  // nothing rather than an empty section with a header and no content.
  if (items.length === 0) return null;

  return (
    <Reveal>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-wide text-ink mb-6">
          RECENTLY VIEWED
        </h2>
        <Carousel
          slideClassName="flex-[0_0_50%] sm:flex-[0_0_33.33%] lg:flex-[0_0_25%] pr-4"
          showDots={items.length > 4}
        >
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      </section>
    </Reveal>
  );
}
