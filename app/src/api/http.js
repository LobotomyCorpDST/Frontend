const BASE =
  (process.env.REACT_APP_API_BASE ||
   process.env.REACT_APP_API_BASE_URL ||
   'http://localhost:8080').replace(/\/$/, '');

async function request(path, { method = 'GET', headers = {}, params, body } = {}) {
  let url = `${BASE}${path}`;
  if (params && typeof params === 'object') {
    const qs = new URLSearchParams(params);
    url += `?${qs.toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    mode: 'cors',
  });

  if (!res.ok) {
    let msg = `${method} ${path} failed (${res.status})`;
    try { const e = await res.json(); msg = e.error || e.message || msg; } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export default http;

export const API_BASE = BASE;
