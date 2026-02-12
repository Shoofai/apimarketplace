import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m', // Run for 5 minutes
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.01'], // Error rate must be below 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate dashboard browsing
  const pages = [
    '/dashboard',
    '/dashboard/apis',
    '/dashboard/analytics',
    '/dashboard/billing',
    '/dashboard/settings',
  ];

  const page = pages[Math.floor(Math.random() * pages.length)];
  
  const res = http.get(`${BASE_URL}${page}`);
  
  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401, // 401 for auth
    'page loads < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
