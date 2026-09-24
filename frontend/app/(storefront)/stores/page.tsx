import Link from "next/link";
import { ArrowRight, Clock3, MessageCircle, ShoppingBag } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

export default function StoresPage() {
  return <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
    <p className="font-mono text-xs uppercase tracking-widest2 text-amber-dim">Shop SportNest</p>
    <div className="mt-3 grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-end"><div><h1 className="font-display text-5xl tracking-tightest text-ink md:text-7xl">OUR STORE</h1><p className="mt-5 max-w-xl text-base leading-8 text-ink-60">SportNest is currently available online, delivering performance wear directly across Bangladesh. We&apos;re preparing our first physical retail experience.</p></div><div className="border-l-4 border-amber bg-white p-6 shadow-sm"><ShoppingBag className="text-amber-dim" /><h2 className="mt-4 font-heading text-2xl font-bold">ONLINE, NATIONWIDE</h2><p className="mt-2 text-sm leading-6 text-ink-60">Browse the collection anytime and place your order securely with cash on delivery.</p></div></div>
    <div className="mt-14 grid gap-5 md:grid-cols-2"><section className="border border-ink/10 bg-white p-7"><Clock3 className="text-amber-dim" /><h2 className="mt-4 font-heading text-2xl font-bold">NEED ORDER HELP?</h2><p className="mt-2 text-sm leading-7 text-ink-60">Our customer support team can help with sizing, delivery, exchanges, and orders.</p><a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-heading font-bold text-ink hover:text-amber-dim">CHAT ON WHATSAPP <MessageCircle size={17} /></a></section><section className="border border-ink/10 bg-ink p-7 text-chalk"><p className="font-mono text-[10px] uppercase tracking-widest2 text-amber">Coming soon</p><h2 className="mt-3 font-heading text-2xl font-bold">PHYSICAL LOCATIONS</h2><p className="mt-2 text-sm leading-7 text-chalk/65">We&apos;ll publish verified addresses and opening times here when retail locations are ready. No placeholder locations, no wasted trips.</p></section></div>
    <Link href="/products" className="mt-10 inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-heading font-bold tracking-wide text-chalk hover:bg-amber hover:text-ink">SHOP ONLINE <ArrowRight size={18} /></Link>
  </div>;
}
