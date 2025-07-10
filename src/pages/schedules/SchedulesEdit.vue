<template>
  <div class="p-6 md:p-10">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Schedules
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6 relative">
      <!-- Header + Delete -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Edit Schedule – {{ schedule.schedule_name }}</h1>
        <button
          @click="confirmDelete"
          :disabled="deleting"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
        >
          {{ deleting ? 'Menghapus…' : 'Hapus Schedule' }}
        </button>
      </div>

      <!-- Toast -->
      <transition name="slide-fade">
        <div
          v-if="toastShow"
          class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-2 shadow-lg text-sm text-white"
          :class="toastOk ? 'bg-emerald-600' : 'bg-red-600'"
        >
          {{ toastMsg }}
        </div>
      </transition>

      <!-- Form -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Kiri -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Nama Schedule</label>
            <input
              v-model="schedule.schedule_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>

          <!-- Pilih Karyawan -->
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
                v-for="code in schedule.employee_codes"
                :key="code"
                class="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-700 text-gray-800 dark:text-gray-100 px-2 py-1 rounded-full"
              >
                {{ getEmployeeLabel(code) }}
                <button @click="removeEmployee(code)" class="text-red-500 hover:text-red-700">&times;</button>
              </span>
            </div>
          </div>
          <!-- / Pilih Karyawan -->

          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Bulan &amp; Tahun</label>
            <input
              v-model="schedule.month_year"
              @change="onMonthChange"
              type="month"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="schedule.is_active"
              type="checkbox"
              id="active"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label for="active" class="text-sm text-gray-700 dark:text-gray-300">Aktif</label>
          </div>
        </div>

        <!-- Kanan -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Mulai</label>
            <input
              v-model="schedule.start_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Selesai</label>
            <input
              v-model="schedule.end_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Mulai Istirahat</label>
            <input
              v-model="schedule.break_start"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Selesai Istirahat</label>
            <input
              v-model="schedule.break_end"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Tandai Libur Nasional Toggle + Kalender -->
      <div class="space-y-2">
        <div class="mb-4 flex items-center">
          <div role="group" class="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            <!-- Tandai Libur -->
            <button
              @click="addingHoliday = !addingHoliday; if (addingHoliday) editingMode = ''"
              :class="addingHoliday
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="!addingHoliday" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>{{ addingHoliday ? 'Selesai Tandai' : 'Tandai Libur' }}</span>
            </button>
            <!-- Hapus Libur -->
            <button
              @click="editingMode = (editingMode==='unmark'? '' : 'unmark'); if (editingMode==='unmark') addingHoliday=false"
              :class="editingMode==='unmark'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="editingMode!=='unmark'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span>{{ editingMode==='unmark' ? 'Batal Hapus' : 'Hapus Libur' }}</span>
            </button>
          </div>
        </div>

        <FullCalendar
          :key="calendarKey"
          ref="calendarRef"
          :options="calendarOptions"
          class="border rounded-lg overflow-hidden"
        />
      </div>

      <!-- Simpan -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          @click="saveSchedule"
          :disabled="saving"
          class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Menyimpan…' : 'Simpan Perubahan' }}
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      <transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-80">
            <h2 class="text-lg font-semibold mb-4">Konfirmasi Hapus</h2>
            <p class="mb-6">Anda yakin ingin menghapus jadwal ini?</p>
            <div class="flex justify-end gap-3">
              <button
                @click="showDeleteModal = false"
                class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Batal
              </button>
              <button
                @click="deleteSchedule"
                :disabled="deleting"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {{ deleting ? 'Menghapus…' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Modal Pilih Karyawan -->
        <teleport to="body">
      <transition name="fade">
        <div v-if="employeeModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl mx-4 shadow-lg">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Pilih Karyawan</h2>

            <!-- FILTER BERDASARKAN POSISI & PENCARIAN NAMA -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
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
              <div>
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Cari Nama</label>
                <input
                  v-model="nameSearch"
                  type="text"
                  placeholder="Masukkan nama karyawan..."
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
                    <td class="p-2">{{ emp.position?.position_name || '-' }}</td>
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
      </teleport>

      <!-- Modal Tambah/Edit Libur Nasional -->
      <transition name="fade">
        <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
            <h2 class="text-lg font-semibold mb-4">
              {{ isEditingHoliday ? 'Edit Libur Nasional' : 'Tambah Libur Nasional' }}
            </h2>
            <p class="mb-2"><strong>Tanggal:</strong> {{ modalDate }}</p>
            <input
              v-model="modalTitle"
              type="text"
              placeholder="Judul libur"
              class="w-full mb-4 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
            <div class="flex justify-end gap-2">
              <button
                v-if="isEditingHoliday"
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
                @click="closeHolidayModal"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Modal Mark/Unmark Libur Nasional -->
      <transition name="fade">
        <div v-if="showHolidayModal" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-80">
            <h2 class="text-lg font-semibold mb-2">
              {{ holidayModalAction === 'mark'
                ? 'Tambah Libur Nasional'
                : 'Hapus Libur Nasional' }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {{ holidayModalAction === 'mark'
                ? 'Pastikan ingin menandai tanggal berikut sebagai libur nasional:'
                : 'Anda akan mengembalikan hari kerja untuk tanggal:' }}
            </p>
            <div class="mb-6">
              <span
                class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full font-medium"
              >
                {{ holidayModalDay }}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <button
                @click="cancelHolidayModal"
                class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                @click="confirmHolidayModal"
                class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                {{ holidayModalAction === 'mark' ? 'Tambah' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const id    = route.params.id

// FullCalendar refs
const calendarRef = ref(null)
const calendarKey = ref(0)

// Editing Mode
const editingMode        = ref('')
const showHolidayModal   = ref(false)
const holidayModalDay    = ref(null)
const holidayModalAction = ref('')

// State schedule
const schedule = reactive({
  employee_codes: [],
  schedule_name:  '',
  working_days:   [],
  month_year:     '',
  start_time:     '',
  end_time:       '',
  break_start:    '',
  break_end:      '',
  is_active:      false,
})

// Toast & loading
const toastShow = ref(false)
const toastMsg  = ref('')
const toastOk   = ref(true)
const saving    = ref(false)
const deleting  = ref(false)
const showDeleteModal = ref(false)

function showToast(msg, ok = true) {
  toastMsg.value  = msg
  toastOk.value   = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 2500)
}

// Employees modal
const employees = ref([])
const employeeModalOpen = ref(false)
const tempEmployeeCodes = ref([])

// untuk filter berdasarkan jabatan
const positionFilter = ref('')

// untuk pencarian nama
const nameSearch = ref('')

// daftar nama jabatan unik (skip yang kosong)
const uniquePositions = computed(() => {
  return Array.from(
    new Set(
      employees.value
        .map(e => e.position?.position_name)
        .filter(name => !!name)
    )
  )
})

// filteredEmployees: filter posisi + nama
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const posName = emp.position?.position_name || ''
    const byPos  = !positionFilter.value || posName === positionFilter.value
    const byName = !nameSearch.value
      || emp.name.toLowerCase().includes(nameSearch.value.trim().toLowerCase())
    return byPos && byName
  })
})

