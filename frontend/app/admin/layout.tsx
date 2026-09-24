"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";
import AdminSidebar from "@/components/admin/AdminSidebar";

// This guard is a UX convenience only — it stops a non-admin from seeing
// admin screens flash by, and redirects them somewhere sane. It is NOT
// the security boundary. Every admin API call still gets checked
// server-side by the backend's AdminOnly middleware regardless of what
// this component does; a client-side check can always be bypassed by
// someone editing JS in devtools, so the backend must never trust it.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isLoggedIn = useAuth((s) => s.isLoggedIn());
  const [checked, setChecked] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (user && !user.is_shop_owner) {
      router.replace("/");
      return;
    }

    setChecked(true);
  }, [isLoggedIn, user, router]);

  if (!checked || !user?.is_shop_owner) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f6f4]">
        {/* Ambient background */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#f5a623]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-ink/5 blur-3xl" />

        <div className="relative flex flex-col items-center">
          {/* Loading mark */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/10 bg-white shadow-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink/10 border-t-[#f5a623]" />
          </div>

          <p className="font-heading text-sm font-bold tracking-wide text-ink">
            Checking access
          </p>

          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/35">
            SportNest Admin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-ink">
      {/* Fixed admin navigation */}
      <AdminSidebar isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />

      {navigationOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavigationOpen(false)}
          className="fixed inset-0 z-30 bg-ink/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Main application area */}
      <main className="min-h-screen pl-0 lg:ml-64">
        <div className="flex h-14 items-center border-b border-ink/[0.06] bg-white px-5 lg:hidden">
          <button
            type="button"
            onClick={() => setNavigationOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
            aria-expanded={navigationOpen}
            aria-label="Toggle admin navigation"
          >
            {navigationOpen ? <X size={19} /> : <Menu size={19} />}
            Menu
          </button>
        </div>
        <div className="min-h-screen">
          {/* Top subtle border */}
          <div className="h-px w-full bg-ink/[0.06]" />

          {/* Page content */}
          <div className="mx-auto w-full max-w-[1800px]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
