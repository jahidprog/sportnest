import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="font-display text-8xl text-ink/10 mb-2">404</p>
      <h1 className="font-display text-4xl tracking-tightest text-ink mb-4">
        PRODUCT NOT FOUND
      </h1>
      <p className="text-ink-60 mb-8">
        This product doesn&apos;t exist, or it&apos;s been removed.
      </p>
      <Link
        href="/products"
        className="inline-block px-6 py-3 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
      >
        BROWSE ALL PRODUCTS
      </Link>
    </div>
  );
}
