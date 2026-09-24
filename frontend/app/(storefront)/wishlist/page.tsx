"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist-store";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const isLoggedIn = useAuth((state) => state.isLoggedIn());
  const ids = useWishlist((state) => state.productIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.replace("/login?redirect=/wishlist"); return; }
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;
  const savedProducts = products.filter((product) => ids.includes(product.id));

  return <div className="mx-auto max-w-[1600px] px-5 py-12 lg:px-12">
    <p className="font-mono text-xs uppercase tracking-widest2 text-amber-dim">Your edit</p>
    <h1 className="mt-2 font-display text-5xl tracking-tightest text-ink md:text-6xl">WISHLIST</h1>
    <p className="mt-3 text-sm text-ink-60">{ids.length} saved item{ids.length === 1 ? "" : "s"}</p>
    {loading ? <p className="mt-12 font-mono text-sm text-ink-60">Loading your saved pieces…</p> : savedProducts.length ? (
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">{savedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    ) : <div className="mt-10 flex min-h-72 flex-col items-center justify-center border border-dashed border-ink/20 px-6 text-center"><Heart size={30} className="text-amber-dim" /><h2 className="mt-4 font-heading text-2xl font-bold">YOUR WISHLIST IS WAITING</h2><p className="mt-2 max-w-sm text-sm text-ink-60">Save the pieces you love to find them quickly later.</p><Link href="/products" className="mt-6 inline-flex items-center gap-2 bg-ink px-5 py-3 font-heading font-bold text-chalk hover:bg-amber hover:text-ink">EXPLORE PRODUCTS <ArrowRight size={17} /></Link></div>}
  </div>;
}
