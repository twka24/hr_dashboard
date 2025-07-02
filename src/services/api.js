// src/services/api.js – refined
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api-hr.ottogo.id/api',
  withCredentials: false,
})

/**
 * Attach JWT **except** when hitting public auth endpoints.
 * Prevents sending stale/invalid token on /login which often causes
 * the backend to ignore the credential body and fail.
 */
api.interceptors.request.use((config) => {
  // regex covers /login or /auth/* etc – tweak to match your backend routes
  const isAuthRoute = /\/login$/i.test(config.url)
  if (!isAuthRoute) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auto-logout helper if server returns 401/419
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // Optionally redirect to login:
      // window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api