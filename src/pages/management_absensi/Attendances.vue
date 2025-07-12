<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">
      <!-- Card -->
      <div class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl">
        <!-- Header + View Toggle -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700"
        >
          <div>
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Management Absensi
            </h1>
            <!-- Notifikasi -->
          </div>
          <div class="mt-4 sm:mt-0 inline-flex rounded-lg bg-gray-100 dark:bg-gray-700">
            <button
              @click="isCalendarView = false"
              :class="{'bg-blue-500 text-white': !isCalendarView, 'text-gray-700 dark:text-gray-300': isCalendarView}"
              class="px-4 py-2 rounded-l-lg hover:bg-blue-400 transition"
            >
              Table View
            </button>
            <button
              @click="isCalendarView = true"
              :class="{'bg-blue-500 text-white': isCalendarView, 'text-gray-700 dark:text-gray-300': !isCalendarView}"
              class="px-4 py-2 rounded-r-lg hover:bg-blue-400 transition"
            >
              Calendar View
            </button>
          </div>
        </div>

        <!-- Toolbar Filters (Table View only) -->
        <div
          v-if="!isCalendarView"
          class="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6"
        >
          <!-- Filters -->
          <div class="flex flex-1 flex-col md:flex-row gap-4 w-full">
            <!-- Cari Nama Karyawan -->
            <div class="w-full md:w-1/4">
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Cari Nama Karyawan
              </label>
              <div class="relative">
                <MagnifyingGlassIcon
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5"
                />
                <input
                  v-model="searchName"
                  type="text"
                  placeholder="Cari Nama karyawan..."
                  class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 transition"
                />
              </div>
            </div>

            <!-- Dari Tanggal -->
            <div class="w-full md:w-1/6">
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Dari Tanggal
              </label>
              <input
                v-model="dateFrom"
                type="date"
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 px-3 py-2 transition"
              />
            </div>

            <!-- Sampai Tanggal -->
            <div class="w-full md:w-1/6">
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Sampai Tanggal
              </label>
              <input
                v-model="dateTo"
                type="date"
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 px-3 py-2 transition"
              />
            </div>

            <!-- Jabatan -->
            <div class="w-full md:w-1/4">
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Jabatan
              </label>
              <div class="relative">
                <select
                  v-model="filterPosition"
                  class="appearance-none w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-2 transition"
                >
                  <option value="">— Semua Jabatan —</option>
                  <option v-for="pos in positions" :key="pos" :value="pos">
                    {{ pos }}
                  </option>
                </select>
                <ChevronDownIcon
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
                />
              </div>
            </div>

            <!-- Status -->
            <div class="w-full md:w-1/4">
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <div class="relative">
                <select
                  v-model="filterStatus"
                  class="appearance-none w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 pl-4 pr-10 py-2 transition"
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

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition self-end"
            >
              Hapus Filter
            </button>
          </div>
        </div>

        <!-- Export Toolbar -->
        <!-- (bagian ini TIDAK diubah) -->
        <div v-if="!isCalendarView" class="flex flex-col md:flex-row items-center justify-between gap-4 px-6 pb-2">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              Ekspor:
            </label>
            <div class="relative">
              <select
                v-model="exportFilterType"
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 pl-4 pr-8 py-2 transition"
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
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 pl-4 pr-8 py-2 transition"
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
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 pl-4 pr-8 py-2 transition"
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

          <!-- Ringkasan jumlah -->
        </div>

        <!-- Content -->
        <div class="p-6 bg-white dark:bg-gray-800">
          <div v-if="loading" class="flex justify-center py-20">
            <svg class="h-12 w-12 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"/>
            </svg>
          </div>

          <!-- Calendar View -->
          <FullCalendar
            v-if="!loading && isCalendarView"
            class="rounded-lg overflow-hidden"
            :options="calendarOptions"
          />

          <!-- Table View -->
          <div v-if="!loading && !isCalendarView" class="overflow-x-auto">
            <table class="w-full table-auto border-collapse">
              <thead class="bg-blue-100 dark:bg-blue-900">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Kode</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nama</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jabatan</th>
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
                  class="border-b even:bg-gray-50 dark:even:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.employee_code }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.employee?.name || '—' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.employee?.position?.position_name || '—' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ formatDate(att.attendance_date) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.check_in ? formatTime(att.check_in) : '-' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ att.check_out ? formatTime(att.check_out) : '-' }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span
                      :class="{
                        'text-green-600': att.status==='hadir',
                        'text-red-600':   att.status==='alpha',
                        'text-yellow-600': att.status==='late' || att.status==='cuti'
                      }"
                    >
                      {{ att.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button @click="viewDetail(att)" class="inline-flex items-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition">
                      <EyeIcon class="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!paginated.length">
                  <td colspan="8" class="px-4 py-6">
                    <div class="flex flex-col items-center justify-center">
                      <DotLottieVue
                        src="https://lottie.host/0d0b58ce-53fe-47dc-aaa1-51b392330e59/J7lGZekeC3.json"
                        autoplay
                        loop
                        class="w-34 h-34"
                      />
                      <p class="mt-2 text-gray-500 dark:text-gray-400 text-center">
                        Tidak ada data Management Absensi
                      </p>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>

            <div class="flex justify-center items-center gap-2 py-6">
              <button @click="prevPage" :disabled="page===1" class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Prev</button>
              <span class="px-2 text-sm text-gray-600 dark:text-gray-300">Halaman {{ page }} / {{ totalPages }}</span>
              <button @click="nextPage" :disabled="page===totalPages" class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
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
import { MagnifyingGlassIcon, ChevronDownIcon, EyeIcon } from '@heroicons/vue/24/outline'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
// contoh import logo sebagai Base64 (Anda bisa gunakan loader webpack atau fetch)
const logoUrl = '/logo_twka.jpg'

const router  = useRouter()
const attendances = ref([])
const loading = ref(true)
const error   = ref('')

/* ===================== FILTERS ===================== */
const todayISO       = new Date().toISOString().slice(0,10)   // YYYY-MM-DD
const searchName     = ref('')
const dateFrom       = ref(todayISO)      // default hari ini
const dateTo         = ref(todayISO)      // default hari ini
const filterStatus   = ref('')
const filterPosition = ref('')

/* ==================== PAGINATION & VIEW ==================== */
const page           = ref(1)
const perPage        = ref(10)
const isCalendarView = ref(false)

/* ==================== EXPORT ==================== */
const exportFilterType = ref('all')
const exportCode       = ref('all')
const exportPosition   = ref('all')

/* ==================== CALENDAR CONFIG ==================== */
const calendarPlugins       = [ dayGridPlugin ]
const calendarInitialView   = 'dayGridMonth'
const calendarHeaderToolbar = { left:'prev,next today', center:'title', right:'' }

/* ==================== FORMATTERS ==================== */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  })
}

