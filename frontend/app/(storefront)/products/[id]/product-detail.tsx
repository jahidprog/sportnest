"use client";

import { MouseEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Minus, Plus, Ruler, ShoppingBag, X, ZoomIn } from "lucide-react";
import { Product } from "@/lib/types";
import { effectivePrice, formatPrice, hasDiscount } from "@/lib/utils/format";
import { resolveImageUrl } from "@/lib/utils/image";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/store/auth-store";
import { trackProductView } from "@/lib/utils/recently-viewed";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";
import ProductCard from "@/components/product/ProductCard";
import { WishlistButton } from "@/components/product/WishlistButton";

function SizeChart({ product, onClose }: { product: Product; onClose: () => void }) {
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL", "XXL"];
  useEffect(() => {
    const listener = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", listener); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", listener); document.body.style.overflow = ""; };
  }, [onClose]);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="size-chart-title">
    <button aria-label="Close size chart" className="absolute inset-0 bg-ink/65 backdrop-blur-[2px]" onClick={onClose} />
    <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto bg-white shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-white px-6 py-5"><div><p className="font-mono text-[10px] uppercase tracking-widest2 text-amber-dim">Find your fit</p><h2 id="size-chart-title" className="mt-1 font-heading text-3xl font-bold">SIZE CHART</h2></div><button onClick={onClose} className="p-2 text-ink/60 hover:text-ink" aria-label="Close"><X size={28} /></button></div>
      <div className="p-6 sm:p-8"><h3 className="font-heading text-2xl font-bold">{product.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-60">Measurements are in inches and taken from the garment laid flat. For a relaxed fit, choose your usual size.</p>
        <div className="mt-6 overflow-x-auto border border-ink/10"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-ink text-chalk font-heading text-lg tracking-wide"><tr><th className="px-5 py-4">SIZE</th><th className="px-5 py-4">CHEST</th><th className="px-5 py-4">LENGTH</th><th className="px-5 py-4">SLEEVE</th><th className="px-5 py-4">SHOULDER</th></tr></thead><tbody>{sizes.map((size, index) => <tr key={size} className="border-t border-ink/10 even:bg-ink/[0.025]"><td className="px-5 py-4 font-heading text-lg font-bold">{size}</td><td className="px-5 py-4">{38 + index * 2}</td><td className="px-5 py-4">{26 + index}</td><td className="px-5 py-4">{8 + index * 0.5}</td><td className="px-5 py-4">{16 + index * 0.5}</td></tr>)}</tbody></table></div>
        <p className="mt-5 text-xs text-ink-60">Need help finding a size? Send us a message with your height and preferred fit.</p></div>
    </div>
  </div>;
}

function ProductGallery({ product, discounted, outOfStock }: { product: Product; discounted: boolean; outOfStock: boolean }) {
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const moveZoom = (event: MouseEvent<HTMLDivElement>) => { const box = event.currentTarget.getBoundingClientRect(); setZoom({ active: true, x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 }); };
  return <div className="md:sticky md:top-28 md:self-start"><div className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-chalk-dim" onMouseMove={moveZoom} onMouseLeave={() => setZoom((value) => ({ ...value, active: false }))}>
    {discounted && <div className="absolute right-4 top-4 z-10"><Badge tone="crest">SALE</Badge></div>}
    {product.imageUrl ? <img src={resolveImageUrl(product.imageUrl)} alt={product.title} className={`h-full w-full object-cover transition-transform duration-200 ease-out ${zoom.active ? "scale-[1.65]" : "scale-100"} ${outOfStock ? "opacity-50 grayscale" : ""}`} style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }} /> : <div className="flex h-full items-center justify-center font-mono text-sm text-ink-60">No image available</div>}
    <div className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-2 bg-white/90 px-3 py-2 text-[10px] font-mono uppercase tracking-widest2 text-ink md:flex md:opacity-0 md:transition-opacity md:group-hover:opacity-100"><ZoomIn size={14} /> Hover to zoom</div>
  </div><p className="mt-3 hidden items-center gap-2 text-xs text-ink-60 md:flex"><ZoomIn size={14} /> Move over the image to inspect details</p></div>;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex gap-3 text-sm"><span className="w-20 shrink-0 text-ink-60">{label}</span><span className="font-medium text-ink">{children}</span></div>; }

