<template>
  <div class="dashboard-wrapper container mx-auto px-4 sm:px-6 md:px-10 space-y-6 sm:space-y-8">
    <!-- ===== Header ===== -->
    <div class="flex items-center justify-between mt-10">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard Cuti & Kehadiran
      </h1>
    </div>

    <!-- ===== Ringkasan Organisasi ===== -->
    <section class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <motion-div
        class="summary-card w-full p-4 sm:p-6 flex flex-col justify-between rounded-2xl shadow bg-white dark:bg-gray-800 min-h-[120px]"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
      >
        <p class="summary-label">Total Karyawan</p>
        <p class="summary-value text-blue-600 dark:text-blue-400">{{ totalEmployees }}</p>
      </motion-div>

      <motion-div
        class="summary-card w-full p-4 sm:p-6 flex flex-col justify-between rounded-2xl shadow bg-white dark:bg-gray-800 min-h-[120px]"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
      >
        <p class="summary-label">Permintaan Pending</p>
        <p class="summary-value text-yellow-600 dark:text-yellow-400">{{ pendingCount }}</p>
      </motion-div>

      <motion-div
        class="summary-card w-full p-4 sm:p-6 flex flex-col justify-between rounded-2xl shadow bg-white dark:bg-gray-800 min-h-[120px]"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
      >
        <p class="summary-label">Sedang Cuti/Izin (hari ini)</p>
        <p class="summary-value text-blue-600 dark:text-blue-400">{{ onLeaveCount }}</p>
      </motion-div>
    </section>

    <!-- ===== Kehadiran Harian ===== -->
    <motion-div
      class="bg-white dark:bg-gray-800 flex flex-col gap-6 p-4 sm:p-6 md:p-8 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition:{ delay:0.4 } }"
    >
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
        Kehadiran Harian – Rekap per Tanggal
      </h2>

      <!-- ===== Bar Ekspor ===== -->
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <div class="flex-1 sm:flex-none flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Ekspor Jabatan</label>
          <select
            v-model="exportPosition"
            class="w-full sm:w-auto rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 px-3 py-2"
          >
            <option value="">— Semua Jabatan —</option>
            <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
          </select>
        </div>
        <div class="flex-1 sm:flex-none flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Dari</label>
          <input
            type="date"
            v-model="exportFrom"
            class="w-full sm:w-auto rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 px-3 py-2"
          />
        </div>
        <div class="flex-1 sm:flex-none flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Sampai</label>
          <input
            type="date"
            v-model="exportTo"
            class="w-full sm:w-auto rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 px-3 py-2"
          />
        </div>
        <button
          @click="downloadExcel"
          class="w-full sm:w-auto px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-transform hover:scale-105"
        >
          Ekspor Excel
        </button>
      </div>

      <!-- ===== Filter Grafik ===== -->
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <div class="flex-1 sm:flex-none flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Jabatan</label>
          <select
            v-model="chartPosition"
            class="w-full sm:w-auto rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 px-3 py-2"
          >
            <option value="">— Semua Jabatan —</option>
            <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
          </select>
        </div>
        <div class="flex-1 sm:flex-none flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Tanggal</label>
          <input
            type="date"
            v-model="chartDate"
            class="w-full sm:w-auto rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 px-3 py-2"
          />
        </div>
      </div>

      <!-- ===== Grafik & Tabel Kehadiran ===== -->
      <div class="flex flex-col lg:flex-row gap-6 flex-1">
        <div class="w-full lg:w-1/3 xl:w-1/4 flex flex-col items-center">
          <div class="w-full h-[220px] sm:h-[260px] md:h-[280px] lg:h-[300px] relative">
            <canvas ref="chartRef"></canvas>
          </div>
          <div
            class="mt-2 text-center text-sm text-gray-700 dark:text-gray-300 flex flex-wrap justify-center gap-x-3 gap-y-1"
          >
            <span><span class="font-medium">Hadir:</span> {{ dayCounts.hadir }}</span>
            <span><span class="font-medium">Ijin/Cuti:</span> {{ dayCounts.cutiIzin }}</span>
            <span><span class="font-medium">Alpha:</span> {{ dayCounts.alpha }}</span>
          </div>
        </div>

        <div class="flex-1 overflow-x-auto max-h-[45vh]">
          <div class="flex flex-col sm:flex-row items-center justify-end mb-3 gap-3">
            <input
              type="text"
              v-model="searchName"
              placeholder="Cari Karyawan..."
              class="rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 px-3 py-2 w-full sm:w-auto"
            />
            <select
              v-model="filterStatus"
              class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 px-3 py-2 w-full sm:w-auto"
            >
              <option value="">— Semua Status —</option>
              <option value="hadir">Hadir</option>
              <option value="cutiIzin">Ijin/Cuti</option>
              <option value="alpha">Alpha</option>
            </select>
          </div>

          <table class="min-w-full text-sm text-gray-700 dark:text-gray-300">
            <thead class="sticky top-0 bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="table-head">Karyawan</th>
                <th class="table-head text-center">Hadir</th>
                <th class="table-head text-center">Cuti</th>
                <th class="table-head text-center">Izin</th>
                <th class="table-head text-center">Alpha</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredSummaryPerEmployee"
                :key="row.name"
                class="border-b border-gray-200 dark:border-gray-600 whitespace-nowrap"
              >
                <td class="table-cell">{{ row.name }}</td>
                <td class="table-cell text-center">{{ row.hadir }}</td>
                <td class="table-cell text-center">{{ row.cuti }}</td>
                <td class="table-cell text-center">{{ row.izin }}</td>
                <td class="table-cell text-center">{{ row.alpha }}</td>
              </tr>
              <tr v-if="!filteredSummaryPerEmployee.length">
                <td colspan="5" class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion-div>

    <!-- ===== Requests Hari Ini ===== -->
    <motion-div
      class="bg-white dark:bg-gray-800 flex flex-col gap-6 p-4 sm:p-6 md:p-8 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15 mt-6"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition:{ delay:0.5 } }"
    >
      <!-- Header + Badges -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
          Requests Hari Ini
        </h2>
        <div class="flex space-x-3 mt-2 sm:mt-0">
          <span class="px-3 py-1 bg-yellow-100 dark:bg-yellow-700 rounded-full text-sm">
            Pending: {{ todayPendingCount }}
          </span>
          <span class="px-3 py-1 bg-green-100 dark:bg-green-700 rounded-full text-sm">
            Approved: {{ todayApprovedCount }}
          </span>
          <span class="px-3 py-1 bg-red-100 dark:bg-red-700 rounded-full text-sm">
            Rejected: {{ todayRejectedCount }}
          </span>
        </div>
      </div>

      <!-- Filter & Reset -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <input
          v-model="reqSearch"
          type="text"
          placeholder="Cari Karyawan..."
          class="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 px-3 py-2 w-full sm:w-auto"
        />
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <select
            v-model="reqStatus"
            class="w-full sm:w-auto rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 px-3 py-2"
          >
            <option value="">— Semua Status —</option>
            <option v-for="st in reqStatuses" :key="st" :value="st">{{ st }}</option>
          </select>
          <button
            @click="resetReqFilter"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition w-full sm:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Tabel hari ini -->
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse text-sm">
          <thead class="bg-blue-100 dark:bg-blue-900">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Kode</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Karyawan</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Jabatan</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Tipe</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Start</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">End</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Alasan</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Dibuat</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in pagedRequests"
              :key="r.id"
              class="border-b even:bg-gray-50 dark:even:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
            >
              <td class="px-4 py-3">{{ r.employee_code }}</td>
              <td class="px-4 py-3">{{ r.employee.name }}</td>
              <td class="px-4 py-3">{{ r.position_name }}</td>
              <td class="px-4 py-3">{{ r.type }}</td>
              <td class="px-4 py-3">{{ r.start_date }}</td>
              <td class="px-4 py-3">{{ r.end_date }}</td>
              <td class="px-4 py-3 truncate">{{ r.reason }}</td>
              <td class="px-4 py-3">
                <span
                  :class="{
                    'text-yellow-600': r.status==='pending',
                    'text-green-600':  r.status==='approved',
                    'text-red-600':    r.status==='rejected'
                  }"
                >{{ r.status }}</span>
              </td>
              <td class="px-4 py-3">{{ new Date(r.created_at).toLocaleDateString() }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="viewRequest(r)"
                  class="inline-flex items-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                >
                  <EyeIcon class="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </button>
              </td>
            </tr>
            <tr v-if="!pagedRequests.length">
              <td colspan="10" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                Tidak ada request untuk hari ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center items-center gap-2 mt-4">
        <button
          @click="prevPage"
          :disabled="page===1"
          class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >Prev</button>
        <span class="px-2 text-gray-600 dark:text-gray-300">Halaman {{ page }} / {{ totalPageCount }}</span>
        <button
          @click="nextPage"
          :disabled="page===totalPageCount"
          class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >Next</button>
      </div>
    </motion-div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useRouter } from 'vue-router'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import api from '@/services/api'
