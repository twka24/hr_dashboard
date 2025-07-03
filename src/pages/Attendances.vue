<!-- src/pages/Attendances.vue -->
<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">
      <!-- Card -->
      <div class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl">
        <!-- Header + View Toggle -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700"
        >
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Management Absensi
          </h1>
          <div class="mt-4 sm:mt-0 inline-flex rounded-lg bg-gray-100 dark:bg-gray-700">
            <button
              @click="isCalendarView = false"
              :class="{'bg-indigo-500 text-white': !isCalendarView, 'text-gray-700 dark:text-gray-300': isCalendarView}"
              class="px-4 py-2 rounded-l-lg hover:bg-indigo-400 transition"
            >
              Table View
            </button>
            <button
              @click="isCalendarView = true"
              :class="{'bg-indigo-500 text-white': isCalendarView, 'text-gray-700 dark:text-gray-300': !isCalendarView}"
              class="px-4 py-2 rounded-r-lg hover:bg-indigo-400 transition"
            >
              Calendar View
            </button>
          </div>
        </div>

        <!-- Toolbar Filters (Table View only) -->
        <div v-if="!isCalendarView" class="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
          <div class="flex flex-1 flex-col md:flex-row gap-4 w-full">
            <!-- Cari Kode Karyawan -->
            <div class="relative w-full md:w-1/4">
              <MagnifyingGlassIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5"
              />
              <input
                v-model="employeeCode"
                type="text"
                placeholder="Cari Kode karyawan..."
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 transition"
              />
            </div>
            <!-- Filter Tanggal -->
            <div class="w-full md:w-1/6">
              <input
                v-model="date"
                type="date"
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-3 pr-3 py-2 transition"
              />
            </div>
            <!-- Filter Bulan-Tahun -->
            <div class="w-full md:w-1/6">
              <input
                v-model="monthYear"
                type="month"
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-3 pr-3 py-2 transition"
              />
            </div>
            <!-- Status Filter -->
            <div class="relative w-full md:w-1/4">
              <select
                v-model="filterStatus"
                class="appearance-none w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-2 transition"
              >
                <option value="">— Semua Status —</option>
                <option v-for="st in statuses" :key="st" :value="st">
                  {{ st }}
                </option>
              </select>
              <ChevronDownIcon
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
              />
            </div>
          </div>

          <!-- Rows per page -->
          <div class="relative">
            <select
              v-model.number="perPage"
              @change="page = 1"
              class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-3 pr-8 py-2 transition"
            >
              <option v-for="n in [5,10,20,50]" :key="n" :value="n">
                Show {{ n }} rows
              </option>
            </select>
            <ChevronDownIcon
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
            />
          </div>
        </div>

        <!-- Export Toolbar (Table View only) -->
        <div v-if="!isCalendarView" class="flex flex-col md:flex-row items-center justify-between gap-4 px-6 pb-2">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              Ekspor:
            </label>
            <div class="relative">
              <select
                v-model="exportCode"
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-2 transition"
              >
                <option value="all">Tampilkan Semua</option>
                <option
                  v-for="opt in exportOptions"
                  :key="opt.code"
                  :value="opt.code"
                >
                  {{ opt.name }}
                </option>
              </select>
              <ChevronDownIcon
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
              />
            </div>

            <button
              @click="downloadExcel"
              class="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-transform hover:scale-105"
            >
              Excel
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 bg-white dark:bg-gray-800">
          <!-- Loading spinner -->
          <div v-if="loading" class="flex justify-center py-20">
            <svg
              class="h-12 w-12 animate-spin text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"/>
            </svg>
          </div>

          <!-- Calendar View -->
          <FullCalendar
  v-if="!loading && isCalendarView"
  class="rounded-lg overflow-hidden"
  :plugins="calendarPlugins"
  :initialView="calendarInitialView"
  :headerToolbar="calendarHeaderToolbar"
  :events="calendarEvents"
  
