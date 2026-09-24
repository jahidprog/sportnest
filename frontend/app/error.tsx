"use client";

import { useEffect } from "react";
import Link from "next/link";

// Next.js renders this automatically when a Server or Client Component
// throws during render, inside this segment. It must be a Client
// Component — that's a framework requirement, not a style choice.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="font-mono text-xs tracking-widest2 uppercase text-crest mb-3">
        Something went wrong
      </p>
      <h1 className="font-display text-4xl tracking-tightest text-ink mb-4">
        WE HIT A SNAG
      </h1>
      <p className="text-ink-60 mb-8">
        That&apos;s on us, not you. Try again, or head back to the homepage.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-ink/20 text-ink font-heading font-bold tracking-wide hover:border-ink transition-colors"
        >
          GO HOME
        </Link>
      </div>
    </div>
  );
}
