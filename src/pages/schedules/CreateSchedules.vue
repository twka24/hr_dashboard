<template>
  <div class="p-6 md:p-10">
    <!-- Navigasi / Kembali -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Schedule
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <!-- Judul -->
      <h1 class="text-2xl font-bold">Buat Jadwal Baru</h1>

      <!-- Notifikasi -->
      <transition name="slide-fade">
        <div
          v-if="toastShow"
          class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-2 shadow-lg text-sm text-white"
          :class="toastOk ? 'bg-emerald-600' : 'bg-red-600'"
        >
          {{ toastMsg }}
        </div>
      </transition>

      <!-- Form kiri & kanan -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Kiri -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Nama Jadwal</label>
            <input
              v-model="form.schedule_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>

          <!-- Pemilihan Karyawan lewat modal -->
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Karyawan</label>
            <button
              @click="openEmployeeModal"
              class="mt-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Pilih Karyawan
            </button>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="code in form.employee_codes"
                :key="code"
                class="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-700 text-gray-800 dark:text-gray-100 px-2 py-1 rounded-full"
              >
                {{ getEmployeeLabel(code) }}
                <button @click="removeEmployee(code)" class="text-red-500 hover:text-red-700">&times;</button>
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Bulan &amp; Tahun</label>
            <input
              v-model="form.month_year"
              @input="onMonthChange"
              type="month"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="aktif"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label for="aktif" class="text-sm text-gray-700 dark:text-gray-300">Aktif</label>
          </div>
        </div>

        <!-- Kanan -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Waktu Mulai</label>
            <input
              v-model="form.start_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Waktu Selesai</label>
            <input
              v-model="form.end_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Mulai Istirahat</label>
            <input
              v-model="form.break_start"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Akhir Istirahat</label>
            <input
              v-model="form.break_end"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Tombol Tandai Libur & Kalender -->
      <div class="space-y-2">
        <div class="mb-4 flex items-center">
          <div role="group" class="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            <button
              @click="addingHoliday = !addingHoliday; if (addingHoliday) editingMode = ''"
              :class="addingHoliday
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!addingHoliday" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>{{ addingHoliday ? 'Selesai Tandai' : 'Tandai Libur' }}</span>
            </button>
          </div>
        </div>

        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
          class="border rounded-lg overflow-hidden"
        />
      </div>

      <!-- Aksi -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          @click="createSchedule"
          :disabled="saving"
          class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Menyimpan…' : 'Buat Jadwal' }}
        </button>
      </div>
    </div>

    <!-- Modal Pilih Karyawan -->