import { EyeIcon } from '@heroicons/vue/24/outline'
Chart.register(...registerables)

/* — Kehadiran — */
const router       = useRouter()
const positionsList = ref([])
const employeesList = ref([])
const leaveRequests  = ref([])
const attendances    = ref([])

const chartPosition  = ref('')
const chartDate      = ref(new Date().toISOString().slice(0,10))
const exportPosition = ref('')
const exportFrom     = ref('')
const exportTo       = ref('')
const filterStatus   = ref('')
const searchName     = ref('')

const chartRef     = ref(null)
let chartInstance  = null

onMounted(async () => {
  const [posRes, empRes, lrRes, attRes] = await Promise.all([
    api.get('/positions'),
    api.get('/employees'),
    api.get('/leave-requests/all'),
    api.get('/attendances')
  ])

  positionsList.value = posRes.data.data
  employeesList.value = empRes.data.data
  leaveRequests.value  = lrRes.data.data

  // 1) Ambil raw data
  const rawAttendances = attRes.data.data

  // 2) Filter out semua entri yang sudah soft-deleted
  const cleanAttendances = rawAttendances.filter(a =>
    // root record belum di-soft-delete
    a.deleted_at === null
    // employee-nya belum di-soft-delete
    && (a.employee?.deleted_at ?? null) === null
    // (opsional) jika ingin ignore juga posisi yang di-soft-delete
    && (a.employee?.position?.deleted_at ?? null) === null
  )

  // 3) assign yang sudah dibersihkan
  attendances.value = cleanAttendances

  await nextTick()
  renderChart()
})


