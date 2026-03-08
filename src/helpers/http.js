import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

/**
 * GET wrapper with built-in check and error tracking.
 */
export function get(url, params = {}) {
  const res = http.get(url, params);
  const ok = check(res, { [`GET ${url}: status 2xx`]: r => r.status >= 200 && r.status < 300 });
  errorRate.add(!ok);
  return res;
}

/**
 * POST wrapper with built-in check and error tracking.
 */
export function post(url, body, params = {}) {
  const res = http.post(url, JSON.stringify(body), {
    ...params,
    headers: { 'Content-Type': 'application/json', ...(params.headers || {}) },
  });
  const ok = check(res, { [`POST ${url}: status 2xx`]: r => r.status >= 200 && r.status < 300 });
  errorRate.add(!ok);
  return res;
}

/**
 * PUT wrapper with built-in check and error tracking.
 */
export function put(url, body, params = {}) {
  const res = http.put(url, JSON.stringify(body), {
    ...params,
    headers: { 'Content-Type': 'application/json', ...(params.headers || {}) },
  });
  const ok = check(res, { [`PUT ${url}: status 2xx`]: r => r.status >= 200 && r.status < 300 });
  errorRate.add(!ok);
  return res;
}
