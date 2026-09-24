import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Section = { heading: string; body: string };

export function InfoPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
      <p className="font-mono text-xs uppercase tracking-widest2 text-amber-dim">{eyebrow}</p>
      <h1 className="mt-3 font-display text-5xl tracking-tightest text-ink md:text-7xl">{title}</h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-ink-60 md:text-lg">{intro}</p>
      <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
        {sections.map((section) => (
          <section key={section.heading} className="py-7 md:py-9">
            <h2 className="font-heading text-2xl font-bold tracking-wide text-ink">{section.heading}</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-ink-60">{section.body}</p>
          </section>
        ))}
      </div>
      <Link href="/products" className="mt-10 inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-heading font-bold tracking-wide text-chalk transition-colors hover:bg-amber hover:text-ink">
        SHOP THE COLLECTION <ArrowRight size={18} />
      </Link>
    </div>
  );
}
