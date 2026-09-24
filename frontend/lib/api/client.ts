import { API_URL } from "@/lib/constants";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// The backend's util.SendData writes the data straight to the response
// body — no {data: ...} envelope — and util.SendError writes just a raw
// JSON-encoded string as the whole body (e.g. "invalid credentials"), not
// {error: "..."}. So a successful response body IS the T directly, and an
// error response body is just a string. Every API call goes through this
// one function so that fact only has to be known in one place.
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    const message = typeof parsed === "string" ? parsed : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }
  return parsed as T;
}

// Attaches a Bearer token for authenticated requests. Kept separate from
// apiFetch so unauthenticated calls (product listing, etc.) don't need to
// thread a possibly-null token through every call site.
export async function authedFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers },
  });
}