const dateOnly = iso => (iso || '').slice(0,10)
const todayStr = new Date().toISOString().slice(0,10)
const positions = computed(() => positionsList.value.map(p => p.position_name))

const totalEmployees = computed(() => employeesList.value.length)
const pendingCount   = computed(() => leaveRequests.value.filter(r => r.status==='pending').length)
const onLeaveCount   = computed(() => attendances.value.filter(a =>
  ['cuti','izin'].includes(a.status) && dateOnly(a.attendance_date)===todayStr
).length)

const filteredAttendances = computed(() =>
  attendances.value.filter(a => {
    const okDate = dateOnly(a.attendance_date) === chartDate.value
    const posName = a.employee?.position?.position_name || ''
    const okPos  = !chartPosition.value || posName === chartPosition.value
    return okDate && okPos
  })
)

const dayCounts = computed(() => {
  const t = { hadir:0, cutiIzin:0, alpha:0 }
  filteredAttendances.value.forEach(a => {
    if (['hadir','late'].includes(a.status))        t.hadir++
    else if (['cuti','izin'].includes(a.status))     t.cutiIzin++
    else                                            t.alpha++
  })
  return t
})

const summaryPerEmployee = computed(() => {
  const m = {}
  filteredAttendances.value.forEach(a => {
    const emp = a.employee
    if (!emp) return
    const nm = emp.name
    if (!m[nm]) m[nm] = { hadir:0, cuti:0, izin:0, alpha:0 }
    if (['hadir','late'].includes(a.status)) m[nm].hadir++
    else if (a.status==='cuti')              m[nm].cuti++
    else if (a.status==='izin')              m[nm].izin++
    else                                     m[nm].alpha++
  })
  return Object.entries(m).map(([name,v]) => ({ name, ...v }))
})

