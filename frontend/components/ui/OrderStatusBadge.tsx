import { OrderStatus } from "@/lib/types";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending_confirmation: { label: "Pending", className: "bg-amber/20 text-amber-dim" },
  confirmed: { label: "Confirmed", className: "bg-pitch/15 text-pitch" },
  out_for_delivery: { label: "Out for delivery", className: "bg-ink/10 text-ink" },
  delivered: { label: "Delivered", className: "bg-pitch text-chalk" },
  cancelled: { label: "Cancelled", className: "bg-crest/15 text-crest" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? { label: status, className: "bg-ink/10 text-ink" };
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] font-mono font-bold tracking-widest2 uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
