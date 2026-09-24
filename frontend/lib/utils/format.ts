import { Product } from "@/lib/types";

export function formatPrice(price: number): string {
  return `BDT ${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// The price a customer actually pays — discount_price if present, else price.
export function effectivePrice(product: Product): number {
  return product.discount_price ?? product.price;
}

export function hasDiscount(product: Product): boolean {
  return product.discount_price != null;
}
