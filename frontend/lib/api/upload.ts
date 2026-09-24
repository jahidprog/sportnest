import { API_URL } from "@/lib/constants";
import { ApiError } from "./client";

// Deliberately doesn't reuse apiFetch — that function always sets
// Content-Type: application/json, which would break a multipart upload
// (the browser needs to set Content-Type itself, with the correct
// boundary parameter, based on the FormData it's sending).
export async function uploadImage(file: File, accessToken: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const message = typeof parsed === "string" ? parsed : `Upload failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return (parsed as { url: string }).url;
}
