"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getProducts, getAllOrders } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Product, Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";

export default function AdminOverviewPage() {
  const accessToken = useAuth((s) => s.accessToken);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([getProducts(), getAllOrders(accessToken)])
      .then(([p, o]) => {
        setProducts(p);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_price, 0);

    const lowStockCount = products.filter(
      (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
    ).length;

    const outOfStockCount = products.filter((p) => p.stock <= 0).length;

    const pendingOrders = orders.filter(
      (o) => o.status === "pending_confirmation"
    ).length;

    const confirmedOrders = orders.filter(
      (o) => o.status === "confirmed"
    ).length;

    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    ).length;

    return {
      totalRevenue,
      lowStockCount,
      outOfStockCount,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
    };
  }, [orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 8),
    [orders]
  );

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
      <AdminPageHeader
        title="Overview"
        subtitle="A snapshot of how your store is performing right now."
      />

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="mb-4 h-7 w-7 animate-spin rounded-full border-2 border-ink/10 border-t-[#f5a623]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/35">
              Loading dashboard
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* =========================================================
              PRIMARY METRICS
          ========================================================= */}
          <section className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 xl:grid-cols-4">
            {/* Revenue */}
            <div className="group bg-white p-5 transition-colors hover:bg-[#fffdf8] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                    Total revenue
                  </p>

                  <p className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5a623]/10 text-[#c17c00]">
                  <DollarSign size={17} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-1.5 text-[10px] font-medium text-ink/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f5a623]" />
                Excluding cancelled orders
              </div>
            </div>

            {/* Orders */}
            <div className="group bg-white p-5 transition-colors hover:bg-[#fafafa] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                    Total orders
                  </p>

                  <p className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    {orders.length}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/[0.05] text-ink">
                  <ShoppingBag size={17} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-[#c17c00]">
                  <Clock3 size={11} />
                  {stats.pendingOrders} pending
                </span>

                <span className="text-ink/15">•</span>

                <span className="flex items-center gap-1 text-ink/40">
                  <CheckCircle2 size={11} />
                  {stats.confirmedOrders} confirmed
                </span>
              </div>
            </div>

            {/* Products */}
            <div className="group bg-white p-5 transition-colors hover:bg-[#fafafa] sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                    Product catalog
                  </p>

                  <p className="mt-4 font-display text-3xl tracking-tight text-ink sm:text-4xl">
                    {products.length}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/[0.05] text-ink">
                  <Package size={17} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-5 text-[10px] text-ink/40">
                Active products in catalog
              </div>
            </div>

            {/* Stock */}
            <div
              className={`group p-5 transition-colors sm:p-6 ${
                stats.lowStockCount + stats.outOfStockCount > 0
                  ? "bg-[#fffaf8]"
                  : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                    Inventory alerts
                  </p>

                  <p
                    className={`mt-4 font-display text-3xl tracking-tight sm:text-4xl ${
                      stats.lowStockCount + stats.outOfStockCount > 0
                        ? "text-[#b42318]"
                        : "text-ink"
                    }`}
                  >
                    {stats.lowStockCount + stats.outOfStockCount}
                  </p>
                </div>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    stats.lowStockCount + stats.outOfStockCount > 0
                      ? "bg-[#b42318]/10 text-[#b42318]"
                      : "bg-ink/[0.05] text-ink"
                  }`}
                >
                  <AlertTriangle size={17} strokeWidth={1.8} />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-[10px]">
                <span className="text-[#b42318]">
                  {stats.outOfStockCount} out
                </span>

                <span className="text-ink/15">•</span>

                <span className="text-[#c17c00]">
                  {stats.lowStockCount} low
                </span>
              </div>
            </div>
          </section>

          {/* =========================================================
              ATTENTION / ORDER SUMMARY
          ========================================================= */}
          <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Order status overview */}
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="font-heading text-sm font-bold text-ink">
                    Order activity
                  </p>

                  <p className="mt-0.5 text-xs text-ink/40">
                    Current order pipeline
                  </p>
                </div>

                <Link
                  href="/admin/orders"
                  className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40 transition-colors hover:text-ink"
                >
                  View orders
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              <div className="grid grid-cols-3 divide-x divide-ink/10">
                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5a623]/10 text-[#c17c00]">
                    <Clock3 size={15} />
                  </div>

                  <p className="font-display text-2xl text-ink">
                    {stats.pendingOrders}
                  </p>

                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-ink/35">
                    New / Pending
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 size={15} />
                  </div>

                  <p className="font-display text-2xl text-ink">
                    {stats.confirmedOrders}
                  </p>

                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-ink/35">
                    Confirmed
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                    <XCircle size={15} />
                  </div>

                  <p className="font-display text-2xl text-ink">
                    {stats.cancelledOrders}
                  </p>

                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-ink/35">
                    Cancelled
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory alert */}
            <div
              className={`rounded-2xl border p-5 sm:p-6 ${
                stats.lowStockCount + stats.outOfStockCount > 0
                  ? "border-red-200 bg-[#fffaf8]"
                  : "border-ink/10 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                    Inventory attention
                  </p>

                  <h2 className="mt-3 font-heading text-lg font-bold text-ink">
                    {stats.lowStockCount + stats.outOfStockCount > 0
                      ? "Stock needs attention"
                      : "Inventory looks healthy"}
                  </h2>
                </div>

                <AlertTriangle
                  size={19}
                  className={
                    stats.lowStockCount + stats.outOfStockCount > 0
                      ? "text-red-500"
                      : "text-ink/25"
                  }
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5">
                  <span className="text-xs text-ink/55">
                    Out of stock
                  </span>

                  <span
                    className={`font-mono text-xs font-bold ${
                      stats.outOfStockCount > 0
                        ? "text-red-600"
                        : "text-ink/40"
                    }`}
                  >
                    {stats.outOfStockCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5">
                  <span className="text-xs text-ink/55">
                    Running low
                  </span>

                  <span
                    className={`font-mono text-xs font-bold ${
                      stats.lowStockCount > 0
                        ? "text-[#c17c00]"
                        : "text-ink/40"
                    }`}
                  >
                    {stats.lowStockCount}
                  </span>
                </div>
              </div>

              {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
                <Link
                  href="/admin/products"
                  className="mt-5 flex items-center justify-between border-t border-red-200 pt-4 text-xs font-bold text-red-600"
                >
                  Review inventory
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </section>

          {/* =========================================================
              RECENT ORDERS
          ========================================================= */}
          <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
            <div className="flex flex-col gap-3 border-b border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="font-heading text-sm font-bold text-ink">
                  Recent orders
                </p>

                <p className="mt-0.5 text-xs text-ink/40">
                  Latest activity from your storefront
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40 transition-colors hover:text-ink"
              >
                View all orders
                <ArrowUpRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <ShoppingBag
                  size={24}
                  className="mx-auto mb-3 text-ink/15"
                />

                <p className="text-sm font-medium text-ink/45">
                  No orders yet
                </p>

                <p className="mt-1 text-xs text-ink/30">
                  Orders will appear here once customers start purchasing.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 text-left">
                        <th className="px-6 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">
                          Order
                        </th>

                        <th className="px-6 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">
                          Status
                        </th>

                        <th className="px-6 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">
                          Total
                        </th>

                        <th className="px-6 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/35">
                          Date
                        </th>

                        <th className="w-10 px-6 py-3" />
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="group border-b border-ink/[0.06] transition-colors last:border-0 hover:bg-ink/[0.015]"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold text-ink">
                              #{order.id}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <OrderStatusBadge status={order.status} />
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-medium text-ink">
                              {formatPrice(order.total_price)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-xs text-ink/40">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              href="/admin/orders"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/20 transition-all hover:bg-ink/5 hover:text-ink"
                              aria-label={`View order ${order.id}`}
                            >
                              <ArrowUpRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-ink/[0.06] md:hidden">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-ink">
                          #{order.id}
                        </p>

                        <p className="mt-1 text-[10px] text-ink/35">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status} />

                        <span className="font-mono text-xs font-medium text-ink">
                          {formatPrice(order.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}