const filteredSummaryPerEmployee = computed(() =>
  summaryPerEmployee.value.filter(r => {
    const okName = r.name.toLowerCase().includes(searchName.value.toLowerCase())
    let ok = true
    if (filterStatus.value==='hadir')        ok = r.hadir>0
    else if (filterStatus.value==='cutiIzin')ok = r.cuti+r.izin>0
    else if (filterStatus.value==='alpha')   ok = r.alpha>0
    return okName && ok
  })
)

watch([chartPosition, chartDate, attendances], async () => {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  await nextTick(); renderChart()
}, { deep: true })

function renderChart() {
  if (!chartRef.value) return
  const ctx = chartRef.value.getContext('2d')
  const src = dayCounts.value
  const vals = [src.hadir, src.cutiIzin, src.alpha]
  const tot = vals.reduce((a,b) => a+b, 0)
  const labels = tot ? ['Hadir','Ijin/Cuti','Alpha'] : ['Tidak ada data']
  const data = tot ? vals : [1]
  const colors = tot ? ['#10B981','#F59E0B','#EF4444'] : ['#d1d5db']
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: c => tot
              ? `${c.label}: ${c.parsed} (${((c.parsed/tot)*100).toFixed(1)}%)`
              : 'Tidak ada data'
          }
        }
      }
    }
  })
}

const exportData = computed(() =>
  attendances.value.filter(a => {
    const okPos  = !exportPosition.value || a.employee.position.position_name === exportPosition.value
    const d      = dateOnly(a.attendance_date)
    const fromOk = !exportFrom.value || d >= exportFrom.value
    const toOk   = !exportTo.value   || d <= exportTo.value
    return okPos && fromOk && toOk
  })
)

