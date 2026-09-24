import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts, getCategories } from "@/lib/api";
import { WHATSAPP_LINK } from "@/lib/constants";
import ProductCard from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";
import { CategoryShowcase, MatchdayCampaigns, ShopTheEdit } from "@/components/storefront/CategoryShowcase";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";
import { Reveal } from "@/components/ui/Reveal";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let loadError = false;
  try {
    products = await getProducts();
  } catch {
    loadError = true;
  }
  const categories = await getCategories();

  // Real signal, not fabricated "trending" data — sorted by id descending
  // is literally "newest first" since IDs are assigned in creation order.
  const newArrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 8);

  return (
    <>
      <HeroCarousel />

   <section className="py-8 lg:py-8">
  {/* Section Header */}
  <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
    <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="mb-3 block text-xs font-bold uppercase tracking-[0.25em] text-amber-dim">
          Just In
        </span>

        <h2 className="font-heading text-4xl font-extrabold uppercase tracking-tight text-ink md:text-5xl lg:text-6xl">
          New Arrival
        </h2>
      </div>

      <Link
        href="/products"
        className="group inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-xs font-bold uppercase tracking-[0.18em] text-ink transition-all hover:border-amber-dim hover:text-amber-dim"
      >
        Shop the collection
        <ArrowRight
          size={15}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </div>
  </div>

  {/* Products */}
  <div className="mx-auto max-w-[1600px] px-6 pt-10 lg:px-12 lg:pt-14">
    {loadError ? (
      <div className="flex min-h-[280px] items-center justify-center border border-crest/20 bg-crest/5 px-6 text-center">
        <div>
          <p className="font-heading text-lg font-bold text-ink">
            Couldn&apos;t reach the backend.
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-60">
            Check that the Go server is running and{" "}
            <code className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-xs">
              NEXT_PUBLIC_API_URL
            </code>{" "}
            points at it.
          </p>
        </div>
      </div>
    ) : newArrivals.length === 0 ? (
      <div className="flex min-h-[280px] items-center justify-center border border-black/10 text-center">
        <div>
          <p className="font-heading text-lg font-bold text-ink">
            No products yet.
          </p>

          <p className="mt-2 text-sm text-ink-60">
            Add some through the admin dashboard.
          </p>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {newArrivals.map((product, i) => (
          <Reveal key={product.id} delay={i * 60}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    )}
  </div>
</section>

      <CategoryShowcase categories={categories} products={products} />

      <MatchdayCampaigns />

      <ShopTheEdit categories={categories} products={products} />

      {!loadError && <RecentlyViewed allProducts={products} />}

      <section className="bg-ink text-chalk">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="font-heading font-bold text-xl">
            Questions about an order?
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-pitch text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
          >
            MESSAGE US ON WHATSAPP
          </a>
        </div>
      </section>
    </>
  );
}
