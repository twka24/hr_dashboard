<!-- src/pages/Dashboard.vue -->
<template>
  <div class="dashboard-wrapper p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
    <!-- ===== Header ===== -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard Cuti & Kehadiran
      </h1>
    </div>

    <!-- ===== Ringkasan Organisasi ===== -->
    <!-- ===== Ringkasan Organisasi ===== -->
<section
  class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
>
  <!-- Total Karyawan -->
  <motion-div
    class="summary-card min-h-[120px] flex flex-col justify-between"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
  >
    <p class="summary-label">Total Karyawan</p>
    <p class="summary-value text-indigo-600 dark:text-indigo-400">
      {{ totalEmployees }}
    </p>
  </motion-div>

  <!-- Permintaan Pending -->
  <motion-div
    class="summary-card min-h-[120px] flex flex-col justify-between"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
  >
    <p class="summary-label">Permintaan Pending</p>
    <p class="summary-value text-yellow-600 dark:text-yellow-400">
      {{ pendingCount }}
    </p>
  </motion-div>

  <!-- Sedang Cuti/Izin (hari ini) -->
  <motion-div
    class="summary-card min-h-[120px] flex flex-col justify-between"
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
  >
    <p class="summary-label">Sedang Cuti/Izin (hari ini)</p>
    <p class="summary-value text-indigo-600 dark:text-indigo-400">
      {{ onLeaveCount }}
    </p>
  </motion-div>
</section>


    <!-- ===== Kehadiran Harian ===== -->
    <!-- ==== Kartu Kehadiran Harian – versi lebih ringkas ==== -->
<motion-div
  class="bg-white dark:bg-gray-800 flex flex-col gap-6
         p-4 sm:p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15
         /* hilangkan batas min-height agar menyesuaikan konten */
         md:min-h-[56vh] lg:min-h-[50vh]"
  :initial="{ opacity: 0, y: 20 }"
  :enter="{ opacity: 1, y: 0, transition:{ delay:0.4 } }"
>
  <h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
    Kehadiran Harian – Rekap per Tanggal
  </h2>

  <!-- ===== Bar Ekspor ===== -->
  <div class="flex flex-wrap gap-3 sm:gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Ekspor Jabatan</label>
          <select
            v-model="exportPosition"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2"
          >
            <option value="">— Semua Jabatan —</option>
            <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Dari</label>
          <input type="date" v-model="exportFrom"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2" />
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Sampai</label>
          <input type="date" v-model="exportTo"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2" />
        </div>

        <button
          @click="downloadExcel"
          class="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600
                 transition-transform hover:scale-105"
        >
          Ekspor Excel
        </button>
      </div>
        <!-- ===== Filter grafik ===== -->
      <div class="flex flex-wrap gap-3 sm:gap-4">
        <!-- Jabatan -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Jabatan</label>
          <select
            v-model="chartPosition"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2"
          >
            <option value="">— Semua Jabatan —</option>
            <option v-for="pos in positions" :key="pos" :value="pos">{{ pos }}</option>
          </select>
        </div>

        <!-- Tanggal -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">Tanggal</label>
          <input
            type="date"
            v-model="chartDate"
            class="rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-indigo-500 pl-3 pr-3 py-2"
          />
        </div>
      </div>

  <!-- ===== Grafik & Tabel ===== -->
  <div class="flex flex-col lg:flex-row gap-6 flex-1">
    <!-- Grafik Pie -->
    <div
      class="w-full lg:w-1/3 xl:w-1/4   /* ≈25-33 % di layar besar */
             h-[220px] sm:h-[260px] md:h-[300px] lg:h-[320px] relative"
    >
      <canvas ref="chartRef"></canvas>
    </div>

    <!-- Tabel Ringkasan -->
    <div class="flex-1 overflow-x-auto max-h-[45vh]">
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
            v-for="row in summaryPerEmployee"
            :key="row.name"
            class="border-b border-gray-200 dark:border-gray-600 whitespace-nowrap"
          >
            <td class="table-cell">{{ row.name }}</td>
            <td class="table-cell text-center">{{ row.hadir }}</td>
            <td class="table-cell text-center">{{ row.cuti }}</td>
            <td class="table-cell text-center">{{ row.izin }}</td>
            <td class="table-cell text-center">{{ row.alpha }}</td>
          </tr>
          <tr v-if="!summaryPerEmployee.length">
            <td
              colspan="5"
              class="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
            >
              Tidak ada data.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</motion-div>

  </div>
