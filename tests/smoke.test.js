/**
 * SMOKE TEST
 * Purpose : Verify all endpoints respond correctly under minimal load.
 * VUs     : 1
 * Duration: 30 seconds
 * Run     : npm run test:smoke
 */
import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { authenticate, authHeaders } from '../src/helpers/auth.js';
import { get, post, put } from '../src/helpers/http.js';
import { NEW_USER } from '../src/data/users.js';
import { THRESHOLDS, BASE_URL } from '../src/config/thresholds.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: THRESHOLDS,
};

export function setup() {
  return { token: authenticate() };
}

export default function (data) {
  const params = authHeaders(data.token);

  group('Users API', () => {
    group('List users', () => {
      const res = get(`${BASE_URL}/api/users?page=1`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has data array': (r) => Array.isArray(r.json('data')),
        'returns 6 users': (r) => r.json('data').length === 6,
      });
    });

    group('Get single user', () => {
      const res = get(`${BASE_URL}/api/users/2`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has user id': (r) => r.json('data.id') === 2,
        'has user email': (r) => typeof r.json('data.email') === 'string',
      });
    });

    group('User not found', () => {
      const res = get(`${BASE_URL}/api/users/999`, {
        ...params,
        responseCallback: http.expectedStatuses(404),
      });
      check(res, { 'status is 404': (r) => r.status === 404 });
    });
  });

  group('Create & Update', () => {
    group('Create user', () => {
      const res = post(`${BASE_URL}/api/users`, NEW_USER, params);
      check(res, {
        'status is 201': (r) => r.status === 201,
        'has id': (r) => Boolean(r.json('id')),
        'name matches': (r) => r.json('name') === NEW_USER.name,
      });
    });

    group('Update user', () => {
      const res = put(`${BASE_URL}/api/users/2`, { job: 'Senior QA Lead' }, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'job updated': (r) => r.json('job') === 'Senior QA Lead',
      });
    });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/smoke-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
