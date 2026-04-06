/**
 * SMOKE TEST
 * Purpose : Verify all endpoints respond correctly under minimal load.
 * VUs     : 1
 * Duration: 30 seconds
 * Run     : npm run test:smoke
 */
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { authenticate, authHeaders } from '../src/helpers/auth.js';
import { get, post, put } from '../src/helpers/http.js';
import { NEW_USER, NEW_PRODUCT } from '../src/data/users.js';
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
      const res = get(`${BASE_URL}/users?limit=5`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has users array': (r) => Array.isArray(r.json('users')),
        'returns 5 users': (r) => r.json('users').length === 5,
      });
    });

    group('Get single user', () => {
      const res = get(`${BASE_URL}/users/1`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has user id': (r) => r.json('id') === 1,
        'has firstName': (r) => typeof r.json('firstName') === 'string',
      });
    });

    group('User not found', () => {
      const res = get(`${BASE_URL}/users/999999`, params);
      check(res, { 'status is 404': (r) => r.status === 404 });
    });

    group('Search users', () => {
      const res = get(`${BASE_URL}/users/search?q=John`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has users': (r) => r.json('users') !== undefined,
      });
    });
  });

  group('Products API', () => {
    group('List products', () => {
      const res = get(`${BASE_URL}/products?limit=5`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has products': (r) => Array.isArray(r.json('products')),
      });
    });

    group('Get product', () => {
      const res = get(`${BASE_URL}/products/1`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'has title': (r) => typeof r.json('title') === 'string',
        'has price': (r) => r.json('price') > 0,
      });
    });

    group('Search products', () => {
      const res = get(`${BASE_URL}/products/search?q=phone`, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
      });
    });
  });

  group('CRUD Operations', () => {
    group('Create user', () => {
      const res = post(`${BASE_URL}/users/add`, NEW_USER, params);
      check(res, {
        'status is 201': (r) => r.status === 201,
        'has id': (r) => r.json('id') > 0,
        'name matches': (r) => r.json('firstName') === NEW_USER.firstName,
      });
    });

    group('Update user', () => {
      const res = put(`${BASE_URL}/users/1`, { lastName: 'Updated' }, params);
      check(res, {
        'status is 200': (r) => r.status === 200,
        'lastName updated': (r) => r.json('lastName') === 'Updated',
      });
    });

    group('Add product', () => {
      const res = post(`${BASE_URL}/products/add`, NEW_PRODUCT, params);
      check(res, {
        'status is 201': (r) => r.status === 201,
        'title matches': (r) => r.json('title') === NEW_PRODUCT.title,
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
