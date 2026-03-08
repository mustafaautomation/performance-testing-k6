/**
 * LOAD TEST
 * Purpose : Simulate expected production traffic and verify performance holds.
 * Pattern : Ramp up → Steady state → Ramp down
 * Peak VUs: 50
 * Duration: ~17 minutes
 * Run     : npm run test:load
 */
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { authenticate, authHeaders } from '../src/helpers/auth.js';
import { get, post, errorRate } from '../src/helpers/http.js';
import { NEW_USER, USER_IDS } from '../src/data/users.js';
import { THRESHOLDS, BASE_URL } from '../src/config/thresholds.js';

export const options = {
  stages: [
    { duration: '2m',  target: 10 },   // Ramp up to 10 VUs
    { duration: '5m',  target: 50 },   // Ramp up to peak 50 VUs
    { duration: '8m',  target: 50 },   // Hold steady state
    { duration: '2m',  target: 0  },   // Ramp down
  ],
  thresholds: THRESHOLDS,
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  const headers = authHeaders(data.token);
  const userId  = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  group('Read-heavy flow', () => {
    get(`${BASE_URL}/api/users?page=1`);
    sleep(0.5);

    const res = get(`${BASE_URL}/api/users/${userId}`);
    check(res, {
      'status 200':   r => r.status === 200,
      'has email':    r => typeof r.json('data.email') === 'string',
    });
    sleep(0.5);
  });

  group('Write flow', () => {
    const res = post(`${BASE_URL}/api/users`, NEW_USER);
    check(res, { 'user created': r => r.status === 201 });
    sleep(1);
  });

  sleep(Math.random() * 2 + 1); // Think time: 1–3 seconds
}

export function handleSummary(data) {
  return {
    'reports/load-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
