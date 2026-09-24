import { apiFetch, authedFetch } from "./client";
import { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  const products = await apiFetch<Product[]>("/products");
  return products ?? [];
}

export async function getProduct(id: string | number): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${id}`);
  } catch {
    return null;
  }
}

export type ProductInput = {
  title: string;
  description: string;
  price: number;
  discount_price: number | null;
  stock: number;
  sizes: string[];
  category_id: number | null;
  imageUrl: string;
};

// --- admin-only, all require a valid access_token from an is_shop_owner user ---

export async function createProduct(input: ProductInput, accessToken: string): Promise<Product> {
  return authedFetch<Product>("/products", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: number,
  input: ProductInput,
  accessToken: string
): Promise<Product> {
  return authedFetch<Product>(`/products/${id}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: number, accessToken: string): Promise<void> {
  await authedFetch(`/products/${id}`, accessToken, { method: "DELETE" });
}
