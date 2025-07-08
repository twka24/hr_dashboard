<template>
  <div class="p-6 md:p-10">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Positions
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

      <!-- Toast Notification -->
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
        <!-- Left -->
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
              <option :value="null">— Semua Jabatan —</option>
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

        <!-- Right -->
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

      <!-- Working Days -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm text-gray-700 dark:text-gray-300">Working Days</label>
          <div class="flex gap-2">
            <button
              @click="editingMode = (editingMode === 'mark' ? '' : 'mark')"
              :class="editingMode === 'mark'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'"
              class="px-3 py-1 rounded-lg transition"
            >
              Tandai Libur Nasional
            </button>
            <button
              @click="editingMode = (editingMode === 'unmark' ? '' : 'unmark')"
              :class="editingMode === 'unmark'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'"
              class="px-3 py-1 rounded-lg transition"
            >
              Hapus Libur Nasional
            </button>
          </div>
        </div>
        <FullCalendar
          :options="workingDaysCalendarOptions"
          @dateClick="onDateClick"
          class="border rounded-lg overflow-hidden"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          @click="saveSchedule"
          :disabled="saving"
          class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Menyimpan…' : 'Simpan Perubahan' }}
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      <transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 flex items-center justify-center z-50"
        >
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
        <div
          v-if="showHolidayModal"
          class="fixed inset-0 flex items-center justify-center z-50"
        >
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-80">
            <h2 class="text-lg font-semibold mb-4">
              {{ holidayModalAction === 'mark'
                ? 'Tambah Libur Nasional'
                : 'Hapus Libur Nasional' }}
            </h2>
            <p class="mb-4">
              Tanggal: <strong>{{ holidayModalDay }}</strong>
            </p>
            <div class="flex justify-end gap-2">
              <button
                @click="cancelHolidayModal"
                class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Batal
              </button>
              <button
                @click="confirmHolidayModal"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id

// state jadwal
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

const positions = ref([])

// edit mode
const editingMode = ref('') // '' | 'mark' | 'unmark'

// toast
const toastShow = ref(false)
const toastMsg   = ref('')
const toastOk    = ref(true)
const saving     = ref(false)
function showToast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value  = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 2500)
}

// delete schedule
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

// modal konfirmasi holiday
const showHolidayModal = ref(false)
const holidayModalDay    = ref(null)
const holidayModalAction = ref('') // 'mark' atau 'unmark'

function onDateClick(arg) {
  const day = arg.date.getDate()
  if (editingMode.value === 'mark' && schedule.working_days.includes(day)) {
    holidayModalDay.value    = day
    holidayModalAction.value = 'mark'
    showHolidayModal.value   = true
  }
  else if (editingMode.value === 'unmark' && !schedule.working_days.includes(day)) {
    holidayModalDay.value    = day
    holidayModalAction.value = 'unmark'
    showHolidayModal.value   = true
  }
}

function confirmHolidayModal() {
  const d = holidayModalDay.value
  if (holidayModalAction.value === 'mark') {
    schedule.working_days = schedule.working_days.filter(x => x !== d)
    showToast(`Tanggal ${d} ditandai sebagai libur nasional`)
  } else {
    schedule.working_days.push(d)
    schedule.working_days.sort((a,b)=>a-b)
    showToast(`Tanggal ${d} dihapus tanda libur nasional`)
  }
  showHolidayModal.value = false
}

function cancelHolidayModal() {
  showHolidayModal.value = false
}

// semua tanggal di bulan
const allDatesInMonth = ref([])
function onMonthChange() {
  if (!schedule.month_year) return
  const [y,m] = schedule.month_year.split('-').map(Number)
  const dim = new Date(y, m, 0).getDate()
  allDatesInMonth.value = Array.from({ length: dim }, (_,i) => i+1)
  workingDaysCalendarOptions.initialDate = `${schedule.month_year}-01`
}
watch(() => schedule.month_year, onMonthChange)

// non-working days compute
const nonWorkingDays = computed(() =>
  allDatesInMonth.value.filter(d => !schedule.working_days.includes(d))
)

// FullCalendar options
const workingDaysCalendarOptions = reactive({
  plugins: [ dayGridPlugin, interactionPlugin ],
  initialView: 'dayGridMonth',
  initialDate: new Date().toISOString().slice(0,10),
  dayCellClassNames(arg) {
    const day = arg.date.getDate()
    return nonWorkingDays.value.includes(day) ? ['fc-non-working'] : []
  },
  dateClick: onDateClick
})

// load data
async function loadPositions() {
  const { data } = await api.get('/positions')
  positions.value = data.data
}
async function loadDetail() {
  const { data: res } = await api.get(`/schedules/${id}`)
  const p = res.data
  schedule.schedule_name = p.schedule_name
  schedule.position_code = p.position_code
  schedule.month_year    = p.month_year
  schedule.start_time    = p.start_time
  schedule.end_time      = p.end_time
  schedule.break_start   = p.break_start
  schedule.break_end     = p.break_end
  schedule.is_active     = p.is_active
  schedule.working_days  = p.working_days
  onMonthChange()
}
onMounted(() => {
  loadPositions()
  loadDetail()
})

// save schedule
async function saveSchedule() {
  if (saving.value) return
  saving.value = true
  try {
    await api.put(`/schedules/${id}`, {
      position_code: schedule.position_code === '' ? null : schedule.position_code,
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