<transition name="fade">
  <div v-if="employeeModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- backdrop blur -->
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl mx-4 shadow-lg">
      <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Pilih Karyawan</h2>

      <!-- FILTER BERDASARKAN POSISI -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
  <!-- Filter Jabatan -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Filter Jabatan</label>
          <select
            v-model="positionFilter"
            class="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
          >
            <option value="">— Semua Jabatan —</option>
            <option
              v-for="pos in uniquePositions"
              :key="pos"
              :value="pos"
            >{{ pos }}</option>
          </select>
        </div>

        <!-- Cari Nama -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Cari Nama</label>
          <input
            v-model="nameSearch"
            type="text"
            placeholder="Masukkan nama..."
            class="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
          />
        </div>
      </div>


      <div class="overflow-auto max-h-64">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <!-- SELECT ALL -->
              <th class="p-2">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll($event)"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </th>
              <th class="p-2">Nama</th>
              <th class="p-2">Jabatan</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in filteredEmployees"
              :key="emp.employee_code"
              class="hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td class="p-2">
                <input
                  type="checkbox"
                  :value="emp.employee_code"
                  v-model="tempEmployeeCodes"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </td>
              <td class="p-2">{{ emp.name }}</td>
              <td class="p-2">{{ emp.position.position_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button
          @click="cancelEmployeeModal"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >Batal</button>
        <button
          @click="confirmEmployeeModal"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >Oke</button>
      </div>
    </div>
  </div>
</transition>

    <!-- Modal Tandai/Edit Libur Nasional -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- latar belakang -->
      <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>

      <!-- konten modal -->
      <div class="relative z-50 bg-white dark:bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
        <h2 class="text-lg font-semibold mb-4">
          {{ isEditing ? 'Ubah Libur Nasional' : 'Tandai Libur Nasional' }}
        </h2>
        <p class="mb-2"><strong>Tanggal:</strong> {{ modalDate }}</p>
        <input
          v-model="modalTitle"
          type="text"
          placeholder="Judul libur"
          class="w-full mb-4 rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
        />
        <div class="flex justify-end gap-2">
          <button
            v-if="isEditing"
            @click="deleteHoliday"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Hapus
          </button>
          <button
            @click="saveHoliday"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Simpan
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '@/services/api'

const router = useRouter()

// nilai default Bulan-Tahun
const today     = new Date()
const defaultYm = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`

// data form
const form = reactive({
  employee_codes: [],
  schedule_name: '',
  working_days: [],
  month_year: defaultYm,
  start_time: '',
  end_time: '',
  break_start: '',
  break_end: '',
  is_active: false,
})

// daftar karyawan
const employees = ref([])
// --- filter berdasarkan posisi ---
const positionFilter = ref('')

// daftar posisi unik (string) dari employees
const uniquePositions = computed(() => {
  const set = new Set(employees.value.map(e => e.position.position_name))
  return Array.from(set)
})

// filteredEmployees sekarang berdasarkan posisi & nama
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const matchesPos = !positionFilter.value
      || emp.position.position_name === positionFilter.value
    const matchesName = !nameSearch.value
      || emp.name.toLowerCase().includes(nameSearch.value.trim().toLowerCase())
    return matchesPos && matchesName
  })
})

// Select All logic
const allSelected = computed(() => {
  const list = filteredEmployees.value.map(e => e.employee_code)
  return list.length > 0 && list.every(code => tempEmployeeCodes.value.includes(code))
})

function toggleSelectAll(ev) {
  if (ev.target.checked) {
    // pilih semua di current filter
    tempEmployeeCodes.value = filteredEmployees.value.map(e => e.employee_code)
  } else {
    // kosongkan semua
    tempEmployeeCodes.value = []
  }
}
// modal karyawan
const employeeModalOpen = ref(false)
const tempEmployeeCodes = ref([])
const employeeSearch    = ref('')

const nameSearch = ref('')



// filter berdasarkan pencarian
// const filteredEmployees = computed(() => {
//   const q = employeeSearch.value.trim().toLowerCase()
//   if (!q) return employees.value
//   return employees.value.filter(emp =>
//     emp.name.toLowerCase().includes(q) ||
//     emp.position.position_name.toLowerCase().includes(q)
//   )
// })

// helper tampilan nama karyawan
function getEmployeeLabel(code) {
  const emp = employees.value.find(e => e.employee_code === code)
  return emp ? `${emp.name} (${emp.position.position_name})` : code
}

function openEmployeeModal() {
  tempEmployeeCodes.value = [...form.employee_codes]
  employeeSearch.value    = ''
  employeeModalOpen.value = true
}
function confirmEmployeeModal() {
  form.employee_codes     = [...tempEmployeeCodes.value]
  employeeModalOpen.value = false
}
function cancelEmployeeModal() {
  employeeModalOpen.value = false
}
function removeEmployee(code) {
  const i = form.employee_codes.indexOf(code)
  if (i > -1) form.employee_codes.splice(i, 1)
}

// notifikasi
const toastShow = ref(false)
const toastMsg  = ref('')
const toastOk   = ref(true)
const saving    = ref(false)
function showToast(msg, ok = true) {
  toastMsg.value   = msg
  toastOk.value    = ok
  toastShow.value  = true
  setTimeout(() => (toastShow.value = false), 3000)
}

// libur nasional
const addingHoliday = ref(false)
const modalOpen     = ref(false)
const modalDate     = ref('')
const modalTitle    = ref('Libur Nasional')
const holidayEvents = ref([
  { title: 'Tahun Baru Masehi', date: '2025-01-01' },
  { title: 'Hari Kartini',        date: '2025-04-21' },
  { title: 'Kemerdekaan RI',      date: '2025-08-17' },
])

let allDatesInMonth = []

function onMonthChange() {
  if (!form.month_year) return
  const [year, month] = form.month_year.split('-').map(Number)
  allDatesInMonth = []
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, '0')
    const mm = String(month).padStart(2, '0')
    allDatesInMonth.push(`${year}-${mm}-${dd}`)
  }
  form.working_days = allDatesInMonth.filter(date => {
    const dow   = new Date(date).getDay()
    const isHol = holidayEvents.value.some(e => e.date === date)
    return dow !== 0 && !isHol
  })

  nextTick(() => {
    const cal = calendarRef.value?.getApi()
    if (!cal) return
    const d      = cal.view.currentStart
    const viewYm = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    if (viewYm !== form.month_year) {
      cal.gotoDate(`${form.month_year}-01`)
    }
    cal.rerenderCells()
  })
}

function onDatesSet(arg) {
  const d   = arg.view.currentStart
  const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  if (form.month_year !== iso) {
    form.month_year = iso
    onMonthChange()
  }
}

function handleDateClick(arg) {
  const dateStr = arg.dateStr
  const dow     = arg.date.getDay()
  if (addingHoliday.value) {
    modalDate.value  = dateStr
    const idx = holidayEvents.value.findIndex(e => e.date === dateStr)
    modalTitle.value = idx > -1 ? holidayEvents.value[idx].title : 'Libur Nasional'
    modalOpen.value  = true
  } else {
    if (dow === 0 || holidayEvents.value.some(e => e.date === dateStr)) return
    const i = form.working_days.indexOf(dateStr)
    if (i > -1) form.working_days.splice(i,1)
    else        form.working_days.push(dateStr)
    nextTick(() => calendarRef.value?.getApi().rerenderCells())
  }
}

const editingIndex = computed(() =>
  holidayEvents.value.findIndex(e => e.date === modalDate.value)
)
const isEditing = computed(() => editingIndex.value !== -1)

function saveHoliday() {
  const idx = editingIndex.value
  if (idx > -1) {
    holidayEvents.value[idx].title = modalTitle.value
  } else {
    holidayEvents.value.push({ title: modalTitle.value, date: modalDate.value })
  }
  const wi = form.working_days.indexOf(modalDate.value)
  if (wi > -1) form.working_days.splice(wi,1)
  closeModal()
}

function deleteHoliday() {
  const idx = editingIndex.value
  if (idx > -1) {
    const removed = holidayEvents.value.splice(idx,1)[0]
    if (allDatesInMonth.includes(removed.date)) {
      const wd = new Date(removed.date).getDay()
      if (wd !== 0 && !form.working_days.includes(removed.date)) {
        form.working_days.push(removed.date)
      }
    }
  }
  closeModal()
}

function closeModal() {
  modalOpen.value = false
  modalDate.value = ''
  modalTitle.value = ''
}

const calendarRef = ref(null)
const calendarOptions = reactive({
  plugins: [ dayGridPlugin, interactionPlugin ],
  initialView: 'dayGridMonth',
  events: holidayEvents.value,
  dateClick: handleDateClick,
  eventColor: 'red',
  datesSet: onDatesSet,
  height: 450,
  dayMaxEvents: true,
  dayCellClassNames(arg) {
    const d    = arg.date
    const yyyy = d.getFullYear()
    const mm   = String(d.getMonth()+1).padStart(2,'0')
    const dd   = String(d.getDate()).padStart(2,'0')
    const ds   = `${yyyy}-${mm}-${dd}`
    const isHol = holidayEvents.value.some(e => e.date === ds)
    return isHol ? [''] : []
  }
})

watch(holidayEvents, nv => calendarOptions.events = nv)
watch(form.working_days, () => nextTick(() => calendarRef.value?.getApi().rerenderCells()))

// ambil daftar karyawan
async function loadEmployees() {
  try {
    const { data: res } = await api.get('/schedules/available-employees')
    employees.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// kirim data jadwal
async function createSchedule() {
  if (saving.value) return
  if (form.end_time <= form.start_time) {
    showToast('Waktu selesai harus setelah waktu mulai.', false)
    return
  }
  saving.value = true
  try {
    const days = form.working_days.map(d => parseInt(d.split('-')[2],10))
    const payload = {
      employee_codes: form.employee_codes,
      schedule_name:  form.schedule_name,
      start_time:     form.start_time,
      end_time:       form.end_time,
      break_start:    form.break_start,
      break_end:      form.break_end,
      is_active:      form.is_active,
      working_days:   days,
      month_year:     form.month_year,
    }
    const { status } = await api.post('/schedules', payload)
    if (status === 201) {
      showToast('Jadwal berhasil dibuat', true)
      router.push({ name: 'Schedules' })
    } else {
      showToast(`Status tidak terduga: ${status}`, false)
    }
  } catch (err) {
    console.error(err)
    const errs = err.response?.data?.errors
    if (errs) showToast(Object.values(errs).flat().join('\n'), false)
    else     showToast('Gagal membuat jadwal', false)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadEmployees()
  onMonthChange()
})
</script>

<style scoped>
/* sorot tanggal yang bukan hari kerja */
::v-deep .fc-non-working {
  background-color: rgba(220, 38, 38, 0.2) !important;
}
</style>
