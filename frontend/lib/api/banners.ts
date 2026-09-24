import { apiFetch, authedFetch } from "./client";
import { Banner, BannerInput } from "@/lib/types";

// Public — used by the storefront popup. Backend already filters to
// is_active + within the starts_at/ends_at window, so this is safe to
// render directly without re-checking dates client-side.
export async function getActiveBanners(): Promise<Banner[]> {
  try {
    return (await apiFetch<Banner[]>("/banners")) ?? [];
  } catch {
    return [];
  }
}

// --- admin-only ---

export async function getAllBanners(accessToken: string): Promise<Banner[]> {
  const banners = await authedFetch<Banner[]>("/admin/banners", accessToken);
  return banners ?? [];
}

export async function getBanner(id: number, accessToken: string): Promise<Banner> {
  return authedFetch<Banner>(`/admin/banners/${id}`, accessToken);
}

export async function createBanner(input: BannerInput, accessToken: string): Promise<Banner> {
  return authedFetch<Banner>("/admin/banners", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBanner(
  id: number,
  input: BannerInput,
  accessToken: string
): Promise<Banner> {
  return authedFetch<Banner>(`/admin/banners/${id}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteBanner(id: number, accessToken: string): Promise<void> {
  await authedFetch(`/admin/banners/${id}`, accessToken, { method: "DELETE" });
}
