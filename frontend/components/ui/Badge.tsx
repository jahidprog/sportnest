type BadgeTone = "amber" | "crest" | "pitch" | "ink";

const toneClasses: Record<BadgeTone, string> = {
  amber: "bg-amber text-ink",
  crest: "bg-crest text-chalk",
  pitch: "bg-pitch text-chalk",
  ink: "bg-ink/70 text-chalk",
};

export function Badge({
  tone = "ink",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-mono font-bold tracking-widest2 uppercase ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
