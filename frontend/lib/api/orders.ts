import { authedFetch } from "./client";
import { CheckoutInput, Order, OrderStatus } from "@/lib/types";

export async function checkout(input: CheckoutInput, accessToken: string): Promise<Order> {
  return authedFetch<Order>("/orders", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMyOrders(accessToken: string): Promise<Order[]> {
  const orders = await authedFetch<Order[]>("/orders", accessToken);
  return orders ?? [];
}

// --- admin-only ---

export async function getAllOrders(accessToken: string): Promise<Order[]> {
  const orders = await authedFetch<Order[]>("/admin/orders", accessToken);
  return orders ?? [];
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  accessToken: string
): Promise<void> {
  await authedFetch(`/admin/orders/${id}/status`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
