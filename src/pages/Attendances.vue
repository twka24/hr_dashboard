<!-- src/pages/Attendances.vue -->
<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">
      <!-- Card -->
      <div class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl">
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700"
        >
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Management Absensi
          </h1>
        </div>

        <!-- Toolbar Filters -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
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
              <label class="sr-only">Tanggal</label>
              <input
                v-model="date"
                type="date"
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-3 pr-3 py-2 transition"
              />
            </div>
            <!-- Filter Bulan-Tahun -->
            <div class="w-full md:w-1/6">
              <label class="sr-only">Bulan-Tahun</label>
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

        <!-- Toolbar Ekspor (Excel only) -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 px-6 pb-2">
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

        <!-- Notifikasi Pemberitahuan -->
        <div class="px-6 pb-4">
          <div
            class="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 p-4 rounded"
            v-if="notCheckedIn.length || notCheckedOut.length || absent.length || onLeave.length"
          >
            <p class="font-semibold mb-2">Pemberitahuan Absensi:</p>
            <ul class="list-disc list-inside space-y-1">
              <li v-if="notCheckedIn.length">
                Belum absen masuk: {{ notCheckedIn.map(u => u.employee.name).join(', ') }}
              </li>
              <li v-if="notCheckedOut.length">
                Belum absen pulang: {{ notCheckedOut.map(u => u.employee.name).join(', ') }}
              </li>
              <li v-if="absent.length">
                Tidak masuk: {{ absent.map(u => u.employee.name).join(', ') }}
              </li>
              <li v-if="onLeave.length">
                Izin/Cuti: {{ onLeave.map(u => u.employee.name).join(', ') }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Table / Spinner / Error -->
        <div v-if="loading" class="flex justify-center py-20">
          <svg class="h-12 w-12 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"/>
          </svg>
        </div>
        <div v-else>
          <div class="overflow-x-auto p-6 bg-white dark:bg-gray-800">
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
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ formatDate(att.attendance_date) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.check_in ? formatTime(att.check_in) : '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.check_out ? formatTime(att.check_out) : '-' }}</td>
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
                  <td colspan="7" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">Tidak ada data yang sesuai.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center items-center gap-2 px-6 pb-6 bg-white dark:bg-gray-800">
            <button @click="prevPage" :disabled="page===1" class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Prev</button>
            <span class="px-2 text-sm text-gray-600 dark:text-gray-300">Halaman {{ page }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="page===totalPages" class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
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

// Ekspor
const exportCode   = ref('all')
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

// Format helpers
function formatDate(iso) { return new Date(iso).toLocaleDateString() }
function formatTime(iso) { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

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

// Export Excel
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
  const title = exportCode.value==='all'?'Daftar Semua Absensi':`Absensi • ${rows[0].Nama}`
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin:'A1' })
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:6}}]
  ws['!cols']=Object.keys(rows[0]).map(()=>({wch:15}))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Absensi')
  const fn = exportCode.value==='all'?'absensi_all.xlsx':`absensi_${exportCode.value}.xlsx`
  XLSX.writeFile(wb, fn)
}

// Notification lists
const notCheckedIn = computed(() =>
  attendances.value.filter(a => !a.check_in && ['present','late'].includes(a.status))
)
const notCheckedOut = computed(() =>
  attendances.value.filter(a => a.check_in && !a.check_out)
)
const absent = computed(() =>
  attendances.value.filter(a => a.status==='absent')
)
const onLeave = computed(() =>
  attendances.value.filter(a => a.status==='cuti')
)

// Pagination & view detail
const statuses   = computed(()=> Array.from(new Set(attendances.value.map(a=>a.status))) )
const totalPages = computed(()=> Math.ceil(attendances.value.length/perPage.value) || 1 )
const paginated  = computed(()=> attendances.value.slice((page.value-1)*perPage.value, page.value*perPage.value) )
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<totalPages.value) page.value++ }
function viewDetail(a){
  localStorage.setItem('selectedAttendance', JSON.stringify(a))
  router.push({ name:'AttendanceDetail', params:{ id: a.id } })
}
</script>

<style scoped>
thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
