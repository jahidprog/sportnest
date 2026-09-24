import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Category, Product } from "@/lib/types";
import { resolveImageUrl } from "@/lib/utils/image";
import { Reveal } from "@/components/ui/Reveal";
import ProductCard from "@/components/product/ProductCard";

export function CategoryShowcase({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  if (categories.length === 0) return null;

  return (
    <Reveal>
      <section className="mx-auto max-w-[1600px] px-6 py-16 lg:px-12 lg:py-24">
        {/* Header */}
        <div className="mb-9 flex items-end justify-between border-b border-ink/10 pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-amber-dim">
              Find your uniform
            </p>

            <h2 className="mt-2 font-heading text-4xl font-bold tracking-wide text-ink md:text-5xl">
              SHOP BY CATEGORY
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-1 text-xs font-bold uppercase tracking-wide text-ink-60 transition-colors hover:text-amber-dim sm:flex"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Categories */}
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const item =
              products.find(
                (product) => product.category_id === category.id
              ) ?? products[index % Math.max(products.length, 1)];

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative isolate flex min-h-[360px] overflow-hidden bg-ink sm:min-h-[440px]"
              >
                {item?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImageUrl(item.imageUrl)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

                {/* Number */}
                <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-widest2 text-chalk/70">
                  0{index + 1} / SPORTNEST
                </span>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 text-chalk">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest2 text-amber">
                      Collection
                    </p>

                    {/* Fixed title area */}
                    <div className="mt-2 flex min-h-[72px] items-end">
                      <h3 className="line-clamp-2 font-heading text-3xl font-bold leading-[0.95] tracking-wide">
                        {category.name.toUpperCase()}
                      </h3>
                    </div>
                  </div>

                  {/* Fixed arrow */}
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-chalk/50 transition-all duration-300 group-hover:border-amber group-hover:bg-amber group-hover:text-ink">
                    <ArrowUpRight
                      size={20}
                      className="transition-transform duration-300 group-hover:rotate-6"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Reveal>
  );
}

export function MatchdayCampaigns() {
  const campaigns = [
    {
      title: "OFFICIAL JERSEY",
      detail: "Wear your colours",
      href: "/products?category=jerseys",
      image:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1500&q=85",
    },
    {
      title: "FAN MADE JERSEY",
      detail: "The new matchday edit",
      href: "/products?category=jerseys",
      image:
        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1500&q=85",
    },
  ];

  return (
    <Reveal>
      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-12 lg:pb-24">
        <div className="grid items-stretch gap-5 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.title}
              href={campaign.href}
              className="group relative isolate flex min-h-[260px] overflow-hidden bg-ink sm:min-h-[350px]"
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={campaign.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-7 text-chalk">
                <p className="font-mono text-[10px] uppercase tracking-widest2 text-amber">
                  {campaign.detail}
                </p>

                <div className="mt-2 flex items-end justify-between gap-6">
                  {/* Fixed title area */}
                  <div className="flex min-h-[96px] flex-1 items-end">
                    <h2 className="line-clamp-2 font-heading text-4xl font-bold leading-[0.9] tracking-wide sm:text-5xl">
                      {campaign.title}
                    </h2>
                  </div>

                  {/* Arrow stays aligned */}
                  <ArrowRight
                    size={24}
                    className="mb-1 shrink-0 transition-transform duration-300 group-hover:translate-x-2"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

export function ShopTheEdit({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const featuredCategory = categories[0];

  const featuredProduct = featuredCategory
    ? products.find(
        (product) => product.category_id === featuredCategory.id
      )
    : products[0];

  const shelf = products
    .filter((product) => product.id !== featuredProduct?.id)
    .slice(0, 8);

  if (!featuredCategory || !featuredProduct) return null;

  return (
    <Reveal>
      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-12 lg:pb-24">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-amber-dim">
            Curated for movement
          </p>

          <h2 className="mt-2 font-heading text-4xl font-bold tracking-wide text-ink md:text-5xl">
            THE PERFORMANCE EDIT
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,.9fr)_minmax(0,1.8fr)]">
          {/* Featured category */}
          <Link
            href={`/products?category=${featuredCategory.slug}`}
            className="group relative isolate flex min-h-[500px] overflow-hidden bg-ink"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(featuredProduct.imageUrl)}
              alt={featuredCategory.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-7 text-chalk">
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-amber">
                Featured category
              </p>

              {/* Fixed title area */}
              <div className="mt-2 flex min-h-[82px] items-end">
                <h3 className="line-clamp-2 font-heading text-4xl font-bold leading-[0.9] tracking-wide">
                  {featuredCategory.name.toUpperCase()}
                </h3>
              </div>

              <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                Shop collection
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>

          {/* Product shelf */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
            {shelf.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}