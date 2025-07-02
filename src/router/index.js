import { createRouter, createWebHistory } from 'vue-router'
import RequestDetail from '@/pages/RequestDetail.vue'

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
    redirect: { name: 'DashboardHome' },
    children: [
      {
        path: '',
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
  component: () => import('@/pages/Attendances.vue'), // <-- sesuaikan
  meta: { requiresAuth: true },
},
{
        path: 'attendance/:id',
        name: 'AttendanceDetail',
        component: () => import('@/pages/AttendanceDetail.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'requests/:id',     
        name: 'RequestDetail',
        component: RequestDetail,
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

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return next('/login')
  if (to.meta.guest && token) return next('/dashboard')
  next()
})

export default router
