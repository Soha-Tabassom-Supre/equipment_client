import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is missing.");
  }

  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication token unavailable. Please sign in.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${data.token}`);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "API request failed.");
  }

  return result;
}
