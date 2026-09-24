"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner, Category, BannerInput } from "@/lib/types";
import { createBanner, updateBanner } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

// Converts an ISO datetime string to the format <input type="datetime-local">
function toLocalInput(iso?: string): string {
  if (!iso) return "";

  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BannerForm({
  banner,
  categories,
}: {
  banner?: Banner;
  categories: Category[];
}) {
  const router = useRouter();
  const accessToken = useAuth((s) => s.accessToken);
  const isEdit = !!banner;

  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [discountText, setDiscountText] = useState(
    banner?.discount_text ?? ""
  );
  const [imageUrl, setImageUrl] = useState(banner?.image_url ?? "");
  const [linkUrl, setLinkUrl] = useState(
    banner?.link_url ?? "/products"
  );
  const [categoryId, setCategoryId] = useState(
    banner?.category_id?.toString() ?? ""
  );
  const [isActive, setIsActive] = useState(
    banner?.is_active ?? true
  );
  const [startsAt, setStartsAt] = useState(
    toLocalInput(banner?.starts_at)
  );
  const [endsAt, setEndsAt] = useState(
    toLocalInput(banner?.ends_at)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken || !title.trim()) return;

    const startDate = startsAt ? new Date(startsAt) : null;
    const endDate = endsAt ? new Date(endsAt) : null;

    if (startDate && endDate && endDate < startDate) {
      setError("End date must be after the start date.");
      return;
    }

    const input: BannerInput = {
      title,
      subtitle,
      discount_text: discountText,
      image_url: imageUrl,
      link_url: linkUrl,
      category_id: categoryId ? parseInt(categoryId, 10) : null,
      is_active: isActive,
      starts_at: startDate ? startDate.toISOString() : null,
      ends_at: endDate ? endDate.toISOString() : null,
    };

    setError(null);
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateBanner(banner.id, input, accessToken);
      } else {
        await createBanner(input, accessToken);
      }

      router.push("/admin/banners");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main editor */}
        <div className="space-y-6">
          {/* Content */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
                  <span className="text-sm font-bold">01</span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Banner content
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Main information displayed on the storefront.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <Input
                id="title"
                label="Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Winter Sale"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="subtitle"
                  label="Subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="On all jerseys this week"
                />

                <Input
                  id="discountText"
                  label="Discount text"
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                  placeholder="50% OFF"
                />
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
                  <span className="text-sm font-bold">02</span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Banner media
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Upload the image used for this campaign.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ImageUploadField
                label="Banner image"
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
          </section>

          {/* Destination */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
                  <span className="text-sm font-bold">03</span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Destination
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Where customers should go when they click.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Input
                id="linkUrl"
                label="Links to"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/products?category=jerseys"
              />

              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-widest2 text-ink-60"
                >
                  Category
                  <span className="ml-1 normal-case tracking-normal text-ink/30">
                    optional
                  </span>
                </label>

                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-[42px] w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 text-sm text-ink outline-none transition-all focus:border-ink/30 focus:bg-white focus:ring-2 focus:ring-black/[0.03]"
                >
                  <option value="">None</option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f5a623]/10 text-[#b97800]">
                  <span className="text-sm font-bold">04</span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-ink">
                    Schedule
                  </h2>
                  <p className="mt-0.5 text-xs text-ink/40">
                    Control when the banner appears.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="startsAt"
                  label="Starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />

                <Input
                  id="endsAt"
                  label="Ends"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-ink/40">
                Leave both blank to run indefinitely while active.
              </p>
            </div>
          </section>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Status card */}
          <section className="rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                Publishing
              </p>
            </div>

            <div className="p-5">
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                  isActive
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-black/[0.07] bg-[#fafafa]"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {isActive ? "Active" : "Inactive"}
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-ink/40">
                    {isActive
                      ? "Visible on the storefront"
                      : "Hidden from the storefront"}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    isActive ? "bg-emerald-500" : "bg-black/15"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
              </label>
            </div>
          </section>

          {/* Image preview */}
          <section className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
                Preview
              </p>
            </div>

            <div className="p-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#f3f3f1]">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-black/[0.04]">
                      <span className="text-lg text-ink/30">+</span>
                    </div>

                    <p className="text-xs font-medium text-ink/40">
                      Banner preview
                    </p>
                  </div>
                )}
              </div>

              {title && (
                <div className="mt-4">
                  <p className="truncate text-sm font-bold text-ink">
                    {title}
                  </p>

                  {subtitle && (
                    <p className="mt-1 line-clamp-2 text-xs text-ink/45">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create banner"}
        </Button>
      </div>
    </form>
  );
}