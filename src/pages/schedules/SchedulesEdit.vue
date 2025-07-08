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
          {{ deleting ? 'Menghapus…' : 'Hapus Schedules' }}
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
        <!-- Left fields… -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Schedule Name</label>
            <input
              v-model="schedule.schedule_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Position</label>
            <select
              v-model="schedule.position_code"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            >
              <option value="" disabled>— Pilih Jabatan —</option>
              <option :value="null">Semua Jabatan</option>
              <option
                v-for="pos in positions"
                :key="pos.position_code"
                :value="pos.position_code"
              >
                {{ pos.position_name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Month &amp; Year</label>
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
            <label for="active" class="text-sm text-gray-700 dark:text-gray-300">Active</label>
          </div>
        </div>

        <!-- Right fields… -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Start Time</label>
            <input
              v-model="schedule.start_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">End Time</label>
            <input
              v-model="schedule.end_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Break Start</label>
            <input
              v-model="schedule.break_start"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Break End</label>
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
    <!-- Segmen: Tandai Libur Nasional -->
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

    <!-- Segmen: Hapus Libur Nasional -->
    <button
      @click="editingMode = (editingMode==='unmark'? '' : 'unmark'); if (editingMode==='unmark') addingHoliday=false"
      :class="editingMode==='unmark'
        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
        : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path v-if="editingMode!=='unmark'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>{{ editingMode==='unmark' ? 'Batal Hapus' : 'Hapus Libur' }}</span>
    </button>
  </div>
</div>

        <!-- pakai :key untuk memaksa re-render -->
        <FullCalendar
          :key="calendarKey"
          ref="calendarRef"
          :options="calendarOptions"
          class="border rounded-lg overflow-hidden"
        />
      </div>

      <!-- Actions -->
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

      <!-- Holiday Confirmation Modal -->
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

      <!-- Mark/Unmark Modal -->
      <transition name="fade">
  <div
    v-if="showHolidayModal"
    class="fixed inset-0 flex items-center justify-center z-50"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-80">
      <!-- Header -->
      <h2 class="text-lg font-semibold mb-2">
        {{ holidayModalAction === 'mark'
          ? 'Tambah Libur Nasional'
          : 'Hapus Libur Nasional' }}
      </h2>

      <!-- Pesan & Tanggal -->
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

      <!-- Tombol aksi -->
      <div class="flex flex-col sm:flex-row justify-end gap-3">
        <!-- Sekunder (Batal) -->
        <button
          @click="cancelHolidayModal"
          class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
        >
          Batal
        </button>

        <!-- Primer (Tambah / Hapus) -->
        <button
          @click="confirmHolidayModal"
          class="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              v-if="holidayModalAction === 'mark'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
          <span>
            {{ holidayModalAction === 'mark' ? 'Tambah' : 'Hapus' }}
          </span>
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
const id = route.params.id

// ref untuk FullCalendar + key untuk paksa re-render
const calendarRef = ref(null)
const calendarKey = ref(0)

// ---------- Editing Mode Logic ----------
const editingMode        = ref('')        // '' | 'mark' | 'unmark'
const showHolidayModal   = ref(false)
const holidayModalDay    = ref(null)
const holidayModalAction = ref('')        // 'mark' | 'unmark'

// ---------- Schedule CRUD ----------
const schedule = reactive({
  position_code: '',
  schedule_name: '',
  working_days: [],
  month_year: '',
  start_time: '',
  end_time: '',
  break_start: '',
  break_end: '',
  is_active: false,
})
const positions   = ref([])
const toastShow   = ref(false)
const toastMsg    = ref('')
const toastOk     = ref(true)
const saving      = ref(false)
function showToast(msg, ok = true) {
  toastMsg.value    = msg
  toastOk.value     = ok
  toastShow.value   = true
  setTimeout(() => (toastShow.value = false), 2500)
}

async function loadPositions() {
  const { data } = await api.get('/positions')
  positions.value = data.data
}

async function loadDetail() {
  const { data: res } = await api.get(`/schedules/${id}`)
  const p = res.data
  Object.assign(schedule, {
    position_code: p.position_code,
    schedule_name: p.schedule_name,
    working_days:  p.working_days,
    month_year:    p.month_year,
    start_time:    p.start_time,
    end_time:      p.end_time,
    break_start:   p.break_start,
    break_end:     p.break_end,
    is_active:     p.is_active,
  })
  onMonthChange()
  // paksa FullCalendar re-render setelah GET
  calendarKey.value++
}

async function saveSchedule() {
  if (saving.value) return
  saving.value = true
  try {
    await api.put(`/schedules/${id}`, {
      position_code: schedule.position_code || null,
      schedule_name: schedule.schedule_name,
      working_days:  schedule.working_days,
      month_year:    schedule.month_year,
      start_time:    schedule.start_time,
      end_time:      schedule.end_time,
      break_start:   schedule.break_start,
      break_end:     schedule.break_end,
      is_active:     schedule.is_active,
    })
    showToast('Jadwal berhasil disimpan')
    router.back()
  } catch {
    showToast('Gagal menyimpan jadwal', false)
  } finally {
    saving.value = false
  }
}

const deleting = ref(false)
const showDeleteModal = ref(false)
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
    deleting.value = false
    showDeleteModal.value = false
  }
}

// ---------- Month logic ----------
const allDatesInMonth = ref([])
function onMonthChange() {
  if (!schedule.month_year) return
  const [y,m] = schedule.month_year.split('-').map(Number)
  const dim   = new Date(y, m, 0).getDate()
  allDatesInMonth.value = Array.from({ length: dim }, (_,i) => i+1)
  calendarOptions.initialDate = `${schedule.month_year}-01`
}
watch(() => schedule.month_year, onMonthChange)

// compute non-working days
const nonWorkingDays = computed(() =>
  allDatesInMonth.value.filter(d => !schedule.working_days.includes(d))
)

// ---------- Holiday data & manual-add logic ----------
const addingHoliday    = ref(false)
const modalOpen        = ref(false)
const modalDate        = ref('')
const modalTitle       = ref('Libur Nasional')
const holidayEvents    = ref([
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
  // paksa re-render setelah unmark
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

// ---------- FullCalendar config ----------
const calendarOptions = reactive({
  plugins: [ dayGridPlugin, interactionPlugin ],
  initialView: 'dayGridMonth',
  height: 500,
  events: holidayEvents.value,
  dateClick(arg) {
    if (editingMode.value === 'mark' || editingMode.value === 'unmark') {
      markUnmarkDateClick(arg)
    } else {
      addHolidayDateClick(arg)
    }
  },
  dayCellClassNames(arg) {
    const d = arg.date.getDate()
    return nonWorkingDays.value.includes(d) ? ['fc-non-working'] : []
  }
})
watch(holidayEvents, v => calendarOptions.events = v)

// ---------- Init ----------
onMounted(() => {
  loadPositions()
  loadDetail()
})
</script>

<style scoped>
.slide-fade-enter-active { transition: all .3s }
.slide-fade-enter-from { transform: translateY(-10px); opacity: 0 }
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }

/* highlight tanggal NON-working */
::v-deep .fc-non-working {
  background-color: rgba(220, 38, 38, 0.2) !important;
}
</style>
