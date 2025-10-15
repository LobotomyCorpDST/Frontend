// ---------- BASE URL ----------
const RAW_BASE =
  process.env.REACT_APP_API ||
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:8080/api';

const BASE = String(RAW_BASE).replace(/\/+$/, '');

const CREDENTIALS =
  process.env.REACT_APP_CREDENTIALS === 'include'
    ? 'include'
    : process.env.REACT_APP_CREDENTIALS === 'same-origin'
    ? 'same-origin'
    : 'omit';

// ---------- TOKEN HELPER ----------
function getToken() {
  const envToken = (process.env.REACT_APP_DEV_BEARER || '').trim();
  if (envToken) return envToken;

  if (typeof window === 'undefined') return null;

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('jwt') ||
    null
  );
}

// ---------- URL BUILDER ----------
function buildUrl(base, path, params) {
  let url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  if (params && typeof params === 'object') {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v) => qs.append(key, v));
      } else if (value !== undefined && value !== null) {
        qs.set(key, value);
      }
    }
    const query = qs.toString();
    if (query) url += `?${query}`;
  }
  return url;
}

// ---------- RESPONSE PARSER ----------
async function parseResponse(res) {
  if (res.status === 204 || res.status === 205) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

// ---------- ERROR BUILDER ----------
function makeHttpError(res, body, fallbackMessage) {
  const err = new Error(
    (body && (body.error || body.message)) ||
      res.statusText ||
      fallbackMessage ||
      `HTTP ${res.status}`
  );
  err.status = res.status;
  err.body = body;
  return err;
}

// ---------- CORE REQUEST ----------
async function request(path, { method = 'GET', headers = {}, params, body } = {}) {
  const url = buildUrl(BASE, path, params);
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    mode: 'cors',
    credentials: CREDENTIALS,
  });

  if (!res.ok) {
    let parsed = null;
    try {
      parsed = await parseResponse(res);
      if (typeof parsed === 'string') parsed = { message: parsed };
    } catch {
      /* ignore */
    }

    if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
      try {
        ['token', 'access_token', 'jwt'].forEach((k) => localStorage.removeItem(k));
      } catch {
        /* noop */
      }
    }

    throw makeHttpError(res, parsed, `${method} ${path} failed`);
  }

  return parseResponse(res);
}

// ---------- EXPORT ----------
export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export default http;
export const API_BASE = BASE;
