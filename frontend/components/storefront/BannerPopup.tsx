"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { getActiveBanners } from "@/lib/api";
import { Banner } from "@/lib/types";
import { resolveImageUrl } from "@/lib/utils/image";

const SESSION_KEY = "sportnest-banner-shown";

// Shows the newest active banner (admin-managed, see /admin/banners) as a
// popup once per browser session — not on every page navigation, which
// would be obnoxious. Silently shows nothing if there's no active banner,
// so this is safe to render even with an empty banners table.
export default function BannerPopup() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    getActiveBanners().then((banners) => {
      if (banners.length === 0) return;
      setBanner(banners[0]);
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    });
  }, []);

  if (!banner || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/70 flex items-center justify-center p-4"
      role="dialog"
      aria-label={banner.title}
      onClick={() => setVisible(false)}
    >
      <div
        className="relative w-full max-w-md bg-chalk overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-1.5 bg-ink/50 text-chalk hover:bg-ink transition-colors"
        >
          <X size={18} />
        </button>

        {banner.image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={resolveImageUrl(banner.image_url)}
            alt=""
            className="w-full aspect-[4/3] object-cover"
          />
        )}

        <div className="p-6 text-center">
          {banner.discount_text && (
            <p className="font-display text-4xl text-crest tracking-tightest mb-1">
              {banner.discount_text}
            </p>
          )}
          <h2 className="font-heading font-extrabold text-2xl text-ink">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="mt-1 text-sm text-ink-60">{banner.subtitle}</p>
          )}

          <Link
            href={banner.link_url || "/products"}
            onClick={() => setVisible(false)}
            className="mt-5 inline-block w-full px-6 py-3.5 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  );
}
