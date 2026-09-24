import { API_URL } from "@/lib/constants";

// The backend returns uploaded image URLs as relative paths ("/uploads/xyz.png")
// since it doesn't know its own public hostname. Left as-is, the browser
// would resolve that against the FRONTEND's origin (wrong server, 404).
// External URLs (Unsplash, etc. — anything already absolute) pass through
// untouched. Every place that renders product.imageUrl or banner.image_url
// as an <img src> needs to go through this.
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
}
