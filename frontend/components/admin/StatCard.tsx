import { LucideIcon, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "amber" | "crest";
}) {
  const styles = {
    default: {
      icon: "bg-black/[0.04] text-ink",
      dot: "bg-ink",
    },
    amber: {
      icon: "bg-[#f5a623]/10 text-[#b97800]",
      dot: "bg-[#f5a623]",
    },
    crest: {
      icon: "bg-red-50 text-red-600",
      dot: "bg-red-500",
    },
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/[0.12] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
      {/* Decorative corner */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-black/[0.015] transition-transform duration-500 group-hover:scale-125" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${styles.icon}`}>
            <Icon size={19} strokeWidth={1.8} />
          </div>

          <ArrowUpRight
            size={15}
            className="text-ink/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink/40"
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
            />

            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink/40">
              {label}
            </p>
          </div>

          <p className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}