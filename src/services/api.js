// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api-hr.ottogo.id/api',
  withCredentials: false,
})

// Daftar route publik (tanpa JWT)
const publicRoutes = [
  '/login',
]

// Attach JWT kecuali ke publicRoutes
api.interceptors.request.use((config) => {
  const url = config.url || ''
  const isAuthRoute = publicRoutes.some(route =>
    // exact match atau dengan prefix API base
    url.endsWith(route)
  )

  console.log(`[API] Request to ${url} — public? ${isAuthRoute}`)

  if (!isAuthRoute) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// Auto-logout + redirect jika server mengembalikan 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('[API] 401 Unauthorized — logging out')
      localStorage.removeItem('token')
      // langsung ke halaman login
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
