// ---------- BASE URL ----------
const RAW_BASE =
  process.env.REACT_APP_API ||
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://34.87.82.168:8080';

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
  const normalizedBase = base === '/' ? '' : base.replace(/\/+$/, '');
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Avoid issuing `/api/api/...` when both base and path already include the prefix
  if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api')) {
    normalizedPath = normalizedPath.replace(/^\/api/, '') || '/';
  }

  const joined = `${normalizedBase}${normalizedPath}`;
  let url = joined || normalizedPath || '/';

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

// ---------- CORE REQUEST (JSON/TEXT) ----------
async function request(path, { method = 'GET', headers = {}, params, body } = {}) {
  const url = buildUrl(BASE, path, params);
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const baseHeaders = {
    Accept: 'application/json',
    ...authHeader,
    ...headers,
  };
  if (body !== undefined && baseHeaders['Content-Type'] == null) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers: baseHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    mode: 'cors',
    credentials: CREDENTIALS,
  });

  if (!res.ok) {
    let parsed = null;
    try {
      parsed = await parseResponse(res);
      if (typeof parsed === 'string') parsed = { message: parsed };
    } catch { /* ignore */ }

    if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
      try {
        const role = localStorage.getItem('role');
        // Only clear tokens if it's 401 (unauthorized) OR if it's 403 but user is not GUEST
        // GUEST users may legitimately get 403 for limited resources
        if (res.status === 401 || (res.status === 403 && role && role.toUpperCase() !== 'GUEST')) {
          ['token', 'access_token', 'jwt', 'role'].forEach((k) => localStorage.removeItem(k));
        }
      } catch { /* noop */ }
    }

    throw makeHttpError(res, parsed, `${method} ${path} failed`);
  }

  return parseResponse(res);
}

// ---------- CORE REQUEST (BLOB) ----------
async function requestBlob(path, { method = 'GET', headers = {}, params, body } = {}) {
  const url = buildUrl(BASE, path, params);
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const baseHeaders = {
    Accept: '*/*',
    ...authHeader,
    ...headers,
  };
  if (body !== undefined && baseHeaders['Content-Type'] == null) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers: baseHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    mode: 'cors',
    credentials: CREDENTIALS,
  });

  if (!res.ok) {
    // พยายามอ่านเป็นข้อความ/JSON เพื่อให้ error อ่านง่าย
    let parsed = null;
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) parsed = await res.json();
      else parsed = await res.text();
      if (typeof parsed === 'string') parsed = { message: parsed };
    } catch { /* ignore */ }

    if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
      try {
        const role = localStorage.getItem('role');
        // Only clear tokens if it's 401 (unauthorized) OR if it's 403 but user is not GUEST
        // GUEST users may legitimately get 403 for limited resources
        if (res.status === 401 || (res.status === 403 && role && role.toUpperCase() !== 'GUEST')) {
          ['token', 'access_token', 'jwt', 'role'].forEach((k) => localStorage.removeItem(k));
        }
      } catch { /* noop */ }
    }

    throw makeHttpError(res, parsed, `${method} ${path} failed`);
  }

  return res.blob();
}

// ---------- EXPORT ----------
export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),

  // ✅ สำหรับดึงไฟล์ (เช่น PDF) พร้อมแนบ token
  getBlob: (path, opts) => requestBlob(path, { ...opts, method: 'GET' }),
  postBlob: (path, body, opts) => requestBlob(path, { ...opts, method: 'POST', body }),
};

export default http;
export const API_BASE = BASE;

// (มี helper ไว้ใช้แล้วก็ได้)
export const getRoom = (id) => http.get(`/api/rooms/${id}`);
export const updateRoom = (id, payload) => http.put(`/api/rooms/${id}`, payload);
