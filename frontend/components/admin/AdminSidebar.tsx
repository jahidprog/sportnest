"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Megaphone,
  FileBarChart,
  Users,
  LogOut,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth-store";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/banners", label: "Banners", icon: Megaphone },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
];

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-black/[0.07] bg-white text-ink shadow-xl transition-transform duration-200 lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Brand */}
      <div className="flex h-[76px] items-center border-b border-black/[0.07] px-7">
        <Link href="/admin" className="relative block h-9 w-32">
          <Image
            src="/logo.png"
            alt="SportNest"
            fill
            className="object-contain object-left"
          />
        </Link>

        <span className="ml-auto rounded-md bg-ink px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-7">
        <p className="mb-3 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
          Workspace
        </p>

        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#f5a623]/10 text-ink"
                    : "text-ink/55 hover:bg-black/[0.035] hover:text-ink"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-[#f5a623]" />
                )}

                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    isActive
                      ? "bg-[#f5a623] text-ink"
                      : "bg-black/[0.035] text-ink/45 group-hover:bg-black/[0.06] group-hover:text-ink"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                </span>

                <span className="flex-1">{item.label}</span>

                {isActive && (
                  <ChevronRight
                    size={14}
                    className="text-ink/35"
                    strokeWidth={2}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom area */}
      <div className="border-t border-black/[0.07] p-4">
        <Link
          href="/"
          target="_blank"
          onClick={onClose}
          className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-ink/50 transition-colors hover:bg-black/[0.035] hover:text-ink"
        >
          <ExternalLink size={15} strokeWidth={1.8} />
          View storefront
        </Link>

        {/* User */}
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#f7f7f5] p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold uppercase text-white">
            {user?.first_name?.charAt(0)}
            {user?.last_name?.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-ink">
              {user?.first_name} {user?.last_name}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-ink/45">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-ink/45 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  );
}
