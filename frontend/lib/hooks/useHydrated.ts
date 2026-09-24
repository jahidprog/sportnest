"use client";

import { useEffect, useState } from "react";

// Zustand's persisted stores read localStorage in the browser only. Rendering
// persisted values before this effect runs makes the client’s first tree differ
// from the server tree, which causes React hydration errors.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
