"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils/format";
import { resolveImageUrl } from "@/lib/utils/image";
import { useHydrated } from "@/lib/hooks/useHydrated";

export default function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const closeCart = useCart((s) => s.closeCart);
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const totalPrice = useCart((s) => s.totalPrice());
  const hydrated = useHydrated();
  const visibleOpen = hydrated && isOpen;
  const visibleLines = hydrated ? lines : [];
  const visibleTotal = hydrated ? totalPrice : 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/50 transition-opacity ${
          visibleOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-chalk shadow-2xl transition-transform duration-300 ${
          visibleOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!visibleOpen}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <h2 className="font-display text-2xl tracking-tightest text-ink">
            YOUR BAG
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1 text-ink hover:text-crest transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {visibleLines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-heading font-bold text-xl text-ink">
              Your bag is empty
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="mt-2 px-5 py-2.5 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
            >
              SHOP ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {visibleLines.map((line) => (
                <li key={`${line.productId}-${line.size}`} className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(line.imageUrl)}
                    alt={line.title}
                    className="h-24 w-20 object-cover bg-chalk-dim flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-heading font-bold text-sm text-ink leading-tight">
                        {line.title}
                      </h3>
                      <button
                        onClick={() => removeLine(line.productId, line.size)}
                        aria-label={`Remove ${line.title}`}
                        className="text-ink-60 hover:text-crest transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {line.size !== "one-size" && (
                      <p className="text-xs text-ink-60 mt-0.5">Size {line.size}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-ink/15">
                        <button
                          onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:bg-ink/5 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-mono text-sm">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 hover:bg-ink/5 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-mono text-sm font-medium text-ink">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink/10 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between font-heading font-bold text-lg text-ink">
                <span>SUBTOTAL</span>
                <span className="font-mono">{formatPrice(visibleTotal)}</span>
              </div>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full text-center px-5 py-3.5 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
              >
                GO TO CHECKOUT
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
