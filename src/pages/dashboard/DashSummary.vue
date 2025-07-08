<!-- src/pages/Dashboard.vue -->
<template>
  <div class="dashboard-wrapper p-6 md:p-10 space-y-8">
    <!-- ===== Header ===== -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard Cuti & Kehadiran
      </h1>
    </div>

    <!-- ===== Ringkasan Organisasi ===== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Total karyawan -->
      <motion-div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition:{ delay:0.1 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Karyawan</p>
        <p class="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ totalEmployees }}
        </p>
      </motion-div>

      <!-- Permintaan pending -->
      <motion-div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition:{ delay:0.2 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Permintaan Pending</p>
        <p class="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ pendingCount }}
        </p>
      </motion-div>

      <!-- Sedang cuti/izin hari ini -->
      <motion-div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition:{ delay:0.3 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Sedang Cuti/Izin (hari ini)</p>
        <p class="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ onLeaveCount }}
        </p>
      </motion-div>
    </div>

    <!-- ===== Kehadiran Bulanan (per-tanggal) ===== -->
    <motion-div
      class="bg-white dark:bg-gray-800 flex flex-col gap-4 p-6 rounded-2xl shadow ring-1 ring-black/10 dark:ring-white/15"
      style="height: 80vh;"
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition:{ delay:0.4 } }"
    >
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Kehadiran Bulanan – Rekap per Tanggal
      </h2>

      <!-- ===== Filter grafik ===== -->
      <div class="flex flex-wrap gap-4">
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

        <!-- Bulan -->
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

      <!-- ===== Bar ekspor ===== -->
      <div class="flex flex-wrap gap-4">
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

      <!-- ===== Grafik ===== -->
      <div class="w-full flex-none" style="height: 400px; position: relative;">
        <canvas ref="chartRef"></canvas>
      </div>

      <!-- ===== Tabel Ringkasan (tetap per-karyawan) ===== -->
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
const chartMonth    = ref(new Date().toISOString().slice(0,7))   // default: bulan ini

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
const positions = computed(()=> positionsList.value.map(p=>p.position_name))
function posLabel(v){ return v || 'Semua Jabatan' }
function formatDate(iso){ return new Date(iso).toLocaleDateString('id-ID') }

/* ---------- Ringkasan kecil ---------- */
const todayStr = new Date().toISOString().slice(0,10)
const totalEmployees = computed(()=> employeesList.value.length)
const pendingCount   = computed(()=> leaveRequests.value.filter(r=>r.status==='pending').length)
const onLeaveCount   = computed(()=> attendances.value.filter(a=>['cuti','izin'].includes(a.status)&&a.attendance_date===todayStr).length)

/* ---------- Data ter-filter untuk grafik ---------- */
const filteredAttendances = computed(()=> attendances.value.filter(a=>{
  const monthOk = a.attendance_date.slice(0,7) === chartMonth.value
  const posOk   = chartPosition.value==='' || a.employee.position.position_name === chartPosition.value
  return monthOk && posOk
}))

/* === ⇢ 1. DATA PER-TANGGAL (grafik) ===================================== */
const dailySummary = computed(()=>{
  // hitung jumlah hari dalam bulan terpilih
  const [y,m] = chartMonth.value.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()         // m sudah 1-based di Date ctor
  const template = () => ({ hadir:0, alpha:0, cuti:0, izin:0 })
  const arr = Array.from({ length: days }, (_,i)=> ({ day:i+1, ...template() }))

  filteredAttendances.value.forEach(a=>{
    const d = new Date(a.attendance_date).getDate()   // 1..days
    const rec = arr[d-1]
    if(['hadir','late'].includes(a.status)) rec.hadir++
    else if(['alpha','absent'].includes(a.status))    rec.alpha++
    else if(a.status==='cuti')                        rec.cuti++
    else if(a.status==='izin')                        rec.izin++
  })
  return arr
})

/* === ⇢ 2. TABEL RINGKASAN PER-KARYAWAN (tetap) ========================= */
const summaryPerEmployee = computed(()=>{
  const map={}
  employeesList.value
    .filter(e=> chartPosition.value===''||e.position.position_name===chartPosition.value)
    .forEach(e=> map[e.name]={hadir:0,cuti:0,izin:0,alpha:0})

  filteredAttendances.value.forEach(a=>{
    const rec=map[a.employee.name]; if(!rec) return
    if(['hadir','late'].includes(a.status)) rec.hadir++
    else if(a.status==='cuti') rec.cuti++
    else if(a.status==='izin') rec.izin++
    else rec.alpha++
  })
  return Object.entries(map).map(([name,val])=>({name,...val}))
})

/* === ⇢ 3. GRAFIK ======================================================== */
watch([chartPosition,chartMonth], async ()=>{
  if(chartInstance){ chartInstance.destroy(); chartInstance=null }
  await nextTick(); renderChart()
})

function renderChart(){
  if(!chartRef.value) return
  const ctx = chartRef.value.getContext('2d')

  // label tanggal 1..n
  const labels = dailySummary.value.map(d=>d.day.toString())

  // dataset tiap status
  const ds = status => ({
    label : status.charAt(0).toUpperCase()+status.slice(1),
    data  : dailySummary.value.map(d=>d[status]),
    stack : 'stack',                 // biar bertumpuk
    backgroundColor:{
      hadir:'#10B981', alpha:'#EF4444', cuti:'#F97316', izin:'#F59E0B'
    }[status]
  })

  chartInstance = new Chart(ctx,{
    type:'bar',
    data:{ labels, datasets:[ ds('hadir'), ds('alpha'), ds('cuti'), ds('izin') ] },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'top' } },
      interaction:{ mode:'index', intersect:false },
      scales:{
        x:{ stacked:true },
        y:{ stacked:true, beginAtZero:true, title:{ display:true, text:'Jumlah' } }
      }
    }
  })
}

/* === ⇢ 4. EKSPOR EXCEL (tak berubah) =================================== */
const exportData = computed(()=> attendances.value.filter(a=>{
  const posOk = exportPosition.value==='' || a.employee.position.position_name===exportPosition.value
  const d     = a.attendance_date
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
    if(['hadir','late'].includes(a.status)) rec.Hadir++
    else if(['alpha','absent'].includes(a.status)){ rec.Alpha++; rec.TglAlpha.push(dStr) }
    else if(['cuti','izin'].includes(a.status)){ rec['Ijin/Cuti']++; rec.TglIjinCuti.push(dStr) }
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
.dashboard-wrapper{ overflow-x:hidden; }
canvas{ width:100%!important; height:100%!important; }
</style>
