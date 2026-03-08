/**
 * STRESS TEST
 * Purpose : Find the breaking point — keep increasing load until failures occur.
 * Pattern : Incrementally ramp VUs beyond expected capacity.
 * Peak VUs: 200
 * Duration: ~24 minutes
 * Run     : npm run test:stress
 */
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { authenticate } from '../src/helpers/auth.js';
import { get, post, errorRate } from '../src/helpers/http.js';
import { NEW_USER, USER_IDS } from '../src/data/users.js';
import { BASE_URL } from '../src/config/thresholds.js';

export const options = {
  stages: [
    { duration: '2m',  target: 50  },  // Warm up
    { duration: '4m',  target: 100 },  // Increase beyond normal
    { duration: '4m',  target: 150 },  // Push harder
    { duration: '4m',  target: 200 },  // Maximum stress
    { duration: '4m',  target: 100 },  // Scale back
    { duration: '2m',  target: 0   },  // Recovery
    { duration: '4m',  target: 0   },  // Observe recovery time
  ],
  // Stress tests intentionally allow higher failure tolerance
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.10'],
    errors:            ['rate<0.10'],
  },
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  group('Stress scenario', () => {
    const listRes = get(`${BASE_URL}/api/users?page=1`);
    check(listRes, { 'list: responded': r => r.status !== 0 });

    const userRes = get(`${BASE_URL}/api/users/${userId}`);
    check(userRes, { 'user: responded': r => r.status !== 0 });

    const createRes = post(`${BASE_URL}/api/users`, NEW_USER);
    check(createRes, { 'create: responded': r => r.status !== 0 });
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'reports/stress-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
