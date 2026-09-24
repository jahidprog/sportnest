"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useHydrated } from "@/lib/hooks/useHydrated";

export function WishlistButton({ productId, compact = false }: { productId: number; compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useAuth((state) => state.isLoggedIn());
  const saved = useWishlist((state) => state.has(productId));
  const toggle = useWishlist((state) => state.toggle);
  const hydrated = useHydrated();
  const visibleSaved = hydrated && saved;

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={visibleSaved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={visibleSaved}
      className={`inline-flex items-center justify-center transition-colors focus-visible:outline-offset-2 ${
        compact
          ? "h-10 w-10 bg-white/95 text-ink shadow-sm hover:text-crest"
          : "h-14 gap-2 border border-ink/15 px-5 font-heading text-lg font-bold text-ink hover:border-crest hover:text-crest"
      } ${visibleSaved ? "text-crest" : ""}`}
    >
      <Heart size={compact ? 19 : 18} fill={visibleSaved ? "currentColor" : "none"} />
      {!compact && <span>{visibleSaved ? "SAVED" : "SAVE"}</span>}
    </button>
  );
}
