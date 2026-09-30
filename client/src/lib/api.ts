const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("cannot reach the server, is the backend running?", 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? "something went wrong", response.status);
  }

  return data as T;
}

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

export const register = (body: { name: string; email: string; password: string }) =>
  apiRequest<{ success: boolean; message: string; user: User }>(
    "/api/auth/register",
    { method: "POST", body },
  );

export const login = (body: { email: string; password: string }) =>
  apiRequest<{ success: boolean; message: string; user: User }>("/api/auth/login", {
    method: "POST",
    body,
  });

export const getMe = () =>
  apiRequest<{ success: boolean; user: User }>("/api/auth/get-me");