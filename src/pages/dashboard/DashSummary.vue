<!-- src/pages/Dashboard.vue -->
<template>
  <div class="dashboard-wrapper p-6 md:p-10 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard Cuti & Kehadiran
      </h1>
    </div>

    <!-- Ringkasan Organisasi -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <motion-div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Karyawan</p>
        <p class="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ totalEmployees }}
        </p>
      </motion-div>

      <motion-div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Permintaan Pending</p>
        <p class="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ pendingCount }}
        </p>
      </motion-div>

      <motion-div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Sedang Cuti/Izin</p>
        <p class="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ onLeaveCount }}
        </p>
      </motion-div>
    </div>

    <!-- Kehadiran Bulanan per Karyawan -->
    <motion-div
      class="bg-white dark:bg-gray-800 flex flex-col gap-4 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
      style="height: 80vh;"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
    >
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Kehadiran Bulanan per Karyawan
      </h2>

      <!-- Filter bar -->
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Jabatan</label>
          <select
            v-model="chartPosition"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2"
          >
            <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Bulan</label>
          <input
            type="month"
            v-model="chartMonth"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2"
          />
        </div>
      </div>

      <!-- Chart (tinggi 50% saja) -->
       <div class="w-full flex-none" style="height: 400px; position: relative;">
        <canvas ref="chartRef"></canvas>
      </div>


      <!-- Tabel Ringkasan -->
      <div class="max-w-full overflow-auto" style="max-height: 35vh;">
        <table class="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead class="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th class="px-4 py-2">Karyawan</th>
              <th class="px-4 py-2">Hadir</th>
              <th class="px-4 py-2">Cuti</th>
              <th class="px-4 py-2">Izin</th>
              <th class="px-4 py-2">Alpha</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in summaryPerEmployee"
              :key="row.name"
              class="border-b border-gray-200 dark:border-gray-600"
            >
              <td class="px-4 py-2">{{ row.name }}</td>
              <td class="px-4 py-2">{{ row.hadir }}</td>
              <td class="px-4 py-2">{{ row.cuti }}</td>
              <td class="px-4 py-2">{{ row.izin }}</td>
              <td class="px-4 py-2">{{ row.alpha }}</td>
            </tr>
            <tr v-if="!summaryPerEmployee.length">
              <td colspan="5" class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                Tidak ada data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion-div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '@/services/api'

Chart.register(...registerables)

const positionsList = ref([])
const employeesList = ref([])
const leaveRequests = ref([])
const attendances   = ref([])

const chartPosition = ref('')
const chartMonth    = ref(new Date().toISOString().slice(0,7))
const chartRef      = ref(null)
let chartInstance   = null

onMounted(async () => {
  const [posRes, empRes, lrRes, attRes] = await Promise.all([
    api.get('/positions'),
    api.get('/employees'),
    api.get('/leave-requests/all'),
    api.get('/attendances')
  ])
  positionsList.value = posRes.data.data
  employeesList.value = empRes.data.data
  leaveRequests.value = lrRes.data.data
  attendances.value   = attRes.data.data

  if (positionsList.value.length) chartPosition.value = positionsList.value[0].position_name
  await nextTick()
  renderChart()
})

const totalEmployees = computed(() => employeesList.value.length)
const pendingCount   = computed(() => leaveRequests.value.filter(r => r.status==='pending').length)
const onLeaveCount   = computed(() => attendances.value.filter(a => ['cuti','izin'].includes(a.status)).length)
const positions      = computed(() => positionsList.value.map(p => p.position_name))

const filteredAttendances = computed(() =>
  attendances.value.filter(a => {
    const m = a.attendance_date.slice(0,7)
    return a.employee.position.position_name === chartPosition.value
      && m === chartMonth.value
  })
)

const attendancePerEmployee = computed(() => {
  const map = {}
  employeesList.value
    .filter(e => e.position.position_name === chartPosition.value)
    .forEach(e => map[e.name] = 0)
  filteredAttendances.value.forEach(a => {
    if (a.status === 'hadir') map[a.employee.name]++
  })
  return Object.entries(map)
    .map(([name,count])=>({ name, count }))
    .sort((a,b)=> b.count - a.count)
    .slice(0,5)
})

const summaryPerEmployee = computed(() => {
  const map = {}
  employeesList.value
    .filter(e => e.position.position_name === chartPosition.value)
    .forEach(e => map[e.name] = { hadir:0, cuti:0, izin:0, alpha:0 })
  filteredAttendances.value.forEach(a => {
    const n = a.employee.name
    if (!map[n]) return
    if (a.status==='hadir') map[n].hadir++
    else if (a.status==='cuti') map[n].cuti++
    else if (a.status==='izin') map[n].izin++
    else map[n].alpha++
  })
  return Object.entries(map).map(([ name,counts])=>({ name, ...counts }))
})

watch([chartPosition, chartMonth], async () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  await nextTick()
  renderChart()
})

function renderChart() {
  const arr = attendancePerEmployee.value
  const labels = arr.map(e => e.name)
  const data   = arr.map(e => e.count)
  const ctx    = chartRef.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: `Hadir ${chartMonth.value}`, data, backgroundColor: '#10B981' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 0 },
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { barPercentage: 1.0, categoryPercentage: 1.0 },
        y: { beginAtZero: true }
      }
    }
  })
}
</script>

<style scoped>
.dashboard-wrapper { overflow-x: hidden; }
canvas { width: 100% !important; height: 100% !important; }
</style>