// Select All logic
const allSelected = computed(() => {
  const list = filteredEmployees.value.map(e => e.employee_code)
  return list.length > 0
    && list.every(code => tempEmployeeCodes.value.includes(code))
})
function toggleSelectAll(ev) {
  if (ev.target.checked) {
    tempEmployeeCodes.value = filteredEmployees.value.map(e => e.employee_code)
  } else {
    tempEmployeeCodes.value = []
  }
}

// helper tampilan nama karyawan
function getEmployeeLabel(code) {
  const e = employees.value.find(x => x.employee_code === code)
  return e ? e.name + (e.position?.position_name ? ` (${e.position.position_name})` : '') : code
}

function openEmployeeModal() {
  tempEmployeeCodes.value = [...schedule.employee_codes]
  positionFilter.value = ''
  nameSearch.value = ''
  employeeModalOpen.value = true
}
function confirmEmployeeModal() {
  schedule.employee_codes = [...tempEmployeeCodes.value]
  employeeModalOpen.value = false
}
function cancelEmployeeModal() {
  employeeModalOpen.value = false
}
function removeEmployee(code) {
  const i = schedule.employee_codes.indexOf(code)
  if (i > -1) schedule.employee_codes.splice(i,1)
}

// Holiday & calendar logic
const addingHoliday = ref(false)
const modalOpen     = ref(false)
const modalDate     = ref('')
const modalTitle    = ref('Libur Nasional')
const holidayEvents = ref([
  { title: 'Tahun Baru Masehi', date: '2025-01-01' },
  { title: 'Hari Kartini',       date: '2025-04-21' },
  { title: 'Kemerdekaan RI',     date: '2025-08-17' },
])
const isEditingHoliday = computed(() =>
  holidayEvents.value.some(e => e.date === modalDate.value)
)

