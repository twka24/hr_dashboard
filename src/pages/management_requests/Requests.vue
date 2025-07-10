<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">
      <!-- Card -->
      <div class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Management Requests
            </h1>
            <!-- Notifikasi status -->
            <div class="flex flex-wrap gap-4 mt-2 text-sm">
              <div class="px-3 py-1 bg-yellow-100 dark:bg-yellow-700 rounded-full">
                Pending: {{ pendingCount }}
              </div>
              <div class="px-3 py-1 bg-green-100 dark:bg-green-700 rounded-full">
                Approved: {{ approvedCount }}
              </div>
              <div class="px-3 py-1 bg-red-100 dark:bg-red-700 rounded-full">
                Rejected: {{ rejectedCount }}
              </div>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6">
  <!-- Filters -->
  <div class="flex flex-1 flex-col md:flex-row gap-4 w-full">
    <!-- Cari Karyawan -->
    <div class="w-full md:w-1/4">
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Cari Karyawan</label>
      <div class="relative">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari berdasarkan nama karyawan..."
          class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
                 focus:bg-white dark:focus:bg-gray-600
                 focus:ring-2 focus:ring-indigo-500
                 placeholder-gray-500 dark:placeholder-gray-400
                 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 transition"
        />
      </div>
    </div>

    <!-- Dari Tanggal -->
    <div class="w-full md:w-1/6">
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Dari Tanggal</label>
      <input
        v-model="dateFrom"
        type="date"
        class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
               focus:ring-2 focus:ring-indigo-500
               text-gray-900 dark:text-gray-100 px-3 py-2 transition"
      />
    </div>

    <!-- Sampai Tanggal -->
    <div class="w-full md:w-1/6">
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Sampai Tanggal</label>
      <input
        v-model="dateTo"
        type="date"
        class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
               focus:ring-2 focus:ring-indigo-500
               text-gray-900 dark:text-gray-100 px-3 py-2 transition"
      />
    </div>

    <!-- Status -->
    <div class="w-full md:w-1/4">
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
      <div class="relative">
        <select
          v-model="filterStatus"
          class="appearance-none w-full rounded-lg bg-gray-100 dark:bg-gray-700
                 focus:ring-2 focus:ring-indigo-500
                 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-2 transition"
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
  </div>

  <!-- Hapus Filter -->
  <button
    @click="clearFilters"
    class="self-center md:self-end px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
  >
    Hapus Filter
  </button>
</div>


        <!-- Ekspor bar + Summary -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 px-6 pb-2">
          <!-- Ekspor controls -->
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              Ekspor:
            </label>
            <div class="relative">
              <select
                v-model="exportFilterType"
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-4 pr-8 py-2 transition"
              >
                <option value="all">Semua</option>
                <option value="employee">Per Karyawan</option>
                <option value="position">Per Jabatan</option>
              </select>
              <ChevronDownIcon
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
              />
            </div>
            <div v-if="exportFilterType==='employee'" class="relative">
              <select
                v-model="exportCode"
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-4 pr-8 py-2 transition"
              >
                <option value="all">— Pilih Karyawan —</option>
                <option v-for="opt in exportOptions" :key="opt.code" :value="opt.code">
                  {{ opt.name }}
                </option>
              </select>
              <ChevronDownIcon
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
              />
            </div>
            <div v-if="exportFilterType==='position'" class="relative">
              <select
                v-model="exportPosition"
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 pl-4 pr-8 py-2 transition"
              >
                <option value="all">— Pilih Jabatan —</option>
                <option v-for="pos in positions" :key="pos" :value="pos">
                  {{ pos }}
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
          <div class="flex-1 flex flex-wrap justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <template v-if="isFiltered">
              <span class="font-semibold">Total: {{ totalCount }}</span>
              <template v-for="(info, pos) in positionSummary" :key="pos">
                <span>| {{ pos }}: {{ info.total }}
                  (Pending: {{ info.pending }}, Approved: {{ info.approved }}, Rejected: {{ info.rejected }})
                </span>
              </template>
            </template>

          </div>
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
              <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none" />
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
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Karyawan</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jabatan</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Tipe</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Start</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">End</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Alasan</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Dibuat</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="req in paginated"
                  :key="req.id"
                  class="border-b even:bg-gray-50 dark:even:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ req.employee_code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ req.employee.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ req.position_name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ req.type }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ req.start_date }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ req.end_date }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100 truncate">{{ req.reason }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span
                      :class="{
                        'text-yellow-600': req.status==='pending',
                        'text-green-600':  req.status==='approved',
                        'text-red-600':    req.status==='rejected'
                      }"
                    >{{ req.status }}</span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {{ new Date(req.created_at).toLocaleDateString() }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button
                      @click="onView(req)"
                      class="inline-flex items-center p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                    >
                      <EyeIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!paginated.length">
                  <td colspan="10" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data yang sesuai.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center items-center gap-2 px-6 pb-6 bg-white dark:bg-gray-800">
            <button
              @click="prevPage"
              :disabled="page===1"
              class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >Prev</button>
            <span class="px-2 text-sm text-gray-600 dark:text-gray-300">
              Halaman {{ page }} / {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="page===totalPages"
              class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            >Next</button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-6 text-center text-red-600">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { MagnifyingGlassIcon, ChevronDownIcon, EyeIcon } from '@heroicons/vue/24/outline'
import * as XLSX from 'xlsx'

const router       = useRouter()
const requests     = ref([])
const loading      = ref(true)
const error        = ref('')

const searchQuery  = ref('')
const filterStatus = ref('')
const dateFrom     = ref('')
const dateTo       = ref('')

const page         = ref(1)
const perPage      = ref(10)

const exportFilterType = ref('all')
const exportCode       = ref('all')
const exportPosition   = ref('all')

onMounted(async () => {
  loading.value = true
  error.value   = ''
  try {
    const { data } = await api.get('/leave-requests/all')
    requests.value = data.data
  } catch {
    error.value = 'Gagal memuat data requests.'
  } finally {
    loading.value = false
  }
})

const statuses = computed(() =>
  Array.from(new Set(requests.value.map(r => r.status)))
)

const filtered = computed(() =>
  requests.value
    .filter(r => r.employee.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase()))
    .filter(r => !filterStatus.value || r.status === filterStatus.value)
    .filter(r => !dateFrom.value   || new Date(r.start_date) >= new Date(dateFrom.value))
    .filter(r => !dateTo.value     || new Date(r.start_date) <= new Date(dateTo.value))
)

const totalPages = computed(() =>
  Math.ceil(filtered.value.length / perPage.value) || 1
)
const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
)

