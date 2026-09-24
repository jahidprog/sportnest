"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  CalendarDays,
  CircleCheck,
  CircleOff,
  Clock3,
  AlertCircle,
} from "lucide-react";
import { getAllBanners, updateBanner, deleteBanner } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Banner, BannerInput } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { resolveImageUrl } from "@/lib/utils/image";

function bannerToInput(b: Banner): BannerInput {
  return {
    title: b.title,
    subtitle: b.subtitle,
    discount_text: b.discount_text,
    image_url: b.image_url,
    link_url: b.link_url,
    category_id: b.category_id ?? null,
    is_active: b.is_active,
    starts_at: b.starts_at ?? null,
    ends_at: b.ends_at ?? null,
  };
}

function getBannerStatus(banner: Banner) {
  const now = new Date();

  const startsAt = banner.starts_at ? new Date(banner.starts_at) : null;
  const endsAt = banner.ends_at ? new Date(banner.ends_at) : null;

  if (!banner.is_active) {
    return {
      label: "Inactive",
      description: "Hidden from storefront",
      icon: CircleOff,
      className: "bg-zinc-100 text-zinc-600 border-zinc-200",
      dotClass: "bg-zinc-400",
    };
  }

  if (startsAt && startsAt > now) {
    return {
      label: "Scheduled",
      description: "Waiting for start date",
      icon: Clock3,
      className: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500",
    };
  }

  if (endsAt && endsAt < now) {
    return {
      label: "Expired",
      description: "Date window has ended",
      icon: AlertCircle,
      className: "bg-red-50 text-red-700 border-red-200",
      dotClass: "bg-red-500",
    };
  }

  return {
    label: "Live",
    description: "Visible on storefront",
    icon: CircleCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
  };
}

function formatDate(date?: string | null) {
  if (!date) return null;

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminBannersPage() {
  const accessToken = useAuth((s) => s.accessToken);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = () => {
    if (!accessToken) return;

    setLoading(true);

    getAllBanners(accessToken)
      .then(setBanners)
      .finally(() => setLoading(false));
  };

  useEffect(load, [accessToken]);

  const handleToggle = async (banner: Banner) => {
    if (!accessToken) return;

    setTogglingId(banner.id);

    try {
      const updated = {
        ...bannerToInput(banner),
        is_active: !banner.is_active,
      };

      await updateBanner(banner.id, updated, accessToken);

      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id
            ? { ...b, is_active: !b.is_active }
            : b
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update banner.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!accessToken) return;

    if (!confirm(`Delete "${banner.title}"?`)) return;

    try {
      await deleteBanner(banner.id, accessToken);

      setBanners((prev) =>
        prev.filter((b) => b.id !== banner.id)
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete banner.");
    }
  };

  const liveCount = banners.filter((banner) => {
    const status = getBannerStatus(banner);
    return status.label === "Live";
  }).length;

  const scheduledCount = banners.filter((banner) => {
    const status = getBannerStatus(banner);
    return status.label === "Scheduled";
  }).length;

  const inactiveCount = banners.filter((banner) => {
    const status = getBannerStatus(banner);
    return status.label === "Inactive";
  }).length;

  return (
    <div className="min-h-full p-6 md:p-8 lg:p-10">
      <AdminPageHeader
        title="Banners"
        subtitle="Manage promotional campaigns and storefront hero content."
        action={
          <Link href="/admin/banners/new">
            <Button size="md">
              <Plus size={16} />
              Add banner
            </Button>
          </Link>
        }
      />

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-60">
            Total banners
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {banners.length}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Live
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-800">
            {liveCount}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Scheduled
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-800">
            {scheduledCount}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Inactive
            </p>
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-800">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink/10 border-t-ink" />

          <p className="mt-4 text-sm text-ink-60">
            Loading banners...
          </p>
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-20 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink/5">
            <Plus size={24} className="text-ink-60" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-ink">
            No banners yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-ink-60">
            Create your first promotional banner to start controlling
            what customers see on the storefront.
          </p>

          <div className="mt-6">
            <Link href="/admin/banners/new">
              <Button size="md">
                <Plus size={16} />
                Create your first banner
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {banners.map((banner) => {
            const status = getBannerStatus(banner);
            const StatusIcon = status.icon;

            return (
              <article
                key={banner.id}
                className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)]"
              >
                {/* Image */}
                <div className="relative aspect-[16/8] overflow-hidden bg-ink">
                  {banner.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resolveImageUrl(banner.image_url)}
                      alt={banner.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink to-ink/80">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                        No banner image
                      </p>
                    </div>
                  )}

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  {/* Status */}
                  <div className="absolute left-4 top-4">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-md ${status.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
                      />

                      <StatusIcon size={12} />

                      {status.label}
                    </div>
                  </div>

                  {/* Discount */}
                  {banner.discount_text && (
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-md bg-white px-3 py-1.5 text-sm font-bold text-ink shadow-lg">
                        {banner.discount_text}
                      </span>
                    </div>
                  )}

                  {/* External preview */}
                  <Link
                    href={banner.link_url || "/"}
                    target="_blank"
                    aria-label={`Preview ${banner.title}`}
                    className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white hover:text-ink"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold tracking-tight text-ink">
                        {banner.title}
                      </h2>

                      {banner.subtitle && (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink-60">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggle(banner)}
                      disabled={togglingId === banner.id}
                      aria-label={
                        banner.is_active
                          ? `Deactivate ${banner.title}`
                          : `Activate ${banner.title}`
                      }
                      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                        banner.is_active
                          ? "bg-emerald-500"
                          : "bg-zinc-200"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          banner.is_active
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="mt-5 grid gap-3 border-y border-ink/8 py-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2.5">
                      <CalendarDays
                        size={15}
                        className="mt-0.5 flex-shrink-0 text-ink-40"
                      />

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-40">
                          Schedule
                        </p>

                        <p className="mt-1 text-xs font-medium text-ink-70">
                          {banner.starts_at
                            ? formatDate(banner.starts_at)
                            : "Immediately"}
                          {" → "}
                          {banner.ends_at
                            ? formatDate(banner.ends_at)
                            : "No end date"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <StatusIcon
                        size={15}
                        className="mt-0.5 flex-shrink-0 text-ink-40"
                      />

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-40">
                          Status
                        </p>

                        <p className="mt-1 text-xs font-medium text-ink-70">
                          {status.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={`/admin/banners/${banner.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-ink/85"
                    >
                      <Pencil size={14} />
                      Edit banner
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(banner)}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-50 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}