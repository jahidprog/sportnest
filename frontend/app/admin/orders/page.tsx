"use client";

import { useEffect, useState, Fragment } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ShoppingBag,
  Copy,
  Check,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Order, OrderStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending_confirmation",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// Fulfillment is deliberately a one-way workflow. The server enforces this
// as well, but limiting the UI prevents accidental regressions and makes the
// next operational step obvious.
const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
};

const STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    icon: typeof Clock3;
    classes: string;
    dot: string;
  }
> = {
  pending_confirmation: {
    label: "New",
    description: "Needs confirmation",
    icon: Clock3,
    classes: "bg-amber/15 text-amber-dim border-amber/30",
    dot: "bg-amber",
  },

  confirmed: {
    label: "Confirmed",
    description: "Order confirmed",
    icon: CheckCircle2,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },

  out_for_delivery: {
    label: "Out for delivery",
    description: "On the way",
    icon: Truck,
    classes: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },

  delivered: {
    label: "Delivered",
    description: "Completed",
    icon: PackageCheck,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },

  cancelled: {
    label: "Cancelled",
    description: "Order cancelled",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export default function AdminOrdersPage() {
  const accessToken = useAuth((s) => s.accessToken);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string, key: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(null), 1600); }
    catch { window.prompt("Copy this value", value); }
  };

  const load = () => {
    if (!accessToken) return;

    setLoading(true);

    getAllOrders(accessToken)
      .then((data) =>
        setOrders(
          [...data].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken]);

  const handleStatusChange = async (
    order: Order,
    status: OrderStatus
  ) => {
    if (!accessToken || status === order.status) return;

    if (status === "cancelled" && !confirm(`Cancel order #${order.id}? Its reserved stock will be returned to inventory.`)) {
      return;
    }

    setUpdatingId(order.id);

    try {
      await updateOrderStatus(order.id, status, accessToken);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status } : o
        )
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const visible =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  const pendingCount = orders.filter(
    (o) => o.status === "pending_confirmation"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <AdminPageHeader
        title="Orders"
        subtitle={`${orders.length} order${
          orders.length === 1 ? "" : "s"
        } total`}
      />

      {/* Attention banner */}
      {pendingCount > 0 && (
        <button
          onClick={() => setFilter("pending_confirmation")}
          className="mb-6 flex w-full items-center gap-4 rounded-2xl border border-amber/30 bg-amber/10 p-4 text-left transition hover:bg-amber/15"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber text-ink">
            <Clock3 size={20} />
          </div>

          <div className="flex-1">
            <p className="font-bold text-slate-900">
              {pendingCount} new order
              {pendingCount === 1 ? "" : "s"} need
              {pendingCount === 1 ? "s" : ""} your attention
            </p>

            <p className="mt-0.5 text-xs text-slate-600">
              Review and confirm these orders before processing them.
            </p>
          </div>

          <span className="hidden rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white sm:block">
            Review orders
          </span>
        </button>
      )}

      {/* Status filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          count={orders.length}
        />

        {STATUS_OPTIONS.map((status) => (
          <FilterButton
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            label={STATUS_META[status].label}
            count={orders.filter((o) => o.status === status).length}
            status={status}
          />
        ))}
      </div>

      {/* Orders */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            <p className="text-sm text-slate-500">Loading orders...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <ShoppingBag size={24} />
            </div>

            <p className="font-semibold text-slate-900">
              No orders found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              No orders match this filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Order
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Total
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody>
                {visible.map((order) => {
                  const meta = STATUS_META[order.status];
                  const StatusIcon = meta.icon;
                  const isPending =
                    order.status === "pending_confirmation";

                  return (
                    <Fragment key={order.id}>
                      <tr
                        className={`border-b border-slate-100 transition ${
                          isPending
                            ? "bg-amber/[0.035] hover:bg-amber/[0.07]"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Order */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isPending && (
                              <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
                            )}

                            <div>
                              <p className="font-bold text-slate-900">
                                #{order.id}
                              </p>

                              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                                Order
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{order.recipient_name || "Customer"}</p>

                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-slate-400">
                            {order.shipping_phone} · {order.delivery_area || order.shipping_address}
                          </p>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">
                            {formatPrice(order.total_price)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {new Date(
                              order.created_at
                            ).toLocaleDateString()}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {new Date(
                              order.created_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${meta.classes}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                              />

                              <StatusIcon size={13} />
                              {meta.label}
                            </span>

                            <select
                              value={order.status}
                              disabled={updatingId === order.id || !(NEXT_STATUSES[order.status]?.length)}
                              onChange={(e) =>
                                handleStatusChange(
                                  order,
                                  e.target.value as OrderStatus
                                )
                              }
                              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-500 outline-none hover:border-slate-300 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Change status for order ${order.id}`}
                            >
                              {[order.status, ...(NEXT_STATUSES[order.status] ?? [])].map((s) => (
                                <option key={s} value={s}>
                                  {s === order.status ? `${STATUS_META[s].label} (current)` : STATUS_META[s].label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Expand */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === order.id
                                  ? null
                                  : order.id
                              )
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                            aria-label={
                              expandedId === order.id
                                ? "Collapse"
                                : "Expand"
                            }
                          >
                            {expandedId === order.id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded */}
                      {expandedId === order.id && (
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <td colSpan={6} className="px-6 py-6">
                            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                              <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Customer & delivery</p>

                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                  <p className="font-semibold text-slate-800">{order.recipient_name || "Customer"}</p>
                                  {order.recipient_email && <p className="mt-1 text-xs text-slate-500">{order.recipient_email}</p>}
                                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4"><CopyRow label="WhatsApp / phone" value={order.shipping_phone} copied={copied === `phone-${order.id}`} onCopy={() => copy(order.shipping_phone, `phone-${order.id}`)} icon={<MessageCircle size={14} />} /><CopyRow label="Full address" value={[order.shipping_address, order.delivery_area, order.delivery_city, order.delivery_postal_code].filter(Boolean).join(", ")} copied={copied === `address-${order.id}`} onCopy={() => copy([order.shipping_address, order.delivery_area, order.delivery_city, order.delivery_postal_code, order.delivery_landmark && `Landmark: ${order.delivery_landmark}`].filter(Boolean).join(", "), `address-${order.id}`)} icon={<MapPin size={14} />} /></div>
                                  {order.delivery_landmark && <p className="mt-3 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-700">Landmark:</span> {order.delivery_landmark}</p>}
                                  {order.delivery_instructions && <p className="mt-2 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-700">Instructions:</span> {order.delivery_instructions}</p>}
                                </div>
                              </div>

                              <div>
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                  Order items
                                </p>

                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                  {order.items.map((item, index) => (
                                    <div
                                      key={`${item.product_id}-${item.size}`}
                                      className={`flex items-center justify-between px-4 py-3 ${
                                        index !== order.items.length - 1
                                          ? "border-b border-slate-100"
                                          : ""
                                      }`}
                                    >
                                      <div>
                                        <p className="font-medium text-slate-800">
                                          {item.product_title}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                          {item.size !== "one-size"
                                            ? `Size ${item.size} · `
                                            : ""}
                                          Qty {item.quantity}
                                        </p>
                                      </div>

                                      <span className="font-semibold text-slate-700">
                                        {formatPrice(
                                          item.unit_price *
                                            item.quantity
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CopyRow({ label, value, copied, onCopy, icon }: { label: string; value: string; copied: boolean; onCopy: () => void; icon: ReactNode }) {
  return <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-sm text-slate-700">{value}</span><button type="button" onClick={onCopy} className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50" aria-label={`Copy ${label}`}>{copied ? <Check size={14} className="text-emerald-600" /> : icon || <Copy size={14} />}</button></div></div>;
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  status,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  status?: OrderStatus;
}) {
  const meta = status ? STATUS_META[status] : null;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {meta && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active ? "bg-white" : meta.dot
          }`}
        />
      )}

      {label}

      <span
        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
          active
            ? "bg-white/10 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
