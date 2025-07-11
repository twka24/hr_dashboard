import { createRouter, createWebHistory } from 'vue-router'
import RequestDetail from '@/pages/management_requests/RequestDetail.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'DashboardHome',
    component: () => import('@/pages/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true },
    redirect: { name: 'Dashboard' },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/DashSummary.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/pages/management_karyawan/Employees.vue'),
        meta: { requiresAuth: true, title: 'Management Karyawan' },
      },
      {
        path: 'requests',
        name: 'Requests',
        component: () => import('@/pages/management_requests/Requests.vue'),
        meta: { requiresAuth: true, title: 'Management Requests' },
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/pages/management_absensi/Attendances.vue'),
        meta: { requiresAuth: true, title: 'Management Absensi'},
      },
      {
        path: 'attendance/:id',
        name: 'AttendanceDetail',
        component: () => import('@/pages/management_absensi/AttendanceDetail.vue'),
        meta: { requiresAuth: true, title: 'Detail Attendance' },
      },
      {
        path: 'requests/:id',
        name: 'RequestDetail',
        component: RequestDetail,
        meta: { requiresAuth: true, title: 'Detail Request ' },
      },
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/pages/schedules/Schedules.vue'),
        meta: { requiresAuth: true, title: 'Management Schedules' },
      },
       {
        path: 'createschedules',
        name: 'CreateSchedules',
        component: () => import('@/pages/schedules/CreateSchedules.vue'),
        meta: { requiresAuth: true, title: 'Buat Schedule' },
      },
      {
        path: 'schedulesedit/:id',
        name: 'SchedulesEdit',
        component: () => import('@/pages/schedules/SchedulesEdit.vue'),
        meta: { requiresAuth: true, title: 'Edit Schedules' },
      },
       {
        path: 'bulkassignments',
        name: 'BulkAssignments',
        component: () => import('@/pages/schedules/CreateBulkAssignments.vue'),
        meta: { requiresAuth: true, title: 'Buat Bulk Assignments ' },
      },
        {
        path: 'scheduleassignments',
        name: 'ScheduleAssignments',
        component: () => import('@/pages/schedules/ScheduleAssignments.vue'),
        meta: { requiresAuth: true, title: 'Bulk Assignments' },
      },
     {
        path: 'schedule-assignments/:id',
        name: 'DetailScheduleAssignments',
        component: () => import('@/pages/schedules/DetailScheduleAssignments.vue'),
        props: true,
        meta: { requiresAuth: true, titl: 'Detail Bulk Assignments' },
      },
      // Settings nested under /dashboard
      {
        path: 'settings',
        component: () => import('@/pages/settings/Index.vue'),
        meta: { requiresAuth: true, title: 'Penganturan Positions' },
        redirect: { name: 'SettingsPositions' },
        children: [
          {
            path: 'positions',
            name: 'SettingsPositions',
            component: () => import('@/pages/settings/menu/positions/Positions.vue'),
            meta: { requiresAuth: true },
          },
          {
            // relatif: tidak diawali '/'
            path: 'positions/:kode_position/edit',
            name: 'SettingsEditPosition',
            component: () => import('@/pages/settings/menu/positions/EditPosition.vue'),
            meta: { requiresAuth: true, title: 'Edit Position'},
          },
          // ... tambahkan submenu settings lain di sini ...
        ]
      },
    ],
  },
  {
    path: '/',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return next('/login')
  if (to.meta.guest && token) return next({ name: 'DashboardHome' })
  next()
})

export default router
