// In production: Vercel rewrites proxy /api/* to Render (same-origin, no CORS).
// In local dev: set VITE_API_BASE_URL=http://localhost:8000/api in .env to bypass the proxy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Handles ALL your old error shapes: detail, message, error,
    // non_field_errors[0], and field errors like email[0] / title[0]
    let message: string | null =
      data?.detail || data?.message || data?.error || null;

    if (!message && typeof data === "object" && data !== null) {
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
          message = value[0];
          break;
        }
        if (typeof value === "string") {
          message = value;
          break;
        }
      }
    }

    throw new ApiError(response.status, message || "Request failed");
  }

  return data as T;
}
