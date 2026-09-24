import { apiFetch, authedFetch } from "./client";
import { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  try {
    return (await apiFetch<Category[]>("/categories")) ?? [];
  } catch {
    // Categories are a progressive enhancement (filter buttons) — if the
    // backend is briefly unreachable, degrade to an unfiltered product
    // list rather than breaking the whole products page.
    return [];
  }
}

export async function createCategory(name: string, accessToken: string): Promise<Category> {
  return authedFetch<Category>("/categories", accessToken, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function updateCategory(id: number, name: string, accessToken: string): Promise<Category> {
  return authedFetch<Category>(`/categories/${id}`, accessToken, { method: "PUT", body: JSON.stringify({ name }) });
}

export async function deleteCategory(id: number, replacementCategoryId: number | null, accessToken: string): Promise<void> {
  await authedFetch(`/categories/${id}`, accessToken, { method: "DELETE", body: JSON.stringify({ replacement_category_id: replacementCategoryId }) });
}
