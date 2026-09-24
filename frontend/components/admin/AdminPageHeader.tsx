export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {/* Title section */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5a623]/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5a623]" />
            </span>

            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-ink/35">
              SPORTNEST / ADMIN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="truncate font-heading text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              {title}
            </h1>
          </div>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/45">
              {subtitle}
            </p>
          )}
        </div>

        {/* Page action */}
        {action && (
          <div className="shrink-0 [&_button]:shadow-sm">
            {action}
          </div>
        )}
      </div>

      {/* Bottom divider */}
      <div className="mt-6 h-px w-full bg-ink/10" />
    </header>
  );
}