import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";

// Deliberately uses ONLY doc.text() and autoTable() with our own trusted
// server data (order totals, dates, product titles from the database) —
// no image embedding, no AcroForm fields, no addJS. jsPDF's known CVEs
// all require one of those features; this report never touches them.

type ReportPeriod = { label: string; orders: Order[] };

function buildPeriod(orders: Order[], label: string): ReportPeriod {
  return { label, orders };
}

export function getMonthlyOrders(orders: Order[], year: number, month: number): ReportPeriod {
  const filtered = orders.filter((o) => {
    const d = new Date(o.created_at);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const label = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return buildPeriod(filtered, label);
}

export function getYearlyOrders(orders: Order[], year: number): ReportPeriod {
  const filtered = orders.filter((o) => new Date(o.created_at).getFullYear() === year);
  return buildPeriod(filtered, String(year));
}

export function generateSalesReportPDF(period: ReportPeriod) {
  const doc = new jsPDF();
  const { label, orders } = period;

  const completedOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  // Aggregate units sold per product across the period.
  const productTotals = new Map<string, { qty: number; revenue: number }>();
  for (const order of completedOrders) {
    for (const item of order.items) {
      const key = item.product_title;
      const existing = productTotals.get(key) ?? { qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += item.unit_price * item.quantity;
      productTotals.set(key, existing);
    }
  }
  const topProducts = [...productTotals.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  // --- Header ---
  doc.setFontSize(18);
  doc.text("SportNest — Sales Report", 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Period: ${label}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  // --- Summary ---
  autoTable(doc, {
    startY: 42,
    head: [["Metric", "Value"]],
    body: [
      ["Total orders", String(orders.length)],
      ["Completed orders", String(completedOrders.length)],
      ["Cancelled orders", String(cancelledCount)],
      ["Total revenue", formatPrice(totalRevenue)],
      ["Average order value", formatPrice(avgOrderValue)],
    ],
    theme: "plain",
    headStyles: { fillColor: [20, 26, 46] },
    margin: { left: 14, right: 14 },
  });

  // --- Top products ---
  const afterSummaryY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(13);
  doc.setTextColor(20, 26, 46);
  doc.text("Top products", 14, afterSummaryY + 12);

  autoTable(doc, {
    startY: afterSummaryY + 16,
    head: [["Product", "Units sold", "Revenue"]],
    body:
      topProducts.length > 0
        ? topProducts.map(([title, data]) => [title, String(data.qty), formatPrice(data.revenue)])
        : [["No sales in this period", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [20, 26, 46] },
    margin: { left: 14, right: 14 },
  });

  // --- Order log ---
  const afterProductsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(13);
  doc.text("Order log", 14, afterProductsY + 12);

  autoTable(doc, {
    startY: afterProductsY + 16,
    head: [["Order #", "Date", "Status", "Total"]],
    body:
      orders.length > 0
        ? orders.map((o) => [
            `#${o.id}`,
            new Date(o.created_at).toLocaleDateString(),
            o.status.replace(/_/g, " "),
            formatPrice(o.total_price),
          ])
        : [["No orders in this period", "-", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [20, 26, 46] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`sportnest-sales-report-${label.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
