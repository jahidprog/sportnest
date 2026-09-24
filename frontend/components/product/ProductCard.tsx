import Link from "next/link";
import { Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, effectivePrice, hasDiscount } from "@/lib/utils/format";
import { resolveImageUrl } from "@/lib/utils/image";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "@/components/product/WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const discounted = hasDiscount(product);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <article className="group relative block">
      <Link href={`/products/${product.id}`} className="block" aria-label={`${product.title}, ${formatPrice(effectivePrice(product))}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-chalk-dim shadow-sm transition-shadow duration-300 group-hover:shadow-xl">

        {discounted && (
          <div className="absolute top-3 right-3 z-10">
            <Badge tone="crest">SALE</Badge>
          </div>
        )}
        {!discounted && outOfStock && (
          <div className="absolute top-3 right-3 z-10">
            <Badge tone="ink">OUT OF STOCK</Badge>
          </div>
        )}
        {!discounted && lowStock && (
          <div className="absolute top-3 right-3 z-10">
            <Badge tone="amber">LOW STOCK</Badge>
          </div>
        )}

        {product.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={resolveImageUrl(product.imageUrl)}
            alt={product.title}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
              outOfStock ? "opacity-50 grayscale" : ""
            }`}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ink-60 text-sm font-mono">
            No image
          </div>
        )}

        {/* Reveal-on-hover strip — sizes at a glance + a "view" cue, slides
            up from below rather than appearing instantly, so it reads as
            a considered detail rather than a jump-cut. */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-ink/90 backdrop-blur-sm px-3 py-2.5 flex items-center justify-between">
            {product.sizes && product.sizes.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {product.sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="text-[10px] font-mono text-chalk/80 border border-chalk/25 px-1.5 py-0.5"
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-widest2 text-chalk/70">
                One size
              </span>
            )}
            <Eye size={14} className="text-chalk/70 flex-shrink-0 ml-2" />
          </div>
        )}
      </div>
      </Link>
      <div className="absolute left-3 top-3 z-20"><WishlistButton productId={product.id} compact /></div>

      <Link href={`/products/${product.id}`} className="mt-3 flex items-start justify-between gap-3 border-b border-ink/10 pb-4">
        <div>
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest2 text-ink-60">SportNest</p>
          <h3 className="font-heading font-bold text-lg leading-tight text-ink group-hover:text-amber-dim transition-colors duration-300">
            {product.title}
          </h3>
        </div>
        <div className="text-right whitespace-nowrap pt-0.5">
          {discounted && (
            <p className="font-mono text-xs text-ink-60 line-through">
              {formatPrice(product.price)}
            </p>
          )}
          <p className={`font-mono text-sm font-medium ${discounted ? "text-crest" : "text-ink"}`}>
            {formatPrice(effectivePrice(product))}
          </p>
        </div>
      </Link>
    </article>
  );
}
