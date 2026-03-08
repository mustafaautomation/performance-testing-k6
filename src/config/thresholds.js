/**
 * Shared performance thresholds applied across all test suites.
 * Tweak per-environment by overriding in individual test files.
 */
export const THRESHOLDS = {
  // 95% of requests must complete within 500ms
  http_req_duration: ['p(95)<500', 'p(99)<1000'],

  // Less than 1% of requests should fail
  http_req_failed: ['rate<0.01'],

  // Custom error rate metric
  errors: ['rate<0.05'],

  // Auth endpoint specifically — must be fast
  'http_req_duration{name:login}': ['p(95)<300'],
};

export const BASE_URL = __ENV.BASE_URL || 'https://reqres.in';
