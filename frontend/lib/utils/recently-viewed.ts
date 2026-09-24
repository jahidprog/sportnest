const KEY = "sportnest-recently-viewed";
const MAX_ITEMS = 8;

// Records a product view, most-recent-first, capped at MAX_ITEMS. Safe to
// call from a Client Component's useEffect on the product detail page.
export function trackProductView(productId: number): void {
  if (typeof window === "undefined") return;
  try {
    const ids = readIds().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage can throw in private-browsing modes — this is a nice-
    // to-have feature, not worth surfacing an error for.
  }
}

export function getRecentlyViewedIds(excludeId?: number): number[] {
  const ids = readIds();
  return excludeId ? ids.filter((id) => id !== excludeId) : ids;
}

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
