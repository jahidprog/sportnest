import { authedFetch } from "./client";
import { User } from "@/lib/types";

// Admin only, both of these — matches the backend's /admin/users routes.

export async function getAllUsers(accessToken: string): Promise<User[]> {
  const users = await authedFetch<User[]>("/admin/users", accessToken);
  return users ?? [];
}

export async function updateUserRole(
  id: number,
  isShopOwner: boolean,
  accessToken: string
): Promise<void> {
  await authedFetch(`/admin/users/${id}/role`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ is_shop_owner: isShopOwner }),
  });
}
