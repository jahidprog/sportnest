"use client";

import Link from "next/link";
import { Carousel } from "@/components/ui/Carousel";

/**
 * A single hero banner. Swap `image` for real campaign photography whenever
 * it's ready — Unsplash is just a stand-in so the carousel has something to
 * shift between right now.
 */
type Banner = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  href: string;
  cta: string;
};

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "minimalist-aura",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=2400&q=80",
    eyebrow: "New arrival",
    title: "Minimalist-",
    titleAccent: "Aura",
    subtitle: "Signature blend of comfort",
    href: "/products",
    cta: "Shop Now",
  },
  {
    id: "made-to-move",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2400&q=80",
    eyebrow: "August collection",
    title: "Made To",
    titleAccent: "Move",
    subtitle: "Considered sportswear for training and match day",
    href: "/products",
    cta: "Shop New Arrivals",
  },
  {
    id: "train-different",
    image:
      "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=2400&q=80",
    eyebrow: "Performance edit",
    title: "Train",
    titleAccent: "Different",
    subtitle: "Built to move with you, rep after rep",
    href: "/products",
    cta: "Explore The Edit",
  },
];

function BannerSlide({ banner }: { banner: Banner }) {
  return (
    <div className="relative isolate h-[680px] w-full overflow-hidden bg-ink md:h-[680px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.image}
        alt={banner.title + (banner.titleAccent ?? "")}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Readability gradient so text sits legibly over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-14 lg:px-10">
          <div className="max-w-md text-right ml-auto">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/70">
              {banner.eyebrow}
            </p>

            <h2 className="mt-3 font-display text-4xl leading-[0.95] text-white md:text-5xl">
              {banner.title}
              {banner.titleAccent && (
                <span className="italic text-[#f5a623]">
                  -{banner.titleAccent}
                </span>
              )}
            </h2>

            <p className="mt-2 text-[15px] text-white/80">
              {banner.subtitle}
            </p>

            <Link
              href={banner.href}
              className="mt-6 inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-[#f5a623] hover:text-white"
            >
              {banner.cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoStrip() {
  const links = [
    { label: "Shop Now", href: "/products" },
    { label: "Men", href: "/products?category=men" },
    { label: "Women", href: "/products?category=women" },
    { label: "Kids", href: "/products?category=kids" },
  ];

  return (
    <div className="flex flex-col divide-y divide-black/10 bg-[#f5f5f5] text-[#181818] sm:flex-row sm:divide-x sm:divide-y-0">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="flex-1 px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-wide transition-colors hover:bg-[#eaeaea]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function HeroCarousel({ banners = DEFAULT_BANNERS }: { banners?: Banner[] }) {
  return (
    <div>
      <Carousel
        autoplayDelay={5000}
        slideClassName="flex-[0_0_100%]"
        showDots={banners.length > 1}
        dotsOverlay
      >
        {banners.map((banner) => (
          <BannerSlide key={banner.id} banner={banner} />
        ))}
      </Carousel>

      <PromoStrip />
    </div>
  );
}