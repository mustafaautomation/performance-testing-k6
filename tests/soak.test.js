/**
 * SOAK TEST
 * Purpose : Detect memory leaks and performance degradation over extended periods.
 * Pattern : Moderate load held for a long duration (hours).
 * Peak VUs: 50
 * Duration: 2 hours (set LOW_DURATION=true for a 10-minute CI-friendly version)
 * Run     : npm run test:soak
 */
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { authenticate } from '../src/helpers/auth.js';
import { get, post, errorRate } from '../src/helpers/http.js';
import { NEW_USER, USER_IDS } from '../src/data/users.js';
import { THRESHOLDS, BASE_URL } from '../src/config/thresholds.js';

const IS_CI = __ENV.CI === 'true';

export const options = {
  stages: IS_CI
    ? [
        { duration: '2m', target: 20 },   // CI: quick ramp
        { duration: '6m', target: 20 },   // CI: 6 min hold
        { duration: '2m', target: 0  },   // CI: ramp down
      ]
    : [
        { duration: '5m',  target: 50 },  // Ramp up
        { duration: '2h',  target: 50 },  // Soak — 2 hours
        { duration: '5m',  target: 0  },  // Ramp down
      ],
  thresholds: THRESHOLDS,
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  const userId = USER_IDS[Math.floor(Math.random() * USER_IDS.length)];

  group('Soak scenario', () => {
    const listRes = get(`${BASE_URL}/api/users?page=1`);
    check(listRes, {
      'list: 200':       r => r.status === 200,
      'list: fast':      r => r.timings.duration < 500,
    });

    const userRes = get(`${BASE_URL}/api/users/${userId}`);
    check(userRes, {
      'user: 200':  r => r.status === 200,
      'user: fast': r => r.timings.duration < 500,
    });

    const createRes = post(`${BASE_URL}/api/users`, NEW_USER);
    check(createRes, { 'create: 201': r => r.status === 201 });
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'reports/soak-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
