"use client";

import { useEffect, useState } from "react";
import {
  FileDown,
  CalendarDays,
  ShoppingBag,
  CircleDollarSign,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { getAllOrders } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";
import {
  getMonthlyOrders,
  getYearlyOrders,
  generateSalesReportPDF,
} from "@/lib/utils/report";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function AdminReportsPage() {
  const accessToken = useAuth((s) => s.accessToken);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  const [reportType, setReportType] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!accessToken) return;

    getAllOrders(accessToken)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [accessToken]);

  const availableYears = Array.from(
    new Set(orders.map((o) => new Date(o.created_at).getFullYear()))
  ).sort((a, b) => b - a);

  if (availableYears.length === 0) {
    availableYears.push(now.getFullYear());
  }

  const period =
    reportType === "monthly"
      ? getMonthlyOrders(orders, year, month)
      : getYearlyOrders(orders, year);

  const completedOrders = period.orders.filter(
    (o) => o.status !== "cancelled"
  );

  const cancelledOrders = period.orders.filter(
    (o) => o.status === "cancelled"
  );

  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + o.total_price,
    0
  );

  return (
    <div className="min-h-full p-6 md:p-8 lg:p-10">
      <AdminPageHeader
        title="Reports"
        subtitle="Analyze sales performance and generate downloadable reports."
      />

      {loading ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink/10 border-t-ink" />

          <p className="mt-4 text-sm text-ink-60">
            Loading order data...
          </p>
        </div>
      ) : (
        <>
          {/* Report Header */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-ink text-chalk">
            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                    <BarChart3 size={16} />
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-chalk/50">
                    Sales analytics
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {period.label}
                </h2>

                <p className="mt-2 max-w-lg text-sm text-chalk/55">
                  Review your order activity, completed sales and revenue
                  for the selected reporting period.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <CalendarDays size={18} className="text-chalk/50" />

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-chalk/40">
                    Report type
                  </p>

                  <p className="mt-0.5 text-sm font-semibold">
                    {reportType === "monthly"
                      ? "Monthly report"
                      : "Annual report"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            {/* Controls */}
            <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-40">
                  Report settings
                </p>

                <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">
                  Choose period
                </h2>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-2 rounded-xl bg-ink/5 p-1">
                <button
                  type="button"
                  onClick={() => setReportType("monthly")}
                  className={`rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition-all ${
                    reportType === "monthly"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-50 hover:text-ink"
                  }`}
                >
                  Monthly
                </button>

                <button
                  type="button"
                  onClick={() => setReportType("yearly")}
                  className={`rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition-all ${
                    reportType === "yearly"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink-50 hover:text-ink"
                  }`}
                >
                  Yearly
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {reportType === "monthly" && (
                  <div>
                    <label
                      htmlFor="month"
                      className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-ink-50"
                    >
                      Month
                    </label>

                    <select
                      id="month"
                      value={month}
                      onChange={(e) =>
                        setMonth(parseInt(e.target.value, 10))
                      }
                      className="w-full rounded-xl border border-ink/10 bg-ink/[0.025] px-3.5 py-3 text-sm font-medium text-ink outline-none transition-colors focus:border-ink/30 focus:bg-white"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="year"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-ink-50"
                  >
                    Year
                  </label>

                  <select
                    id="year"
                    value={year}
                    onChange={(e) =>
                      setYear(parseInt(e.target.value, 10))
                    }
                    className="w-full rounded-xl border border-ink/10 bg-ink/[0.025] px-3.5 py-3 text-sm font-medium text-ink outline-none transition-colors focus:border-ink/30 focus:bg-white"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected period */}
              <div className="mt-5 rounded-xl bg-ink p-4 text-chalk">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chalk/40">
                  Selected period
                </p>

                <p className="mt-1 text-lg font-bold">
                  {period.label}
                </p>

                <p className="mt-1 text-xs text-chalk/45">
                  {period.orders.length} order
                  {period.orders.length === 1 ? "" : "s"} found
                </p>
              </div>

              <Button
                onClick={() => generateSalesReportPDF(period)}
                disabled={period.orders.length === 0}
                className="mt-5 w-full"
              >
                <FileDown size={16} />
                Download PDF
              </Button>

              {period.orders.length === 0 && (
                <p className="mt-3 text-center text-xs leading-5 text-ink-50">
                  No orders are available for this period.
                </p>
              )}
            </aside>

            {/* Analytics */}
            <main className="min-w-0">
              {/* KPI cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-ink/10 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-40">
                        Total orders
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
                        {period.orders.length}
                      </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink/5">
                      <ShoppingBag size={18} className="text-ink-60" />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-ink-40">
                    All orders placed during this period
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700/70">
                        Completed
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-800">
                        {completedOrders.length}
                      </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100">
                      <CheckCircle2
                        size={18}
                        className="text-emerald-700"
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-emerald-700/60">
                    Non-cancelled orders
                  </p>
                </div>

                <div className="rounded-2xl border border-ink/10 bg-white p-5 sm:col-span-2 xl:col-span-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-40">
                        Cancelled
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight text-red-600">
                        {cancelledOrders.length}
                      </p>
                    </div>

                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50">
                      <XCircle size={18} className="text-red-500" />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-ink-40">
                    Cancelled orders excluded from revenue
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <div className="mt-4 overflow-hidden rounded-2xl bg-white border border-ink/10">
                <div className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-end md:p-7">
                  <div>
                    <div className="flex items-center gap-2">
                      <CircleDollarSign
                        size={17}
                        className="text-ink-40"
                      />

                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-40">
                        Net revenue
                      </p>
                    </div>

                    <p className="mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">
                      {formatPrice(totalRevenue)}
                    </p>

                    <p className="mt-2 text-xs text-ink-40">
                      Revenue from non-cancelled orders
                    </p>
                  </div>

                  <div className="rounded-xl bg-ink/5 px-4 py-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-40">
                      Average order value
                    </p>

                    <p className="mt-1 text-lg font-bold text-ink">
                      {completedOrders.length > 0
                        ? formatPrice(
                            totalRevenue / completedOrders.length
                          )
                        : formatPrice(0)}
                    </p>
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-ink via-amber to-ink" />
              </div>

              {/* Orders */}
              <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Orders in this period
                    </p>

                    <p className="mt-0.5 text-xs text-ink-40">
                      Recent order activity
                    </p>
                  </div>

                  <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold text-ink-60">
                    {period.orders.length}
                  </span>
                </div>

                {period.orders.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-ink/5">
                      <ShoppingBag
                        size={20}
                        className="text-ink-40"
                      />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-ink">
                      No orders found
                    </p>

                    <p className="mt-1 text-xs text-ink-40">
                      Try selecting a different reporting period.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[390px] overflow-y-auto">
                    <div className="divide-y divide-ink/5">
                      {period.orders.map((order) => {
                        const cancelled =
                          order.status === "cancelled";

                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-ink/[0.018]"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${
                                  cancelled
                                    ? "bg-red-50 text-red-500"
                                    : "bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                {cancelled ? (
                                  <XCircle size={16} />
                                ) : (
                                  <CheckCircle2 size={16} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">
                                  Order #{order.id}
                                </p>

                                <p className="mt-0.5 text-xs text-ink-40">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString(undefined, {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <p
                                className={`text-sm font-bold ${
                                  cancelled
                                    ? "text-ink-40 line-through"
                                    : "text-ink"
                                }`}
                              >
                                {formatPrice(order.total_price)}
                              </p>

                              <p
                                className={`mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                                  cancelled
                                    ? "text-red-500"
                                    : "text-emerald-600"
                                }`}
                              >
                                {cancelled
                                  ? "Cancelled"
                                  : "Included"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}