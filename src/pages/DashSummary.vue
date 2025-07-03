<template>
  <div class="p-6 md:p-10 space-y-8">
    <!-- Ringkasan Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion-div
        class="bg-white/80 dark:bg-white/10 p-6 rounded-2xl shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 transition"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Karyawan</p>
        <p class="mt-4 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
          {{ totalEmployees }}
        </p>
      </motion-div>
      <motion-div
        class="bg-white/80 dark:bg-white/10 p-6 rounded-2xl shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 transition"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Pending Request</p>
        <p class="mt-4 text-3xl font-extrabold text-yellow-500">
          {{ pendingRequests.length }}
        </p>
      </motion-div>
      <motion-div
        class="bg-white/80 dark:bg-white/10 p-6 rounded-2xl shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 transition"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Hadir Hari Ini</p>
        <p class="mt-4 text-3xl font-extrabold text-green-500">
          {{ presentToday }}
        </p>
      </motion-div>
      <motion-div
        class="bg-white/80 dark:bg-white/10 p-6 rounded-2xl shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 transition"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Terlambat Hari Ini</p>
        <p class="mt-4 text-3xl font-extrabold text-red-500">
          {{ lateToday }}
        </p>
      </motion-div>
    </div>

    <!-- Dashboard Panes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Kiri: Pending & On-Leave -->
      <div class="space-y-6">
        <!-- Pending Requests (cuti/izin) -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Pending Approve Cuti/Izin
          </h2>
          <ul class="space-y-2 max-h-64 overflow-y-auto">
            <li
              v-for="req in pendingRequests"
              :key="req.id"
              class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2"
            >
              <span class="text-gray-800 dark:text-gray-200">{{ req.employee.name }}</span>
              <span class="text-sm text-yellow-600">
                {{ req.type }} ({{ formatDate(req.start_date) }} – {{ formatDate(req.end_date) }})
              </span>
            </li>
            <li v-if="!pendingRequests.length" class="text-gray-500 dark:text-gray-400 text-center py-4">
              Tidak ada permintaan pending.
            </li>
          </ul>
        </div>

        <!-- Sedang Cuti/Izin (dari /attendances) -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Sedang Cuti/Izin
          </h2>
          <ul class="space-y-2 max-h-64 overflow-y-auto">
            <li
              v-for="att in onLeaveAttendances"
              :key="att.id"
              class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2"
            >
              <span class="text-gray-800 dark:text-gray-200">{{ att.employee.name }}</span>
              <span class="text-sm text-indigo-600 text-yellow-600">{{ att.status.toUpperCase() }}</span>
            </li>
            <li v-if="!onLeaveAttendances.length" class="text-gray-500 dark:text-gray-400 text-center py-4">
              Tidak ada yang sedang cuti/izin.
            </li>
          </ul>
        </div>
      </div>

      <!-- Kanan: FullCalendar -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
        <FullCalendar :options="calendarOptions" class="rounded-lg h-[600px]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { format } from 'date-fns'

// state
const totalEmployees      = ref(0)
const leaveRequests       = ref([])
const attendances         = ref([])
const loading             = ref(true)

// computed lists
const pendingRequests     = computed(() => leaveRequests.value.filter(r => r.status === 'pending'))
const todayISO            = new Date().toISOString().slice(0,10)
const presentToday        = computed(() => attendances.value.filter(a => a.status === 'hadir'  && a.attendance_date === todayISO).length)
const lateToday           = computed(() => attendances.value.filter(a => a.status === 'late'   && a.attendance_date === todayISO).length)
const onLeaveAttendances  = computed(() => attendances.value.filter(a => ['cuti','izin'].includes(a.status)))

// calendar events
const calendarEvents = computed(() =>
  attendances.value.map(a => ({
    title: `${a.employee.name} — ${a.employee.position.position_name}`,
    start: a.attendance_date,
    color: {
      hadir: '#10B981',
      late:  '#F59E0B',
      cuti:  '#6366F1',
      izin:  '#818CF8'
    }[a.status] || '#6B7280',
    extendedProps: { status: a.status, checkIn: a.check_in, checkOut: a.check_out }
  }))
)

// reactive calendar options
const calendarOptions = computed(() => ({
  plugins:       [ dayGridPlugin ],
  initialView:   'dayGridMonth',
  headerToolbar: { left:'prev,next today', center:'title', right:'' },
  events:        calendarEvents.value,
  eventDidMount: info => {
    const p = info.event.extendedProps
    const tip = `
Karyawan: ${info.event.title}
Status : ${p.status.toUpperCase()}
Masuk  : ${p.checkIn ? new Date(p.checkIn).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-'}
Pulang : ${p.checkOut? new Date(p.checkOut).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-'}
    `
    info.el.setAttribute('title', tip.trim())
  }
}))

// format helpers
function formatDate(iso) {
  return format(new Date(iso), 'MM/dd/yyyy')
}

// load all data
async function loadAll() {
  loading.value = true
  try {
    const [ eRes, rRes, aRes ] = await Promise.all([
      api.get('/employees'),
      api.get('/leave-requests/all'),
      api.get('/attendances')
    ])
    totalEmployees.value = Array.isArray(eRes.data.data) ? eRes.data.data.length : 0
    leaveRequests.value  = rRes.data.data
    attendances.value    = aRes.data.data
  } catch (e) {
    console.error('Error loading dashboard data', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
/* TailwindCSS handles styling; ensure you import FullCalendar CSS in your entrypoint:
   import '@fullcalendar/daygrid/main.css'
*/
</style>