function markUnmarkDateClick(arg) {
  const day = arg.date.getDate()
  if (editingMode.value === 'unmark' && !schedule.working_days.includes(day)) {
    holidayModalDay.value    = day
    holidayModalAction.value = 'unmark'
    showHolidayModal.value   = true
  }
}
function addHolidayDateClick(arg) {
  if (!addingHoliday.value) return
  modalDate.value  = arg.dateStr
  const ex         = holidayEvents.value.find(e => e.date === arg.dateStr)
  modalTitle.value = ex ? ex.title : 'Libur Nasional'
  modalOpen.value  = true
}
function confirmHolidayModal() {
  const d = holidayModalDay.value
  if (holidayModalAction.value === 'mark') {
    schedule.working_days = schedule.working_days.filter(x => x !== d)
    showToast(`Tanggal ${d} ditandai sebagai libur nasional`, true)
  } else {
    if (!schedule.working_days.includes(d)) {
      schedule.working_days.push(d)
      schedule.working_days.sort((a,b)=>a-b)
    }
    showToast(`Tanggal ${d} dikembalikan ke working days`, true)
  }
  showHolidayModal.value = false
  calendarKey.value++
}
function cancelHolidayModal() { showHolidayModal.value = false }

function saveHoliday() {
  const date = modalDate.value
  const day  = parseInt(date.slice(-2),10)
  const idx  = holidayEvents.value.findIndex(e => e.date === date)
  if (idx > -1) holidayEvents.value[idx].title = modalTitle.value
  else {
    holidayEvents.value.push({ title: modalTitle.value, date })
    schedule.working_days = schedule.working_days.filter(d => d !== day)
  }
  closeHolidayModal()
}
function deleteHoliday() {
  const date = modalDate.value
  const day  = parseInt(date.slice(-2),10)
  const idx  = holidayEvents.value.findIndex(e => e.date === date)
  if (idx > -1) {
    holidayEvents.value.splice(idx,1)
    if (!schedule.working_days.includes(day)) {
      schedule.working_days.push(day)
      schedule.working_days.sort((a,b)=>a-b)
    }
  }
  closeHolidayModal()
}
function closeHolidayModal() { modalOpen.value = false }

// Build events list
const allDatesInMonth = ref([])
function onMonthChange() {
  if (!schedule.month_year) return
  const [y,m] = schedule.month_year.split('-').map(Number)
  const dim   = new Date(y,m,0).getDate()
  allDatesInMonth.value = Array.from({ length:dim },(_,i)=>i+1)
  calendarOptions.initialDate = `${schedule.month_year}-01`
}
watch(() => schedule.month_year, onMonthChange)

