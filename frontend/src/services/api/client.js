/**
 * Django REST API client (JWT). Enabled only when VITE_API_BASE_URL is set; otherwise the
 * app keeps running fully offline on the seeded Zustand store.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'bikeerp-auth-tokens';

export const isBackendEnabled = () => Boolean(BASE_URL);

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function readTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)) || null;
  } catch {
    return null;
  }
}

export function getTokens() {
  return readTokens();
}

export function setTokens(tokens) {
  try {
    if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable (private mode); tokens live for this tab only
  }
}

const unauthorizedListeners = new Set();
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function errorMessage(body, status) {
  if (!body) return `Request failed (${status})`;
  if (typeof body === 'string') return body;
  if (body.detail) return body.detail;
  const first = Object.entries(body)[0];
  if (first) return `${first[0]}: ${Array.isArray(first[1]) ? first[1].join(' ') : first[1]}`;
  return `Request failed (${status})`;
}

let refreshing = null;
async function refreshAccessToken() {
  const tokens = readTokens();
  if (!tokens?.refresh) return false;
  refreshing ??= fetch(`${BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = await res.json();
      setTokens({ access: data.access, refresh: data.refresh || tokens.refresh });
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const tokens = readTokens();
  if (auth && tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry && (await refreshAccessToken())) {
    return apiRequest(path, { method, body, auth, retry: false });
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setTokens(null);
      unauthorizedListeners.forEach((fn) => fn());
    }
    throw new ApiError(errorMessage(data, res.status), res.status, data);
  }
  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body = {}) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body = {}) => apiRequest(path, { method: 'PATCH', body }),
};
