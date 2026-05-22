import { check } from 'k6'
import http from 'k6/http'

const TOKENS = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW5rZHZxemkwMDA3dnV4YzF5dHVhZmE1Iiwicm9sZSI6IlNlbGxlciIsInBob25lTm8iOiIwMTg2NTkyNjE2MCIsImlhdCI6MTc3NTgyNzkwNH0.ZrF4Hfv_r1UlEcAYidJFHipEUcUQlqQIGxdVZinKJps',
]

export const options = {
  stages: [
    { duration: '5s', target: 20 }, // warm-up
    { duration: '5s', target: 40 }, // safe baseline
    { duration: '15s', target: 60 }, // low load stress
    { duration: '5s', target: 80 }, // moderate load
    { duration: '10s', target: 100 }, // known threshold area
    { duration: '10s', target: 120 }, // stress zone
    { duration: '15s', target: 150 }, // overload detection
    { duration: '5s', target: 0 }, // cooldown
  ],

  thresholds: {
    http_req_duration: ['p(95) < 1000'], // relaxed for discovery
    http_req_failed: ['rate < 0.01'],
  },

  discardResponseBodies: true,
}

const URL = 'http://138.252.124.38/api/v1/auth/verify-login'

function getToken() {
  return TOKENS[Math.floor(Math.random() * TOKENS.length)]
}

export default function () {
  const res = http.get(URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
  })

  check(res, {
    'status is 200': r => r.status === 200,
  })
}
