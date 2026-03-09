/**
 * SPIKE TEST
 * Purpose : Verify system handles sudden, extreme traffic bursts (flash sales, viral events).
 * Pattern : Low baseline → instant spike → back to baseline.
 * Peak VUs: 250
 * Duration: ~9 minutes
 * Run     : npm run test:spike
 */
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { authenticate, authHeaders } from '../src/helpers/auth.js';
import { get, post } from '../src/helpers/http.js';
import { NEW_USER, USER_IDS } from '../src/data/users.js';
import { BASE_URL } from '../src/config/thresholds.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '30s', target: 250 },
    { duration: '3m', target: 250 },
    { duration: '30s', target: 10 },
    { duration: '4m', target: 10 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.15'],
    errors: ['rate<0.15'],
  },
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  const params = authHeaders(data.token);
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  group('Spike scenario', () => {
    const res = get(`${BASE_URL}/api/users/${userId}`, params);
    check(res, {
      'responded': (r) => r.status !== 0,
      'not timeout': (r) => r.timings.duration < 5000,
    });

    const createRes = post(`${BASE_URL}/api/users`, NEW_USER, params);
    check(createRes, { 'create: responded': (r) => r.status !== 0 });
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'reports/spike-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