function formatTime (value) {
  if (!value) return '-'

  // Jika value sudah persis "HH:mm", kembalikan apa adanya
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
    return value
  }

  // Selain itu, olah seperti sebelumnya
  return new Date(value).toLocaleTimeString('id-ID', {
    hour  : '2-digit',
    minute: '2-digit'
  })
}

/* ==================== DATA LOADING ==================== */
async function loadAttendances(){
  loading.value = true
  try {
    const res = await api.get('/attendances')
    // 1) Ambil data mentah
    const raw = res.data.data

    // 2) Saring semua record yang deleted_at-nya bukan null
    //    dan juga pastikan employee (jika ada) tidak soft-deleted
    const clean = raw.filter(a =>
      // jika a.deleted_at ada dan bukan null, buang
      a.deleted_at === null
      // jika nested employee.deleted_at ada dan bukan null, buang
      && (a.employee?.deleted_at ?? null) === null
    )

    attendances.value = clean
  } catch {
    error.value = 'Gagal memuat data absensi.'
  } finally {
    loading.value = false
  }
}


onMounted(loadAttendances)

/* ==================== CLEAR FILTERS ==================== */
function clearFilters(){
  searchName.value     = ''
  dateFrom.value       = todayISO   // kembali ke hari ini
  dateTo.value         = todayISO
  filterStatus.value   = ''
  filterPosition.value = ''
  exportFilterType.value = 'all'
  exportCode.value       = 'all'
  exportPosition.value   = 'all'
  page.value = 1
}

/* ==================== OPTIONS LIST ==================== */
const statuses  = computed(()=>[...new Set(attendances.value.map(a=>a.status))])
const positions = computed(() => [
  ...new Set(
    attendances.value
      .map(a => a.employee?.position?.position_name || 'Tanpa Jabatan')
      .filter(Boolean)        // hapus null/'' jika tak ingin label khusus
  )
])
const exportOptions = computed(()=>{
  const m=new Map()
  attendances.value.forEach(a=>{ if(!m.has(a.employee_code)) m.set(a.employee_code,a.employee.name) })
  return [...m].map(([code,name])=>({code,name}))
})

