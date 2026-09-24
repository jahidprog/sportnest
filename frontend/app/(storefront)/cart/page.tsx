"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { useAuth } from "@/lib/store/auth-store";
import { checkout } from "@/lib/api";
import { formatPrice } from "@/lib/utils/format";
import { resolveImageUrl } from "@/lib/utils/image";
import { ApiError } from "@/lib/api/client";
import { Order } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/lib/hooks/useHydrated";

export default function CartPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const clearCart = useCart((s) => s.clearCart);
  const totalPrice = useCart((s) => s.totalPrice());

  const accessToken = useAuth((s) => s.accessToken);
  const isLoggedIn = useAuth((s) => s.isLoggedIn());
  const hydrated = useHydrated();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone || !recipientName || !city || !area || lines.length === 0) return;

    if (!isLoggedIn || !accessToken) {
      // Shouldn't normally happen — you can't get items into the cart
      // without being logged in (see product-detail.tsx) — but a token
      // could have expired since. Send them to log back in and return
      // here with the cart still intact (cart isn't cleared on this path).
      router.push("/login?redirect=/cart");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const order = await checkout(
        {
          items: lines.map((l) => ({
            product_id: l.productId,
            quantity: l.quantity,
            size: l.size,
          })),
          shipping_address: address,
          shipping_phone: phone,
          recipient_name: recipientName,
          recipient_email: recipientEmail || undefined,
          delivery_city: city,
          delivery_area: area,
          delivery_postal_code: postalCode || undefined,
          delivery_landmark: landmark || undefined,
          delivery_instructions: instructions || undefined,
        },
        accessToken
      );
      clearCart();
      setPlacedOrder(order);
    } catch (err) {
      // Checkout errors from the backend (out of stock, etc.) are
      // written to be shown directly — see checkout.go on the backend.
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong placing your order. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-6 py-12"><div className="h-12 w-56 animate-pulse bg-ink/10" /><div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]"><div className="h-72 animate-pulse bg-ink/5" /><div className="h-[560px] animate-pulse border border-ink/10 bg-white" /></div></div>;
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-widest2 uppercase text-pitch mb-3">
          Order #{placedOrder.id} placed
        </p>
        <h1 className="font-display text-4xl md:text-5xl tracking-tightest text-ink">
          THANKS — CONFIRMING ON WHATSAPP
        </h1>
        <p className="mt-4 text-ink-60 max-w-md mx-auto">
          We&apos;ll message you on {placedOrder.shipping_phone} to confirm
          your order. Pay by cash when it arrives at your door.
        </p>
        <div className="mt-8 pt-8 border-t border-ink/10 text-left max-w-sm mx-auto">
          <p className="font-heading font-bold text-sm text-ink mb-3">
            ORDER SUMMARY
          </p>
          <ul className="space-y-1.5 text-sm text-ink-60">
            {placedOrder.items.map((item) => (
              <li key={`${item.product_id}-${item.size}`} className="flex justify-between">
                <span>
                  {item.product_title}
                  {item.size !== "one-size" ? ` (${item.size})` : ""} ×{item.quantity}
                </span>
                <span className="font-mono">
                  {formatPrice(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-heading font-bold text-ink mt-3 pt-3 border-t border-ink/10">
            <span>TOTAL</span>
            <span className="font-mono">{formatPrice(placedOrder.total_price)}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
          >
            KEEP SHOPPING <ArrowRight size={18} />
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3.5 border border-ink/20 text-ink font-heading font-bold tracking-wide hover:border-ink transition-colors"
          >
            VIEW MY ORDERS
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl tracking-tightest text-ink">
          YOUR BAG IS EMPTY
        </h1>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
        >
          SHOP ALL PRODUCTS <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:grid lg:grid-cols-[1fr_420px] lg:gap-12">
      <div>
        <h1 className="font-display text-5xl tracking-tightest text-ink mb-8">
          YOUR BAG
        </h1>
        <ul className="divide-y divide-ink/10">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.size}`} className="py-6 flex gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(line.imageUrl)}
                alt={line.title}
                className="h-32 w-28 object-cover bg-chalk-dim flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <h3 className="font-heading font-bold text-lg text-ink">
                    {line.title}
                  </h3>
                  <button
                    onClick={() => removeLine(line.productId, line.size)}
                    aria-label={`Remove ${line.title}`}
                    className="text-ink-60 hover:text-crest transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {line.size !== "one-size" && (
                  <p className="text-sm text-ink-60 mt-1">Size {line.size}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-ink/15">
                    <button
                      onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="p-2 hover:bg-ink/5 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-mono">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-2 hover:bg-ink/5 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="font-mono text-base font-medium text-ink">
                    {formatPrice(line.price * line.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="mt-10 h-fit border border-ink/10 bg-white shadow-sm lg:sticky lg:top-28 lg:mt-0">
        <div className="border-b border-ink/10 bg-chalk-dim/60 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber/15 text-amber-dim"><MapPin size={19} /></span><div><h2 className="font-heading text-2xl font-extrabold text-ink">DELIVERY DETAILS</h2><p className="mt-1 text-xs leading-5 text-ink-60">Enter the details our delivery team needs to reach you.</p></div></div></div>

        {error && (
          <div role="alert" className="mx-5 mt-5 px-4 py-3 bg-crest/10 border border-crest/30 text-sm text-crest sm:mx-6">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-7 p-5 sm:p-6">
          <fieldset className="space-y-4"><legend className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-ink"><UserRound size={17} className="text-amber-dim" /> RECIPIENT</legend><Input id="recipientName" label="Full name" required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Name receiving this order" autoComplete="name" /><div className="grid gap-4 sm:grid-cols-2"><Input id="phone" label="WhatsApp phone" type="tel" inputMode="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" /><Input id="email" label="Email (optional)" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" /></div></fieldset>
          <fieldset className="space-y-4 border-t border-ink/10 pt-6"><legend className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-ink"><MapPin size={17} className="text-amber-dim" /> DELIVERY LOCATION</legend><div className="grid gap-4 sm:grid-cols-2"><Input id="city" label="City / District" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" autoComplete="address-level2" /><Input id="area" label="Area / Thana" required value={area} onChange={(e) => setArea(e.target.value)} placeholder="Dhanmondi" /></div><Textarea
            id="address"
            label="House / flat and road"
            required
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House / flat, road, building name"
            autoComplete="street-address"
          /><div className="grid gap-4 sm:grid-cols-2"><Input id="postalCode" label="Postal code (optional)" inputMode="numeric" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="1209" autoComplete="postal-code" /><Input id="landmark" label="Nearby landmark (optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near Rabindra Sarobar" /></div></fieldset>
          <fieldset className="border-t border-ink/10 pt-6"><legend className="mb-4 font-heading text-lg font-bold text-ink">DELIVERY INSTRUCTIONS <span className="font-body text-xs font-normal text-ink-60">(optional)</span></legend><Textarea id="instructions" label="Notes for the rider" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Call on arrival, gate details, preferred delivery time…" /></fieldset>

          <div className="border-t border-ink/10 pt-5 space-y-2">
            <div className="flex justify-between font-heading font-bold text-lg text-ink">
              <span>TOTAL</span>
              <span className="font-mono">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full mt-2">
            {submitting ? "PLACING ORDER..." : "PLACE ORDER — CASH ON DELIVERY"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-60"><ShieldCheck size={14} className="text-pitch" /> No payment now. We&apos;ll confirm your order over WhatsApp.</p>
        </form>
      </aside>
    </div>
  );
}
