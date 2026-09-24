import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="font-display text-8xl text-ink/10 mb-2">404</p>
      <h1 className="font-display text-4xl tracking-tightest text-ink mb-4">
        PAGE NOT FOUND
      </h1>
      <p className="text-ink-60 mb-8">
        That page doesn&apos;t exist, or it moved.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
      >
        GO HOME
      </Link>
    </div>
  );
}
