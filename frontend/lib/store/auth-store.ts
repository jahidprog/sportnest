"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCart } from "./cart-store";
import { useWishlist } from "./wishlist-store";
import { AuthUser } from "@/lib/types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

// Persisted the same way the cart is — localStorage via Zustand's persist
// middleware. The token itself isn't verified client-side; every protected
// request still gets checked server-side by the backend's JWT middleware.
// This just remembers you're logged in between page loads.
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,

      setSession: (accessToken, user) => {
        // Scope the cart to whoever's actually logged in now — otherwise
        // user2 inherits whatever user1 left in the (shared) browser cart.
        useCart.getState().resetForUser(user.id);
        useWishlist.getState().resetForUser(user.id);
        set({ accessToken, user });
      },
      logout: () => {
        useCart.getState().resetForUser(null);
        useWishlist.getState().resetForUser(null);
        set({ accessToken: null, user: null });
      },
      isLoggedIn: () => get().accessToken !== null,
    }),
    { name: "sportnest-auth" }
  )
);