const pendingCount  = computed(() => requests.value.filter(r => r.status === 'pending').length)
const approvedCount = computed(() => requests.value.filter(r => r.status === 'approved').length)
const rejectedCount = computed(() => requests.value.filter(r => r.status === 'rejected').length)

const exportOptions = computed(() => {
  const map = new Map()
  requests.value.forEach(r => {
    if (!map.has(r.employee_code)) map.set(r.employee_code, r.employee.name)
  })
  return Array.from(map, ([code, name]) => ({ code, name }))
})

const positions = computed(() =>
  Array.from(new Set(requests.value.map(r => r.position_name)))
)

const exportData = computed(() => {
  let data = requests.value
  if (exportFilterType.value === 'employee' && exportCode.value !== 'all') {
    data = data.filter(r => r.employee_code === exportCode.value)
  }
  if (exportFilterType.value === 'position' && exportPosition.value !== 'all') {
    data = data.filter(r => r.position_name === exportPosition.value)
  }
  return data
})

const isFiltered = computed(() =>
  searchQuery.value !== '' ||
  filterStatus.value !== '' ||
  dateFrom.value    !== '' ||
  dateTo.value      !== ''
)

const totalCount = computed(() => filtered.value.length)
const positionSummary = computed(() => {
  const m = {}
  filtered.value.forEach(r => {
    const pos = r.position_name
    if (!m[pos]) m[pos] = { total: 0, pending: 0, approved: 0, rejected: 0 }
    m[pos].total++
    m[pos].pending  += r.status === 'pending'  ? 1 : 0
    m[pos].approved += r.status === 'approved' ? 1 : 0
    m[pos].rejected += r.status === 'rejected' ? 1 : 0
  })
  return m
})

function clearFilters() {
  searchQuery.value  = ''
  filterStatus.value = ''
  dateFrom.value     = ''
  dateTo.value       = ''
  page.value         = 1
}

function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }

function onView(r) {
  localStorage.setItem('selectedRequest', JSON.stringify(r))
  router.push({ name: 'RequestDetail', params: { id: r.id } })
}

function downloadExcel() {
  if (!exportData.value.length) return
  const rows = exportData.value.map(r => ({
    Kode     : r.employee_code,
    Karyawan : r.employee.name,
    Jabatan  : r.position_name,
    Tipe     : r.type,
    Start    : r.start_date,
    End      : r.end_date,
    Alasan   : r.reason,
    Status   : r.status,
    Dibuat   : new Date(r.created_at).toLocaleString()
  }))
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' })
  let title, filename
  if (exportFilterType.value === 'employee' && exportCode.value !== 'all') {
    title    = `Requests • ${rows[0].Karyawan}`
    filename = `requests_${exportCode.value}.xlsx`
  } else if (exportFilterType.value === 'position' && exportPosition.value !== 'all') {
    title    = `Requests • Jabatan ${exportPosition.value}`
    filename = `requests_jabatan_${exportPosition.value}.xlsx`
  } else {
    title    = 'Daftar Seluruh Request'
    filename = 'requests_all.xlsx'
  }
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' })
  ws['!merges'] = [{ s: { r:0, c:0 }, e: { r:0, c:7 } }]
  ws['!cols']   = Object.keys(rows[0]).map(() => ({ wch: 15 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Requests')
  XLSX.writeFile(wb, filename)
}
</script>

<style scoped>
thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
