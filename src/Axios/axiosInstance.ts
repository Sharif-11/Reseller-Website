import axios from 'axios'
import { baseURL } from './baseUrl'

const axiosInstance = axios.create({
  baseURL: baseURL, // Replace with your API's base URL
  timeout: 10000, // Optional: Timeout in milliseconds
  withCredentials: true, // This is crucial for sending cookies with requests
  headers: {
    'Content-Type': 'application/json', // Default headers
  },
})

// Optional: Adding request interceptors
axiosInstance.interceptors.request.use(
  config => {
    // 1. Add Authorization Header if token exists (for JWT in localStorage)

    // 2. Ensure cookies are sent with requests
    config.withCredentials = true // This is crucial for cookies

    // 3. Additional security headers (recommended)
    config.headers['X-Requested-With'] = 'XMLHttpRequest'

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default axiosInstance
