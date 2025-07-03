import axios from 'axios'
import { baseURL } from './baseUrl'

const axiosInstance = axios.create({
  baseURL: baseURL, // Replace with your API's base URL
  timeout: 10000, // Optional: Timeout in milliseconds
  headers: {
    'Content-Type': 'application/json', // Default headers
    Authorization: `Bearer ${
      localStorage.getItem('token') || localStorage.getItem('customerToken')
    }`, // Example: Attach token from localStorage
  },
})

// Optional: Adding request interceptors
axiosInstance.interceptors.request.use(
  config => {
    // 1. Add Authorization Header if token exists (for JWT in localStorage)
    const token = localStorage.getItem('token') || localStorage.getItem('customerToken')
    console.log()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

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

// Optional: Adding response interceptors
// axiosInstance.interceptors.response.use(
//   (response) => {
//     // Handle response data
//     return response;
//   },
//   (error) => {
//     // Handle response error
//     if (error.response && error.response.status === 401) {
//       // Example: Redirect to login on unauthorized access
//       console.error("Unauthorized! Redirecting to login...");
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance
