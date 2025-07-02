// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',           // default → ringkasan/dashboard utama
        name: 'DashboardHome',
        component: () => import('@/pages/DashSummary.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/pages/Employees.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'requests',
        name: 'Requests',
        component: () => import('@/pages/Requests.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/pages/Attendance.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- simple auth guard (tidak berubah) ---
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }
  if (to.meta.guest && token) {
    return next('/dashboard')
  }
  next()
})

export default router
