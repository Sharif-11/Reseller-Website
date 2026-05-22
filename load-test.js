import { sleep } from 'k6'
import http from 'k6/http'

export const options = {
  stages: [
    { duration: '10s', target: 1000 }, // fast ramp
    { duration: '20s', target: 2000 }, // mid spike
    { duration: '20s', target: 3000 }, // peak stress
    { duration: '10s', target: 0 }, // drop fast
  ],

  thresholds: {
    http_req_duration: ['p(95)<100'], // allow degradation under stress
    http_req_failed: ['rate<0.1'], // allow up to 10% failure in spike
  },
}

const BASE = 'http://localhost:3000/api/v1/categories/subcategories'

export default function () {
  // simulate real user navigation
  http.get(`${BASE}/`)
  sleep(0.3)

  // http.get(`${BASE}/products`)
  // sleep(0.3)
}