</template>

<script setup>
/* ——— LOGIC TETAP, PENYESUAIAN MINIMAL PADA FILTER & CHART ——— */
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import * as XLSX from 'xlsx'
import api from '@/services/api'
Chart.register(...registerables)

/* ---------- State global ---------- */
const positionsList = ref([])
const employeesList = ref([])
const leaveRequests = ref([])
const attendances   = ref([])

/* ---------- Kontrol grafik ---------- */
const chartPosition = ref('')
const chartDate     = ref(new Date().toISOString().slice(0,10)) // default: hari ini

/* ---------- Kontrol ekspor ---------- */
const exportPosition = ref('')
const exportFrom     = ref('')
const exportTo       = ref('')

/* ---------- Chart ref ---------- */
const chartRef    = ref(null)
let chartInstance = null

/* ---------- Fetch data once ---------- */
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

  await nextTick()
  renderChart()
})

/* ---------- Util ---------- */
const dateOnly   = (iso) => (iso || '').slice(0,10)               // <<< baru
const positions  = computed(()=> positionsList.value.map(p=>p.position_name))
function posLabel(v){ return v || 'Semua Jabatan' }
function formatDate(iso){ return new Date(iso).toLocaleDateString('id-ID') }

/* ---------- Ringkasan kecil ---------- */
const todayStr = new Date().toISOString().slice(0,10)
const totalEmployees = computed(()=> employeesList.value.length)
const pendingCount   = computed(()=> leaveRequests.value.filter(r=>r.status==='pending').length)
const onLeaveCount   = computed(()=> attendances.value
  .filter(a=>['cuti','izin'].includes(a.status) && dateOnly(a.attendance_date)===todayStr).length)

/* ---------- Data ter-filter (per-hari) ---------- */
const filteredAttendances = computed(() =>
  attendances.value.filter(a => {
    const dateOk = dateOnly(a.attendance_date) === chartDate.value   // <<< ganti
    const posName= a.employee?.position?.position_name || ''
    const posOk  = chartPosition.value === '' || posName === chartPosition.value
    return dateOk && posOk
  })
)

/* === ⇢ 1. DATA PIE (chart) ============================= */
const dayCounts = computed(() => {
  const tpl = { hadir:0, alpha:0, cutiIzin:0 }
  filteredAttendances.value.forEach(a=>{
    if(['hadir','late'].includes(a.status))         tpl.hadir++
    else if(['alpha','absent'].includes(a.status))  tpl.alpha++
    else if(['cuti','izin'].includes(a.status))     tpl.cutiIzin++
  })
  return tpl
})

/* === ⇢ 2. TABEL RINGKASAN PER-KARYAWAN (pure attendances) === */
const summaryPerEmployee = computed(() => {
  const map = {}
  filteredAttendances.value.forEach(a => {
    const emp = a.employee
    if (!emp) return
    const name = emp.name
    if (!map[name]) map[name] = { hadir:0, cuti:0, izin:0, alpha:0 }

    if(['hadir','late'].includes(a.status)) map[name].hadir++
    else if(a.status === 'cuti')            map[name].cuti++
    else if(a.status === 'izin')            map[name].izin++
    else                                    map[name].alpha++
  })
  return Object.entries(map).map(([name,val])=>({ name, ...val }))
})

/* === ⇢ 3. GRAFIK ===================================== */
watch(
  [chartPosition, chartDate, attendances],          // <<< attendances ditambahkan
  async ()=>{
    if(chartInstance){ chartInstance.destroy(); chartInstance=null }
    await nextTick(); renderChart()
  },
  { deep:true }
)

