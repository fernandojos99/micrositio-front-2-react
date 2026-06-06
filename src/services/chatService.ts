import { API_BASE_URL } from "@/apiClient";

const CHAT_API_BASE = `${API_BASE_URL}/api/chat`;
//const CHAT_API_BASE = 'https://micrositio-iris-backend.onrender.com/api/chat';

export interface PingResponse {
  status: string;
  service: string;
}


export interface Session {
  thread_id: string;
  titulo: string | null;
  last_checkpoint_id: string;
  last_update: string | null;
}

export interface SessionsResponse {
  sessions: Session[];
  count: number;
}

export interface SessionMessagesResponse {
  titulo?: string | null;
  messages: { role: string; content: string }[];
}

function handle401() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('auth_user');
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function fetchSessions(): Promise<SessionsResponse> {
  const response = await fetch(`${CHAT_API_BASE}/sessions`, {
    headers: { ...authHeaders() },
  });
  if (response.status === 401) handle401();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchSessionMessages(threadId: string): Promise<SessionMessagesResponse> {
  const response = await fetch(`${CHAT_API_BASE}/sessions/${threadId}/messages`, {
    headers: { ...authHeaders() },
  });
  if (response.status === 401) handle401();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

//delete session
export async function deleteSession(threadId: string): Promise<void> {
  const response = await fetch(`${CHAT_API_BASE}/sessions/${threadId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (response.status === 401) handle401();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

export async function streamMessage(body: { message: string; thread_id?: string }, signal?: AbortSignal): Promise<Response> {
  const response = await fetch(`${CHAT_API_BASE}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  });
  if (response.status === 401) handle401();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}



export async function pingBackend(): Promise<PingResponse> {
  const response = await fetch(`${CHAT_API_BASE}/ping`, {
    headers: { ...authHeaders() },
  });

  if (response.status === 401) handle401();
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
}