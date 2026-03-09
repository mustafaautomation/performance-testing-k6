/**
 * LOAD TEST
 * Purpose : Simulate expected production traffic and verify performance holds.
 * Pattern : Ramp up → Steady state → Ramp down
 * Peak VUs: 50
 * Duration: ~17 minutes
 * Run     : npm run test:load
 */
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { authenticate, authHeaders } from '../src/helpers/auth.js';
import { get, post } from '../src/helpers/http.js';
import { NEW_USER, USER_IDS } from '../src/data/users.js';
import { THRESHOLDS, BASE_URL } from '../src/config/thresholds.js';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 50 },
    { duration: '8m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: THRESHOLDS,
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  const params = authHeaders(data.token);
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  group('Read-heavy flow', () => {
    get(`${BASE_URL}/api/users?page=1`, params);
    sleep(0.5);

    const res = get(`${BASE_URL}/api/users/${userId}`, params);
    check(res, {
      'status 200': (r) => r.status === 200,
      'has email': (r) => typeof r.json('data.email') === 'string',
    });
    sleep(0.5);
  });

  group('Write flow', () => {
    const res = post(`${BASE_URL}/api/users`, NEW_USER, params);
    check(res, { 'user created': (r) => r.status === 201 });
    sleep(1);
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'reports/load-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