function colLetter(n) {
  let s = ''
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
function posLabel (name) {
  return name && name !== 'null' ? name : 'Semua Jabatan'
}
async function downloadExcel () {
  if (!exportData.value.length) return

  // 1️⃣ REKAP DATA per karyawan
  const summary = new Map()
  exportData.value.forEach(a => {
    const key = a.employee_code
    if (!summary.has(key)) {
      summary.set(key, {
        Kode    : a.employee_code,
        Nama    : a.employee.name,
        Jabatan : posLabel(a.employee.position.position_name),
        Hadir   : 0,
        Alpha   : 0,
        Cuti    : 0,
        Izin    : 0,
        // untuk grid
        TglHadir : new Set(),
        TglAlpha : new Set(),
        TglCuti  : new Set(),
        TglIzin  : new Set()
      })
    }
    const rec = summary.get(key)
    const dt  = new Date(a.attendance_date)
    const day = dt.getDate()  // 1..31

    if (a.status === 'hadir' || a.status === 'late') {
      rec.Hadir++
      rec.TglHadir.add(day)
    } else if (['alpha','absent'].includes(a.status)) {
      rec.Alpha++
      rec.TglAlpha.add(day)
    } else if (a.status === 'cuti') {
      rec.Cuti++
      rec.TglCuti.add(day)
    } else if (a.status === 'izin') {
      rec.Izin++
      rec.TglIzin.add(day)
    }
  })

  // 2️⃣ Info bulan & daftar karyawan
  const firstDate   = new Date(exportData.value[0].attendance_date)
  const year        = firstDate.getFullYear()
  const month       = firstDate.getMonth() + 1
  const monthName   = firstDate.toLocaleDateString('id-ID',{ month:'long', year:'numeric' })
  const daysInMonth = new Date(year, month, 0).getDate()
  const employees   = Array.from(summary.values())

  // 3️⃣ Siapkan workbook
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Aplikasi Absensi'
  wb.created = new Date()

  // hitung index kolom
  const idxCode       = 1
  const idxName       = 2
  const idxDayStart   = 3
  const idxDayEnd     = idxDayStart + daysInMonth - 1
  const idxJumlahHari = idxDayEnd + 1
  const legendCols    = ['Hadir','Cuti','Izin','Alpha']
  const idxLegendStart = idxJumlahHari + 1
  const totalCols     = idxLegendStart + legendCols.length - 1

  const ws = wb.addWorksheet('Absensi Bulanan', {
    views:[{state:'frozen', ySplit:4}]
  })

  // 4️⃣ Judul & Periode
  ws.mergeCells(`A1:${colLetter(totalCols)}1`)
  ws.getCell('A1').value = `Absensi Karyawan PT Towuti Karya Abadi`
  ws.getCell('A1').font  = { size:14, bold:true }
  ws.getCell('A1').alignment = { horizontal:'center', vertical:'middle' }
  ws.getCell('A2').value = 'Periode :'
  ws.getCell('B2').value = monthName
  ws.getRow(2).font = { bold:true }

  // 5️⃣ Group header (baris 3)
  ws.mergeCells(`C3:${colLetter(idxDayEnd)}3`)
  ws.getCell('C3').value     = 'Tanggal'
  ws.getCell('C3').alignment = { horizontal:'center' }
  ws.getCell('C3').fill      = { type:'pattern',pattern:'solid',fgColor:{argb:'FFB7E1CD'} }

  ws.mergeCells(`${colLetter(idxLegendStart)}3:${colLetter(totalCols)}3`)
  ws.getCell(colLetter(idxLegendStart)+'3').value     = 'Keterangan'
  ws.getCell(colLetter(idxLegendStart)+'3').alignment = { horizontal:'center' }
  ws.getCell(colLetter(idxLegendStart)+'3').fill      = { type:'pattern',pattern:'solid',fgColor:{argb:'FFD9D9D9'} }

  // 6️⃣ Detail header (baris 4)
  const hdr = ws.getRow(4)
  hdr.getCell(idxCode).value = 'No. Karyawan'
  hdr.getCell(idxName).value = 'Nama'
  // tanggal
  for(let d=1; d<=daysInMonth; d++){
    const c = hdr.getCell(idxDayStart + d - 1)
    c.value     = d
    c.alignment = { horizontal:'center' }
    c.fill      = { type:'pattern',pattern:'solid',fgColor:{argb:'FFDFF0D8'} }
  }
  // Jumlah Hari
  const sumHdr = hdr.getCell(idxJumlahHari)
  sumHdr.value     = 'Jumlah'
  sumHdr.alignment = { horizontal:'center' }
  sumHdr.fill      = { type:'pattern',pattern:'solid',fgColor:{argb:'FFF4B084'} }

  // legend
  const legendColors = { Hadir:'FFB7E1CD', Cuti:'FFCCCCFF', Izin:'FFFFC000', Alpha:'FFFF0000' }
  legendCols.forEach((lab,i)=>{
    const c = hdr.getCell(idxLegendStart + i)
    c.value     = lab
    c.alignment = { horizontal:'center' }
    c.fill      = { type:'pattern',pattern:'solid',fgColor:{argb:legendColors[lab]} }
  })
  hdr.font   = { bold:true }
  hdr.height = 25

  // 7️⃣ Data + hitung otomatis
  employees.forEach((rec, i)=>{
    const rNum = 5 + i
    const row  = ws.getRow(rNum)
    row.getCell(idxCode).value = rec.Kode
    row.getCell(idxName).value = rec.Nama

    // isi grid tanggal
    for(let d=1; d<=daysInMonth; d++){
      const c = row.getCell(idxDayStart + d - 1)
      if (rec.TglHadir.has(d)) c.value = 'H'
      else if (rec.TglAlpha.has(d)) c.value = 'A'
      else if (rec.TglCuti.has(d))  c.value = 'C'
      else if (rec.TglIzin.has(d))  c.value = 'I'
      else c.value = ''  // kosong jika tidak ada data
      c.alignment = { horizontal:'center' }
    }

    // hitung totals langsung dari summary
    row.getCell(idxJumlahHari).value = rec.Hadir + rec.Cuti + rec.Izin + rec.Alpha

    // isi kolom legend
    const vals = [rec.Hadir, rec.Cuti, rec.Izin, rec.Alpha]
    vals.forEach((v,j)=>{
      const c = row.getCell(idxLegendStart + j)
      c.value     = v
      c.alignment = { horizontal:'center' }
    })

    row.height = 20
  })

  // 8️⃣ Kolom widths
  ws.columns.forEach((c,i)=>{
    if (i+1 === idxCode)       c.width = 15
    else if (i+1 === idxName)  c.width = 25
    else if (i+1 <= idxDayEnd) c.width = 4
    else                        c.width = 12
  })

  // 9️⃣ Simpan
  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf],{
    type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }), `absensi_${monthName.replace(' ','_').toLowerCase()}.xlsx`)
}