export default function ProductDetail({ product, allProducts }: { product: Product; allProducts: Product[] }) {
  const router = useRouter(); const pathname = usePathname(); const [quantity, setQuantity] = useState(1); const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.length ? null : "one-size"); const [justAdded, setJustAdded] = useState(false); const [showSizeChart, setShowSizeChart] = useState(false); const [detailsOpen, setDetailsOpen] = useState(true); const addItem = useCart((s) => s.addItem); const isLoggedIn = useAuth((s) => s.isLoggedIn());
  useEffect(() => { trackProductView(product.id); }, [product.id]);
  const discounted = hasDiscount(product); const outOfStock = product.stock <= 0; const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD; const needsSize = product.sizes && product.sizes.length > 0;
  const related = allProducts.filter((p) => p.id !== product.id).sort((a, b) => Number(b.category_id !== product.category_id) - Number(a.category_id !== product.category_id)).slice(0, 4);
  const addToCart = () => { if (needsSize && !selectedSize) return; if (!isLoggedIn) { router.push(`/login?redirect=${encodeURIComponent(pathname)}`); return; } addItem(product, selectedSize ?? "one-size", quantity); setJustAdded(true); setTimeout(() => setJustAdded(false), 1800); };
  return <><div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-12 lg:py-12"><Link href="/products" className="font-mono text-[11px] uppercase tracking-widest2 text-ink-60 transition-colors hover:text-amber-dim">← Back to collection</Link><div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] lg:gap-16"><ProductGallery product={product} discounted={discounted} outOfStock={outOfStock} /><div className="lg:pt-3"><p className="font-mono text-[10px] uppercase tracking-widest2 text-amber-dim">SportNest performance collection</p><h1 className="mt-3 font-heading text-4xl font-bold leading-none tracking-wide text-ink md:text-5xl">{product.title}</h1><div className="mt-5 flex items-baseline gap-3">{discounted && <span className="font-mono text-sm text-ink-60 line-through">{formatPrice(product.price)}</span>}<span className={`font-mono text-2xl font-medium ${discounted ? "text-crest" : "text-ink"}`}>{formatPrice(effectivePrice(product))}</span></div>
    <div className="mt-7 space-y-2 border-y border-ink/10 py-5"><InfoRow label="Availability"><span className={outOfStock ? "text-crest" : "text-pitch"}>{outOfStock ? "Out of stock" : lowStock ? `Only ${product.stock} left` : "In stock"}</span></InfoRow><InfoRow label="Delivery">Cash on delivery available</InfoRow></div>
    {needsSize && <div className="mt-7"><div className="mb-3 flex items-center justify-between"><p className="font-heading text-lg font-bold tracking-wide">SELECT SIZE{selectedSize && <span className="ml-2 text-amber-dim">· {selectedSize}</span>}</p><button onClick={() => setShowSizeChart(true)} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-60 hover:text-amber-dim"><Ruler size={15} /> Size chart</button></div><div className="flex flex-wrap gap-2">{product.sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`h-12 min-w-12 px-4 font-heading text-lg font-bold transition-all ${selectedSize === size ? "bg-ink text-chalk" : "border border-ink/20 hover:border-ink"}`}>{size}</button>)}</div></div>}
    <div className="mt-7 flex gap-3"><div className="flex h-14 items-center rounded-full border border-ink/15"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-4 hover:text-amber-dim" aria-label="Decrease quantity"><Minus size={17} /></button><span className="w-9 text-center font-mono">{quantity}</span><button onClick={() => setQuantity((q) => q + 1)} className="px-4 py-4 hover:text-amber-dim" aria-label="Increase quantity"><Plus size={17} /></button></div><button onClick={addToCart} disabled={outOfStock || (needsSize && !selectedSize)} className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 font-heading text-xl font-bold tracking-wide text-chalk transition-colors hover:bg-amber-dim disabled:cursor-not-allowed disabled:opacity-40"><ShoppingBag size={18} />{justAdded ? <><Check size={18} /> ADDED TO BAG</> : outOfStock ? "OUT OF STOCK" : needsSize && !selectedSize ? "SELECT A SIZE" : !isLoggedIn ? "SIGN IN TO ADD" : "ADD TO BAG"}</button><WishlistButton productId={product.id} /></div>
    <div className="mt-8 border-y border-ink/10"><button onClick={() => setDetailsOpen((open) => !open)} className="flex w-full items-center justify-between py-5 text-left font-heading text-xl font-bold">PRODUCT DETAILS <ChevronDown className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`} /></button>{detailsOpen && <div className="border-t border-ink/10 pb-5 pt-4 text-sm leading-relaxed text-ink-60 whitespace-pre-line">{product.description || "A considered SportNest essential, designed for comfortable movement and reliable everyday performance."}</div>}</div><div className="border-b border-ink/10 py-5 text-sm text-ink-60"><span className="font-heading text-lg font-bold text-ink">Easy returns</span><br />Exchange eligible items within 7 days of delivery.</div>
  </div></div></div>{showSizeChart && <SizeChart product={product} onClose={() => setShowSizeChart(false)} />}{related.length > 0 && <Reveal><section className="mx-auto max-w-[1600px] px-5 pb-16 lg:px-12"><h2 className="font-heading text-3xl font-bold tracking-wide text-ink">YOU MIGHT ALSO LIKE</h2><div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div></section></Reveal>}<RecentlyViewed allProducts={allProducts} excludeId={product.id} /></>;
}