/>

          <!-- Table View -->
          <div v-if="!loading && !isCalendarView" class="overflow-x-auto">
            <table class="w-full table-auto border-collapse">
              <thead class="bg-indigo-100 dark:bg-indigo-900">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Kode</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nama</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Tanggal</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jam Masuk</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jam Pulang</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="att in paginated"
                  :key="att.id"
                  class="border-b even:bg-gray-50 dark:even:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.employee_code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.employee.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    {{ formatDate(att.attendance_date) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    {{ att.check_in ? formatTime(att.check_in) : '-' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    {{ att.check_out ? formatTime(att.check_out) : '-' }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span
                      :class="{
                        'text-green-600': att.status==='present',
                        'text-red-600':   att.status==='absent',
                        'text-yellow-600': att.status==='late' || att.status==='cuti'
                      }"
                    >
                      {{ att.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button
                      @click="viewDetail(att)"
                      class="inline-flex items-center p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                    >
                      <EyeIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!paginated.length">
                  <td colspan="7" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data yang sesuai.
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div class="flex justify-center items-center gap-2 py-6">
              <button
                @click="prevPage"
                :disabled="page===1"
                class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span class="px-2 text-sm text-gray-600 dark:text-gray-300">
                Halaman {{ page }} / {{ totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="page===totalPages"
                class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-6 text-center text-red-600">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import * as XLSX from 'xlsx'

// FullCalendar
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const router       = useRouter()
const attendances  = ref([])
const loading      = ref(true)
const error        = ref('')
const employeeCode = ref('')
const date         = ref('')
const monthYear    = ref('')
const filterStatus = ref('')
const page         = ref(1)
const perPage      = ref(10)
const exportCode   = ref('all')
const isCalendarView = ref(false)

// FullCalendar config
const calendarPlugins       = [ dayGridPlugin ]
const calendarInitialView   = 'dayGridMonth'
const calendarHeaderToolbar = {
  left: 'prev,next today',
  center: 'title',
  right: ''
}

// Export helpers
const exportOptions = computed(() => {
  const m = new Map()
  attendances.value.forEach(a => {
    if (!m.has(a.employee_code)) m.set(a.employee_code, a.employee.name)
  })
  return Array.from(m, ([code,name])=>({ code, name }))
})
const exportData = computed(()=> 
  exportCode.value==='all'
    ? attendances.value
    : attendances.value.filter(a=>a.employee_code===exportCode.value)
)

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Load data
async function loadAttendances() {
  loading.value = true
  error.value   = ''
  try {
    const params = {}
    if (employeeCode.value) params.employee_code = employeeCode.value
    if (date.value)         params.date          = date.value
    if (monthYear.value)    params.month_year    = monthYear.value
    if (filterStatus.value) params.status        = filterStatus.value

    const res = await api.get('/attendances', { params })
    attendances.value = res.data.data
  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat data absensi.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAttendances)
watch([employeeCode, date, monthYear, filterStatus], () => {
  page.value = 1
  loadAttendances()
})

// Download Excel
function downloadExcel() {
  if (!exportData.value.length) return
  const rows = exportData.value.map(a => ({
    Kode: a.employee_code,
    Nama: a.employee.name,
    Tanggal: formatDate(a.attendance_date),
    'Jam Masuk': a.check_in ? formatTime(a.check_in) : '-',
    'Lokasi Masuk': a.check_in_location || '-',
    'Jam Pulang': a.check_out ? formatTime(a.check_out) : '-',
    'Lokasi Pulang': a.check_out_location || '-',
    'Istirahat Mulai': a.break_start ? formatTime(a.break_start) : '-',
    'Istirahat Selesai': a.break_end ? formatTime(a.break_end) : '-',
    Status: a.status,
    Notes: a.notes || '-'
  }))
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' })
  const title = exportCode.value==='all'
    ? 'Daftar Semua Absensi'
    : `Absensi • ${rows[0].Nama}`
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin:'A1' })
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:10}}]
  ws['!cols']=Object.keys(rows[0]).map(()=>({wch:15}))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Absensi')
  const fn = exportCode.value==='all'
    ? 'absensi_all.xlsx'
    : `absensi_${exportCode.value}.xlsx`
  XLSX.writeFile(wb, fn)
}

// Pagination & detail
const statuses   = computed(()=> Array.from(new Set(attendances.value.map(a=>a.status))) )
const totalPages = computed(()=> Math.ceil(attendances.value.length/perPage.value) || 1 )
const paginated  = computed(()=> attendances.value.slice((page.value-1)*perPage.value, page.value*perPage.value) )
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<totalPages.value) page.value++ }
function viewDetail(a){
  localStorage.setItem('selectedAttendance', JSON.stringify(a))
  router.push({ name:'AttendanceDetail', params:{ id: a.id } })
}

// Calendar events mapping
const calendarEvents = computed(() => {
  return Array.isArray(attendances.value)
    ? attendances.value.map(a => ({
        title: [
          a.employee?.name || '-',
          `(${a.status || '-'})`,
          `Masuk: ${a.check_in ? new Date(a.check_in).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-'}`,
          `Pulang: ${a.check_out? new Date(a.check_out).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '-'}`
        ].join('\n'),
        start: a.attendance_date,
        color: ({
          present: '#3B82F6',
          absent:  '#EF4444',
          late:    '#F59E0B',
          cuti:    '#F59E0B'
        }[a.status] || '#6B7280')
      }))
    : []
})
</script>

<style scoped>
thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}
/* FullCalendar style tweaks */
.fc .fc-toolbar-title {
  font-weight: 600;
  font-size: 1.25rem;
}
.fc .fc-daygrid-event {
  font-size: 0.75rem;
  border-radius: 0.375rem;
}
</style>