const calendarEvents = ref([])
function rebuildEvents() {
  const evs = []

  // 1) Semua libur nasional
  for (const h of holidayEvents.value) {
    evs.push({
      title:  h.title,
      start:  h.date,
      allDay: true,
      color:  'red'
    })
  }

  // 2) Semua tanggal non-working hasil toggle (angka → YYYY-MM-DD),
  //    tapi SKIP kalau sudah libur nasional
  for (const d of allDatesInMonth.value) {
    if (!schedule.working_days.includes(d)) {
      const [y, m] = schedule.month_year.split('-')
      const dd      = String(d).padStart(2, '0')
      const dateStr = `${y}-${m}-${dd}`

      // kalau ini adalah libur nasional, lewati
      if (holidayEvents.value.some(h => h.date === dateStr)) continue

      evs.push({
        title:  'Libur',
        start:  dateStr,
        allDay: true,
        color:  'red'
      })
    }
  }

  calendarEvents.value = evs
}
watch(holidayEvents, rebuildEvents, { deep:true })
watch(() => schedule.working_days, rebuildEvents, { deep:true })
watch(allDatesInMonth, rebuildEvents)

const calendarOptions = reactive({
  plugins:    [ dayGridPlugin, interactionPlugin ],
  initialView:'dayGridMonth',
  height:     500,
  events:     calendarEvents,
  dateClick(arg) {
    if (editingMode.value==='mark' || editingMode.value==='unmark') {
      markUnmarkDateClick(arg)
    } else {
      addHolidayDateClick(arg)
    }
  }
})
watch(holidayEvents, v=>calendarOptions.events=calendarEvents)
watch(() => schedule.working_days, v=>calendarOptions.events=calendarEvents)

// Load employees & detail, then init
async function loadEmployees() {
  try {
    const { data: res } = await api.get('/schedules/available-employees')
    employees.value = res.data
  } catch (e) {
    console.error(e)
  }
}
async function loadDetail() {
  const { data: res } = await api.get(`/schedules/${id}`)
  const p = res.data
  schedule.employee_codes = p.schedule.employee_codes
  schedule.schedule_name  = p.schedule.schedule_name
  schedule.working_days   = p.schedule.working_days
  schedule.month_year     = p.schedule.month_year
  schedule.start_time     = p.schedule.start_time
  schedule.end_time       = p.schedule.end_time
  schedule.break_start    = p.schedule.break_start
  schedule.break_end      = p.schedule.break_end
  schedule.is_active      = p.schedule.is_active

  onMonthChange()
  calendarKey.value++
}

async function saveSchedule() {
  if (saving.value) return
  saving.value = true
  try {
    await api.put(`/schedules/${id}`, {
      employee_codes: schedule.employee_codes,
      schedule_name:  schedule.schedule_name,
      working_days:   schedule.working_days,
      month_year:     schedule.month_year,
      start_time:     schedule.start_time,
      end_time:       schedule.end_time,
      break_start:    schedule.break_start,
      break_end:      schedule.break_end,
      is_active:      schedule.is_active,
    })
    showToast('Jadwal berhasil disimpan')
    router.back()
  } catch {
    showToast('Gagal menyimpan jadwal', false)
  } finally {
    saving.value = false
  }
}

function confirmDelete() { showDeleteModal.value = true }
async function deleteSchedule() {
  if (deleting.value) return
  deleting.value = true
  try {
    await api.delete(`/schedules/${id}`)
    showToast('Jadwal berhasil dihapus')
    router.back()
  } catch {
    showToast('Gagal menghapus jadwal', false)
  } finally {
    deleting.value        = false
    showDeleteModal.value = false
  }
}

onMounted(async () => {
  await loadEmployees()
  await loadDetail()
})
</script>

<style scoped>
.slide-fade-enter-active { transition: all .3s }
.slide-fade-enter-from   { transform: translateY(-10px); opacity: 0 }
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to      { opacity: 0 }

/* highlight tanggal NON-working */
::v-deep .fc-non-working {
  background-color: rgba(220, 38, 38, 0.2) !important;
}
</style>