/* — Requests Hari Ini — */
const reqAll     = ref([])
const loadingReq = ref(true)
const errorReq   = ref('')
const reqSearch  = ref('')
const reqStatus  = ref('')
const page       = ref(1)
const perPage    = ref(10)

onMounted(async () => {
  try {
    const { data } = await api.get('/leave-requests/all')
    reqAll.value = data.data
  } catch {
    errorReq.value = 'Gagal memuat requests.'
  } finally {
    loadingReq.value = false
  }
})

const today = new Date().toISOString().slice(0,10)
const todayRequests = computed(() =>
  reqAll.value.filter(r =>
    r.start_date <= today && r.end_date >= today
  )
)

const todayPendingCount  = computed(() => todayRequests.value.filter(r=>r.status==='pending').length)
const todayApprovedCount = computed(() => todayRequests.value.filter(r=>r.status==='approved').length)
const todayRejectedCount = computed(() => todayRequests.value.filter(r=>r.status==='rejected').length)

const reqStatuses = computed(() =>
  Array.from(new Set(todayRequests.value.map(r => r.status)))
)

const filteredRequests = computed(() =>
  todayRequests.value
    .filter(r => r.employee.name.toLowerCase().includes(reqSearch.value.trim().toLowerCase()))
    .filter(r => !reqStatus.value || r.status === reqStatus.value)
)

const totalPageCount = computed(() =>
  Math.max(1, Math.ceil(filteredRequests.value.length / perPage.value))
)
const pagedRequests = computed(() =>
  filteredRequests.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
)

function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPageCount.value) page.value++ }
function resetReqFilter() {
  reqSearch.value = ''
  reqStatus.value = ''
  page.value = 1
}
function viewRequest(r) {
  // navigasi detail
    localStorage.setItem('selectedRequest', JSON.stringify(r))
  router.push({ name: 'RequestDetail', params: { id: r.id } })
}
</script>

<style scoped lang="postcss">
.summary-card {
  @apply bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow
         ring-1 ring-black/10 dark:ring-white/15;
}
.summary-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}
.summary-value {
  @apply text-3xl font-bold;
}

/* sticky header for Requests table */
thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>