function renderChart () {
  if (!chartRef.value) return
  const ctx = chartRef.value.getContext('2d')

  const src    = dayCounts.value
  const vals   = [src.hadir, src.cutiIzin, src.alpha]
  const total  = vals.reduce((a,b)=>a+b,0)

  const labels      = total ? ['Hadir','Ijin/Cuti','Alpha'] : ['Tidak ada data']
  const chartValues = total ? vals : [1]
  const bgColors    = total ? ['#10B981','#F59E0B','#EF4444'] : ['#d1d5db']

  if(chartInstance){ chartInstance.destroy(); chartInstance=null }

  chartInstance = new Chart(ctx,{
    type:'pie',
    data:{ labels, datasets:[{ data:chartValues, backgroundColor:bgColors }]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{ position:'top' },
        tooltip:{ callbacks:{
          label:c=> total
            ? `${c.label}: ${c.parsed} (${((c.parsed/total)*100).toFixed(1)}%)`
            : 'Tidak ada data'
        }}
      }
    }
  })
}

/* === ⇢ 4. EKSPOR EXCEL (tetap) ======================== */
const exportData = computed(()=> attendances.value.filter(a=>{
  const posOk = exportPosition.value==='' || a.employee.position.position_name===exportPosition.value
  const d     = dateOnly(a.attendance_date)
  const fromOk= !exportFrom.value || d >= exportFrom.value
  const toOk  = !exportTo.value   || d <= exportTo.value
  return posOk && fromOk && toOk
}))

function downloadExcel(){
  if(!exportData.value.length) return
  const summary=new Map()
  exportData.value.forEach(a=>{
    const key=a.employee_code
    if(!summary.has(key)){
      summary.set(key,{
        Kode:a.employee_code, Nama:a.employee.name,
        Jabatan:posLabel(a.employee.position.position_name),
        Hadir:0, Alpha:0, 'Ijin/Cuti':0,
        TglAlpha:[], TglIjinCuti:[]
      })
    }
    const rec=summary.get(key)
    const dStr=formatDate(a.attendance_date)
    if(['hadir','late'].includes(a.status))             rec.Hadir++
    else if(['alpha','absent'].includes(a.status)){     rec.Alpha++;        rec.TglAlpha.push(dStr) }
    else if(['cuti','izin'].includes(a.status)){        rec['Ijin/Cuti']++; rec.TglIjinCuti.push(dStr) }
  })

  const rows=Array.from(summary.values()).map(r=>({
    Kode:r.Kode, Nama:r.Nama, Jabatan:r.Jabatan,
    Hadir:r.Hadir, Alpha:r.Alpha, 'Ijin/Cuti':r['Ijin/Cuti'],
    Total:r.Hadir+r.Alpha+r['Ijin/Cuti'],
    'Tgl Alpha':r.TglAlpha.join(', '),
    'Tgl Ijin/Cuti':r.TglIjinCuti.join(', ')
  }))

  let periode='Semua_Periode'
  if(exportFrom.value||exportTo.value){
    const f=exportFrom.value||exportData.value[0].attendance_date
    const t=exportTo.value||f
    periode=`${f}_s.d_${t}`
  }
  let title=`Rekap Absensi • ${periode.replace(/_/g,' ')}`
  let fn   =`rekap_absensi_${periode}.xlsx`
  if(exportPosition.value!==''){
    title += ` • Jabatan ${exportPosition.value}`
    fn    = `rekap_${exportPosition.value}_${periode}.xlsx`
  }

  const ws=XLSX.utils.json_to_sheet(rows,{origin:'A2'})
  XLSX.utils.sheet_add_aoa(ws,[[title]],{origin:'A1'})
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:Object.keys(rows[0]).length-1}}]
  ws['!cols']=Object.keys(rows[0]).map(()=>({wch:18}))
  const wb=XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb,ws,'Rekap Absensi')
  XLSX.writeFile(wb,fn)
}
</script>
<style scoped>
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

</style>