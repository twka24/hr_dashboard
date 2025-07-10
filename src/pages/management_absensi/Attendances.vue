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
            <div class="flex flex-wrap gap-4 mt-2 text-sm">
              <div v-if="onLeave.length" class="px-3 py-1 bg-yellow-100 dark:bg-yellow-700 rounded-full">
                Cuti/Ijin ({{ onLeave.length }}): {{ onLeave.map(a=>a.employee.name).join(', ') }}
              </div>
              <div v-if="absentList.length" class="px-3 py-1 bg-red-100 dark:bg-red-700 rounded-full">
                Absen ({{ absentList.length }}): {{ absentList.map(a=>a.employee.name).join(', ') }}
              </div>
              <div v-if="noCheckOut.length" class="px-3 py-1 bg-blue-100 dark:bg-blue-700 rounded-full">
                Belum Pulang ({{ noCheckOut.length }}): {{ noCheckOut.map(a=>a.employee.name).join(', ') }}
              </div>
            </div>
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
                  <td colspan="8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data yang sesuai.
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
import * as XLSX from 'xlsx'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

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
function formatDate(iso){ return new Date(iso).toLocaleDateString() }
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

/* helper sudah dibuat sebelumnya
   function posLabel(name){ return name && name!=='null' ? name : 'Semua Jabatan' } */

/* ========================== */
function downloadExcel () {
  if (!exportData.value.length) return

  /* ==== REKAP & TANGGAL RINCI ==== */
  const summary = new Map()          // key = employee_code

  exportData.value.forEach(a => {
    const key = a.employee_code
    if (!summary.has(key)) {
      summary.set(key, {
        Kode        : a.employee_code,
        Nama        : a.employee.name,
        Jabatan     : posLabel(a.employee.position.position_name),
        Hadir       : 0,
        Alpha       : 0,
        'Ijin/Cuti' : 0,
        TglAlpha    : [],
        TglIjinCuti : []
      })
    }
    const rec  = summary.get(key)
    const dStr = formatDate(a.attendance_date)      // fungsi formatDate sudah ada

    if (a.status === 'hadir' || a.status === 'late') {
      rec.Hadir++
    } else if (['alpha', 'absent'].includes(a.status)) {
      rec.Alpha++
      rec.TglAlpha.push(dStr)
    } else if (['cuti', 'izin'].includes(a.status)) {
      rec['Ijin/Cuti']++
      rec.TglIjinCuti.push(dStr)
    }
  })

  const rows = Array.from(summary.values()).map(r => ({
    Kode        : r.Kode,
    Nama        : r.Nama,
    Jabatan     : r.Jabatan,
    Hadir       : r.Hadir,
    Alpha       : r.Alpha,
    'Ijin/Cuti' : r['Ijin/Cuti'],
    Total       : r.Hadir + r.Alpha + r['Ijin/Cuti'],
    'Tgl Alpha'     : r.TglAlpha.join(', '),
    'Tgl Ijin/Cuti' : r.TglIjinCuti.join(', ')
  }))

  /* ==== JUDUL & NAMA FILE (bulan-tahun) ==== */
  // asumsikan data dalam bulan yang sama → ambil tanggal pertama
  let bulanTahun = 'Semua Periode'
  if (exportData.value.length) {
    bulanTahun = new Date(exportData.value[0].attendance_date)
      .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })   // ex: "Juli 2025"
  }

  let title = `Rekap Absensi • ${bulanTahun}`
  let fn    = `rekap_absensi_${bulanTahun.replace(' ', '_').toLowerCase()}.xlsx`

  if (exportFilterType.value === 'employee' && exportCode.value !== 'all') {
    title += ` • ${rows[0].Nama}`
    fn     = `rekap_${exportCode.value}_${bulanTahun.replace(' ', '_').toLowerCase()}.xlsx`
  } else if (exportFilterType.value === 'position' && exportPosition.value !== 'all') {
    title += ` • Jabatan ${exportPosition.value}`
    fn     = `rekap_jabatan_${exportPosition.value}_${bulanTahun.replace(' ', '_').toLowerCase()}.xlsx`
  }

  /* ==== TULIS KE EXCEL ==== */
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' })

  const colCount  = Object.keys(rows[0]).length
  ws['!merges']   = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }]
  ws['!cols']     = Array(colCount).fill({ wch: 18 })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi')
  XLSX.writeFile(wb, fn)
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
