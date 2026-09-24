"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { getMyOrders } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

export default function OrdersPage() {
  const router = useRouter();
  const accessToken = useAuth((s) => s.accessToken);
  const isLoggedIn = useAuth((s) => s.isLoggedIn());
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?redirect=/orders");
      return;
    }
    if (!accessToken) return;

    getMyOrders(accessToken)
      .then((data) =>
        setOrders(
          [...data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      )
      .finally(() => setLoading(false));
  }, [isLoggedIn, accessToken, router]);

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-ink-60 font-mono">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl tracking-tightest text-ink mb-3">
          NO ORDERS YET
        </h1>
        <p className="text-ink-60 mb-8">
          Once you place an order, it&apos;ll show up here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-chalk font-heading font-bold tracking-wide hover:bg-amber hover:text-ink transition-colors"
        >
          SHOP ALL PRODUCTS <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-5xl tracking-tightest text-ink mb-8">
        YOUR ORDERS
      </h1>

      <ul className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          return (
            <li key={order.id} className="bg-white border border-ink/10">
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-heading font-bold text-ink">Order #{order.id}</p>
                    <p className="text-xs text-ink-60">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink">
                    {formatPrice(order.total_price)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-ink-60" />
                  ) : (
                    <ChevronDown size={18} className="text-ink-60" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-ink/10">
                  <p className="text-xs text-ink-60 mb-3">
                    Delivered to: {order.shipping_address} · {order.shipping_phone}
                  </p>
                  <ul className="space-y-1.5">
                    {order.items.map((item) => (
                      <li
                        key={`${item.product_id}-${item.size}`}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.product_title}
                          {item.size !== "one-size" ? ` (${item.size})` : ""} ×{item.quantity}
                        </span>
                        <span className="font-mono text-ink-60">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
