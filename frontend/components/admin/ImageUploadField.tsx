"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { useAuth } from "@/lib/store/auth-store";
import { resolveImageUrl } from "@/lib/utils/image";

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const accessToken = useAuth((s) => s.accessToken);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !accessToken) return;

    setError(null);
    setUploading(true);

    try {
      const url = await uploadImage(file, accessToken);
      onChange(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      {/* Label */}
      <div className="mb-2 flex items-center justify-between">
        <label className="font-mono text-[10px] font-semibold uppercase tracking-widest2 text-ink-60">
          {label}
        </label>

        {value && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Image ready
          </span>
        )}
      </div>

      {/* Upload area */}
      <div className="rounded-xl border border-black/[0.08] bg-[#fafafa] p-3">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Preview */}
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-black/[0.07] bg-white sm:h-28 sm:w-40">
            {value ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(value)}
                  alt=""
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 pb-2 pt-6">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-white">
                    Preview
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-ink/25">
                <ImageIcon size={25} strokeWidth={1.5} />

                <span className="font-mono text-[9px] uppercase tracking-wider">
                  No image
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-ink">
                Upload campaign media
              </p>

              <p className="mt-1 max-w-md text-[11px] leading-5 text-ink/40">
                Use a high-quality image. Landscape images work best for
                banners and product photography.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3.5 text-[11px] font-bold uppercase tracking-wide text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload image
                  </>
                )}
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[11px] font-semibold text-ink/50 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X size={13} />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* URL input */}
        <div className="mt-4 border-t border-black/[0.06] pt-4">
          <label className="mb-1.5 block font-mono text-[9px] font-semibold uppercase tracking-widest2 text-ink/40">
            Or use image URL
          </label>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="h-10 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-xs text-ink outline-none transition-all placeholder:text-ink/25 focus:border-ink/30 focus:ring-2 focus:ring-black/[0.03]"
          />
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      <p className="mt-2 text-[10px] text-ink/35">
        JPEG, PNG, WEBP, or GIF · Maximum 5MB
      </p>
    </div>
  );
}