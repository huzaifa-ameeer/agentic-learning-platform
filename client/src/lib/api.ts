const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
    if (data === null) {
      throw new ApiError(
        `the server returned a non-json response (${response.status}). is the api url correct? currently ${API_URL}`,
        response.status,
      );
    }

    throw new ApiError(data.message ?? "something went wrong", response.status);
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

export const adminLogin = (body: { email: string; password: string }) =>
  apiRequest<{ success: boolean; message: string; user: User }>(
    "/api/auth/admin-login",
    { method: "POST", body },
  );

export const getMe = () =>
  apiRequest<{ success: boolean; user: User }>("/api/auth/get-me");

export const logout = () =>
  apiRequest<{ success: boolean; message: string }>("/api/auth/logout", {
    method: "POST",
  });

export type AgentIconGlyph =
  | "code"
  | "terminal"
  | "math"
  | "sigma"
  | "atom"
  | "dna"
  | "book"
  | "pen"
  | "globe"
  | "palette"
  | "music"
  | "shield"
  | "cpu"
  | "chart"
  | "rocket"
  | "robot"
  | "lock"
  | "key"
  | "puzzle"
  | "lightbulb"
  | "scale";

export type Agent = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  systemPrompt?: string;
  icon?: AgentIconGlyph | string;
  iconAccent?: "blue" | "green" | string;
  iconSource?: "ai" | "fallback" | string;
  createdAt: string;
  updatedAt: string;
};

export const getAgents = () =>
  apiRequest<{ success: boolean; agents: Agent[] }>("/api/agent/get-all");

export const getAgent = (id: string) =>
  apiRequest<{ success: boolean; agent: Agent }>(`/api/agent/get-single/${id}`);

export type AgentInput = {
  name: string;
  slug: string;
  description: string;
  systemPrompt: string;
  isActive?: boolean;
};

export const createAgent = (body: AgentInput) =>
  apiRequest<{ success: boolean; message: string; agent: Agent }>(
    "/api/agent/create",
    { method: "POST", body },
  );

export const updateAgent = (id: string, body: Partial<AgentInput>) =>
  apiRequest<{ success: boolean; message: string; agent: Agent }>(
    `/api/agent/update/${id}`,
    { method: "PUT", body },
  );

export const deleteAgent = (id: string) =>
  apiRequest<{ success: boolean; message: string; deletedSessions: number }>(
    `/api/agent/delete/${id}`,
    { method: "DELETE" },
  );

export type LearningSession = {
  _id: string;
  user: string;
  agent: Agent | null;
  title: string;
  status: "active" | "completed";
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  currentPage: number;
  limit: number;
  totalSessions: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const createSession = (agentId: string, title?: string) =>
  apiRequest<{ success: boolean; message: string; session: LearningSession }>(
    "/api/session/create",
    { method: "POST", body: { agentId, title } },
  );

export const getSession = (id: string) =>
  apiRequest<{ success: boolean; session: LearningSession }>(
    `/api/session/get-single/${id}`,
  );

export const deleteSession = (id: string) =>
  apiRequest<{ success: boolean; message: string }>(
    `/api/session/delete/${id}`,
    { method: "DELETE" },
  );

export const renameSession = (id: string, title: string) =>
  apiRequest<{ success: boolean; message: string; session: LearningSession }>(
    `/api/session/rename/${id}`,
    { method: "PATCH", body: { title } },
  );

export type Message = {
  _id: string;
  session: string;
  sender: "user" | "agent";
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const getSessionMessages = (sessionId: string) =>
  apiRequest<{ success: boolean; messages: Message[] }>(
    `/api/message/${sessionId}`,
  );

export const sendMessage = (body: { sessionId: string; content: string }) =>
  apiRequest<{
    success: boolean;
    message: string;
    data: {
      agent: { id: string; name: string; slug: string };
      userMessage: Message;
      agentMessage: Message;
    };
  }>("/api/message", { method: "POST", body });

export const getMySessions = (agentId?: string) =>
  apiRequest<{
    success: boolean;
    sessions: LearningSession[];
    pagination: Pagination;
  }>(
    agentId
      ? `/api/session/get-all?page=1&limit=50&agent=${agentId}`
      : "/api/session/get-all?page=1&limit=50",
  );