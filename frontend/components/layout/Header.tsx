"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, LogOut, MapPin, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/store/auth-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useHydrated } from "@/lib/hooks/useHydrated";

export default function Header() {
  const totalItems = useCart((s) => s.totalItems());
  const openCart = useCart((s) => s.openCart);
  const user = useAuth((s) => s.user);
  const wishlistCount = useWishlist((s) => s.productIds.length);
  const logout = useAuth((s) => s.logout);
  const hydrated = useHydrated();
  const visibleUser = hydrated ? user : null;
  const visibleCartCount = hydrated ? totalItems : 0;
  const visibleWishlistCount = hydrated ? wishlistCount : 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/95 text-ink backdrop-blur">
      {/* <div className="hidden md:block bg-ink text-chalk">
        <div className="mx-auto max-w-[1600px] px-6 py-2 text-center text-[10px] font-mono tracking-widest2 uppercase text-chalk/70">
          Performance pieces for every day — nationwide delivery available
        </div>
      </div> */}

      <div className="mx-auto max-w-[1600px] px-5 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8 h-[78px]">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="md:hidden p-2 -ml-2"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="flex items-center h-10 w-32 sm:w-36 relative shrink-0">
            <Image
              src="/logo.png"
              alt="SportNest"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-7 font-heading font-bold text-xl tracking-wide whitespace-nowrap">
            <Link
              href="/products"
              className="relative py-2 hover:text-amber-dim transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-amber after:transition-all hover:after:w-full"
            >
              SHOP
            </Link>
            <Link href="/products?category=jerseys" className="hover:text-amber-dim transition-colors">JERSEYS</Link>
            <Link href="/products?category=tshirts" className="hover:text-amber-dim transition-colors">TRAINING</Link>
            <Link href="/products" className="hover:text-amber-dim transition-colors">NEW IN</Link>
          </nav>

          <form onSubmit={submitSearch} className="hidden md:flex relative ml-auto w-full max-w-[290px] xl:max-w-[380px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search performance wear"
              aria-label="Search products"
              className="h-11 w-full bg-ink/[0.045] pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-ink/35 focus:bg-ink/[0.08]"
            />
          </form>

          <div className="ml-auto md:ml-0 flex items-center gap-1 sm:gap-2">
            <Link href="/stores" className="hidden xl:flex flex-col items-center min-w-12 gap-0.5 text-[10px] font-bold hover:text-amber-dim transition-colors">
              <MapPin size={21} strokeWidth={1.8} /> STORES
            </Link>
            {visibleUser ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex flex-col items-center min-w-12 gap-0.5 p-1 hover:text-amber-dim transition-colors"
                >
                  <User size={20} strokeWidth={1.75} />
                  <span className="hidden sm:inline text-[10px] font-bold max-w-16 truncate">
                    {visibleUser.first_name.toUpperCase()}
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-chalk text-ink shadow-lg border border-ink/10">
                    <div className="px-4 py-3 border-b border-ink/10 text-xs text-ink-60">
                      {visibleUser.email}
                      {visibleUser.is_shop_owner && (
                        <span className="block mt-1 font-mono uppercase tracking-widest2 text-amber-dim">
                          Admin
                        </span>
                      )}
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full px-4 py-3 text-sm hover:bg-ink/5 transition-colors"
                    >
                      My Orders
                    </Link>
                    {visibleUser.is_shop_owner && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-3 text-sm hover:bg-ink/5 transition-colors border-t border-ink/10"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-ink/5 transition-colors border-t border-ink/10"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex flex-col items-center min-w-12 gap-0.5 p-1 text-[10px] font-bold hover:text-amber-dim transition-colors"
              >
                <User size={20} strokeWidth={1.75} /> <span className="hidden sm:inline">SIGN IN</span>
              </Link>
            )}

            <Link href="/wishlist" aria-label={`Wishlist, ${visibleWishlistCount} saved item${visibleWishlistCount === 1 ? "" : "s"}`} className="relative hidden sm:flex flex-col items-center min-w-12 gap-0.5 p-1 text-[10px] font-bold hover:text-amber-dim transition-colors">
              <Heart size={20} strokeWidth={1.75} /> <span>WISHLIST</span>
              {visibleWishlistCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber text-[11px] font-mono font-bold text-ink">{visibleWishlistCount}</span>}
            </Link>

            <button
              onClick={openCart}
              aria-label={`Open cart, ${visibleCartCount} item${visibleCartCount === 1 ? "" : "s"}`}
              className="relative flex flex-col items-center min-w-12 gap-0.5 p-1 text-[10px] font-bold hover:text-amber-dim transition-colors"
            >
              <ShoppingBag size={22} strokeWidth={1.75} />
              <span className="hidden sm:inline">BAG</span>
              {visibleCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber text-ink text-[11px] font-mono font-bold">
                  {visibleCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="md:hidden border-t border-ink/10 py-4 grid grid-cols-2 gap-x-4 text-sm font-bold tracking-wide">
            <Link onClick={() => setMobileOpen(false)} href="/products" className="py-3">SHOP ALL</Link>
            <Link onClick={() => setMobileOpen(false)} href="/products?category=jerseys" className="py-3">JERSEYS</Link>
            <Link onClick={() => setMobileOpen(false)} href="/products?category=tshirts" className="py-3">TRAINING</Link>
            <Link onClick={() => setMobileOpen(false)} href="/products" className="py-3">NEW IN</Link>
            <Link onClick={() => setMobileOpen(false)} href="/stores" className="py-3">STORES</Link>
            <Link onClick={() => setMobileOpen(false)} href="/wishlist" className="py-3">WISHLIST</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
