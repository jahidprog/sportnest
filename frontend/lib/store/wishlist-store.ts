"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  // Keep saved items tied to the signed-in customer, just like the cart.
  // The API has no wishlist resource yet, so product ids are persisted locally
  // per account until that server-side capability is introduced.
  ownerId: number | null;
  productIds: number[];
  productIdsByOwner: Record<string, number[]>;
  resetForUser: (userId: number | null) => void;
  toggle: (productId: number) => void;
  has: (productId: number) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ownerId: null,
      productIds: [],
      productIdsByOwner: {},
      resetForUser: (userId) => {
        set((state) => {
          if (state.ownerId === userId) return {};
          return {
            ownerId: userId,
            productIds:
              userId === null ? [] : state.productIdsByOwner[String(userId)] ?? [],
          };
        });
      },
      toggle: (productId) =>
        set((state) => {
          const productIds = state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId];
          return {
            productIds,
            productIdsByOwner:
              state.ownerId === null
                ? state.productIdsByOwner
                : { ...state.productIdsByOwner, [String(state.ownerId)]: productIds },
          };
        }),
      has: (productId) => get().productIds.includes(productId),
    }),
    { name: "sportnest-wishlist" }
  )
);