/* ==================== FILTERING ==================== */
const filtered = computed(()=>{
  let list = attendances.value

  // filter tanggal (wajib)
  const d0 = new Date(dateFrom.value)
  const d1 = new Date(dateTo.value)
  list = list.filter(a=>{
    const d = new Date(a.attendance_date)
    return d >= d0 && d <= d1
  })

  if(searchName.value)
    list = list.filter(a=>a.employee.name.toLowerCase().includes(searchName.value.trim().toLowerCase()))
  if(filterStatus.value)
    list = list.filter(a=>a.status===filterStatus.value)
  if(filterPosition.value)
    list = list.filter(a=>a.employee.position.position_name===filterPosition.value)

  return list
})
watch([searchName,dateFrom,dateTo,filterStatus,filterPosition],()=>page.value=1)

/* ==================== PAGINATION ==================== */
const totalPages = computed(()=>Math.max(1,Math.ceil(filtered.value.length/perPage.value)))
const paginated  = computed(()=>filtered.value.slice((page.value-1)*perPage.value, page.value*perPage.value))
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<totalPages.value) page.value++ }

/* ==================== NOTIFICATION LISTS ==================== */
const onLeave    = computed(()=>filtered.value.filter(a=>['cuti','izin'].includes(a.status)))
const absentList = computed(()=>filtered.value.filter(a=>a.status==='absent'))
const noCheckOut = computed(()=>filtered.value.filter(a=>a.check_in && !a.check_out))

/* ==================== SUMMARY ==================== */
const isFiltered = computed(()=>(
  searchName.value     || filterStatus.value   || filterPosition.value ||
  dateFrom.value!==todayISO || dateTo.value!==todayISO
))
const totalCount = computed(()=>filtered.value.length)
const positionSummary = computed(() => {
  const m = {}
  filtered.value.forEach(a => {
    // pakai optional chaining & fallback
    const pos = a.employee?.position?.position_name || '— Semua Jabatan —'

    if (!m[pos]) {
      m[pos] = { total: 0, absent: 0, leave: 0 }
    }
    m[pos].total++

    if (['cuti', 'izin'].includes(a.status)) {
      m[pos].leave++
    }
    if (['alpha', 'absent'].includes(a.status)) {
      m[pos].absent++
    }
  })
  return m
})


/* ==================== DETAIL ==================== */
function viewDetail(a){
  localStorage.setItem('selectedAttendance',JSON.stringify(a))
  router.push({ name:'AttendanceDetail', params:{ id:a.id } })
}

/* ==================== EXPORT ==================== */
const exportData = computed(()=>{
  let list = filtered.value
  if(exportFilterType.value==='employee' && exportCode.value!=='all')
    list = list.filter(a=>a.employee_code===exportCode.value)
  if(exportFilterType.value==='position' && exportPosition.value!=='all')
    list = list.filter(a=>a.employee.position.position_name===exportPosition.value)
  return list
})

// helper: angka kolom → huruf Excel (1→A, 27→AA, dst)
function colLetter(n) {
  let s = ''
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
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


/* ========================== */


/* ==================== CALENDAR ==================== */
const calendarEvents = computed(()=>filtered.value.map(a=>({
  title:a.employee.name,
  start:a.attendance_date,
  extendedProps:{status:a.status,checkIn:a.check_in,checkOut:a.check_out},
  color:({'hadir':'#00FF00','alpha':'#EF4444','late':'#F59E0B','cuti':'#F59E0B'}[a.status]||'#6B7280')
})))
const calendarOptions = computed(()=>({
  plugins:calendarPlugins,
  initialView:calendarInitialView,
  headerToolbar:calendarHeaderToolbar,
  events:calendarEvents.value,
  eventDidMount(info){
    const p=info.event.extendedProps
    info.el.title=`Karyawan: ${info.event.title}\nStatus: ${p.status}\nMasuk: ${p.checkIn?formatTime(p.checkIn):'-'}\nPulang: ${p.checkOut?formatTime(p.checkOut):'-'}`
  }
}))

function posLabel (name) {
  return name && name !== 'null' ? name : 'Semua Jabatan'
}

</script>

<style scoped>
thead tr { position: sticky; top: 0; z-index: 10 }
.fc .fc-toolbar-title { font-weight:600; font-size:1.25rem }
.fc .fc-daygrid-event { font-size:.75rem; border-radius:.375rem }
</style>
