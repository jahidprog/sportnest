"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartLine } from "@/lib/types";
import { effectivePrice } from "@/lib/utils/format";

type CartState = {
  ownerId: number | null; // whose cart this is — null means "no one logged in"
  lines: CartLine[];
  isOpen: boolean;
  resetForUser: (userId: number | null) => void;
  clearCart: () => void;
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeLine: (productId: number, size: string) => void;
  setQuantity: (productId: number, size: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      ownerId: null,
      lines: [],
      isOpen: false,

      // Called from auth-store on login/logout. If the cart belonged to
      // someone else (or no one), wipe it — otherwise the next person to
      // log in on this browser inherits the previous person's bag.
      resetForUser: (userId) => {
        set((state) => {
          if (state.ownerId === userId) return {};
          return { ownerId: userId, lines: [], isOpen: false };
        });
      },

      // Called after a successful checkout — keeps ownerId as-is (still
      // the same logged-in user), just empties the bag.
      clearCart: () => set({ lines: [] }),

      addItem: (product, size, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === product.id && l.size === size
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id && l.size === size
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              ),
              isOpen: true,
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                title: product.title,
                price: effectivePrice(product),
                imageUrl: product.imageUrl,
                size,
                quantity,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeLine: (productId, size) => {
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.productId === productId && l.size === size)
          ),
        }));
      },

      setQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          get().removeLine(productId, size);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.productId === productId && l.size === size ? { ...l, quantity } : l
          ),
        }));
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      totalPrice: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "sportnest-cart" }
  )
);
