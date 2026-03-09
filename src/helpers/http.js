import http from 'k6/http';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

/**
 * GET wrapper with error rate tracking.
 * Checks and assertions should be done by the caller — not here.
 */
export function get(url, params = {}) {
  const res = http.get(url, params);
  errorRate.add(res.status === 0 || res.status >= 500);
  return res;
}

/**
 * POST wrapper with error rate tracking.
 */
export function post(url, body, params = {}) {
  const res = http.post(url, JSON.stringify(body), {
    ...params,
    headers: { 'Content-Type': 'application/json', ...(params.headers || {}) },
  });
  errorRate.add(res.status === 0 || res.status >= 500);
  return res;
}

/**
 * PUT wrapper with error rate tracking.
 */
export function put(url, body, params = {}) {
  const res = http.put(url, JSON.stringify(body), {
    ...params,
    headers: { 'Content-Type': 'application/json', ...(params.headers || {}) },
  });
  errorRate.add(res.status === 0 || res.status >= 500);
  return res;
}
