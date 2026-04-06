import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../config/thresholds.js';

const USERNAME = __ENV.TEST_USERNAME || 'emilys';
const PASSWORD = __ENV.TEST_PASSWORD || 'emilyspass';

/**
 * Authenticates against DummyJSON and returns an access token.
 * Call this inside setup() to share token across all VUs.
 * Throws on failure so tests don't run with bad auth silently.
 */
export function authenticate() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login' },
    }
  );

  const ok = check(res, { 'auth: status 200': (r) => r.status === 200 });
  if (!ok) {
    throw new Error(`Authentication failed: ${res.status} ${res.body}`);
  }

  return res.json('accessToken');
}

/**
 * Returns params object with Authorization header.
 * Pass the result directly to http helpers: get(url, authHeaders(token))
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}
