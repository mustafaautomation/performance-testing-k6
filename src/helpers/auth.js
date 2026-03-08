import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../config/thresholds.js';

const EMAIL    = __ENV.TEST_USER_EMAIL    || 'eve.holt@reqres.in';
const PASSWORD = __ENV.TEST_USER_PASSWORD || 'cityslicka';

/**
 * Authenticates and returns a bearer token.
 * Call this inside setup() to share token across all VUs.
 */
export function authenticate() {
  const res = http.post(
    `${BASE_URL}/api/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, { 'auth: status 200': r => r.status === 200 });

  return res.json('token');
}

/**
 * Returns headers with Authorization token.
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}
