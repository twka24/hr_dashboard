<template>
  <div class="p-4 sm:p-6 lg:p-10">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Schedules
      </button>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 sm:p-6 space-y-6 relative"
    >
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
      >
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Bulk Assignments
        </h1>
      </div>

      <!-- Toast Notification -->
      <transition name="slide-fade">
        <div
          v-if="toast.show"
          class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-2 shadow-lg text-sm text-white w-[calc(100%-2rem)] sm:w-auto"
          :class="toast.ok ? 'bg-emerald-600' : 'bg-red-600'"
        >
          {{ toast.message }}
        </div>
      </transition>

      <!-- Form: pilih schedule, periode, karyawan dynamic -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- Pilih Schedule -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Pilih Schedule
          </label>
          <select
            v-model="bulk.schedule_id"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
          >
            <option value="" disabled>— Pilih Jadwal —</option>
            <option v-for="sch in schedules" :key="sch.id" :value="sch.id">
              {{ sch.schedule_name }}
            </option>
          </select>
        </div>

        <!-- Periode (auto) -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Periode
          </label>
          <input
            type="text"
            :value="selectedSchedule?.month_year || '—'"
            disabled
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          />
        </div>

        <!-- Karyawan (dari response selectedSchedule.employees) -->
        <div v-if="selectedSchedule">
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Karyawan
          </label>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="emp in selectedSchedule.employees"
              :key="emp.employee_code"
              class="bg-blue-100 dark:bg-blue-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {{ emp.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Detail Schedule -->
      <div
        v-if="selectedSchedule"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 space-y-4"
      >
        <h2 class="font-medium text-gray-800 dark:text-gray-100 mb-2">
          Detail Jadwal
        </h2>
        <ul class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>Nama:</strong> {{ selectedSchedule.schedule_name }}</li>
          <li>
            <strong>Waktu:</strong> {{ selectedSchedule.start_time }} –
            {{ selectedSchedule.end_time }}
          </li>
          <li>
            <strong>Istirahat:</strong> {{ selectedSchedule.break_start }} –
            {{ selectedSchedule.break_end }}
          </li>
          <li>
            <strong>Status: </strong>
            <span
              :class="
                selectedSchedule.is_active ? 'text-green-600' : 'text-red-600'
              "
            >
              {{ selectedSchedule.is_active ? 'Aktif' : 'Tidak Aktif' }}
            </span>
          </li>
        </ul>
        <h1 class="font-medium text-gray-800 dark:text-gray-100">
          Hari Kerja
        </h1>
        <!-- Kalender Hari Kerja -->
        <div class="overflow-x-auto">
          <FullCalendar
            :key="calendarKey"
            ref="calendarRef"
            :options="calendarOptions"
            class="mt-4 border rounded-lg overflow-hidden min-w-[300px]"
          />
        </div>
      </div>

      <!-- Button Bulk Assign -->
      <div class="flex flex-col sm:flex-row justify-end gap-2">
        <button
          @click="bulkAssign"
          :disabled="loading || !bulk.schedule_id"
          class="w-full sm:w-auto px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"
            />
          </svg>
          <span>{{ loading ? 'Memuat...' : 'Bulk Assignments' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import api from '@/services/api'

const router = useRouter()

// form state
const schedules = ref([])
const bulk      = reactive({ schedule_id: '' })
const loading   = ref(false)
const toast     = reactive({ show: false, message: '', ok: true })

// calendar state
const calendarRef     = ref(null)
const calendarKey     = ref(0)
const allDatesInMonth = ref([])
const calendarEvents  = ref([])

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  initialDate: '',
  height: 'auto',
  events: calendarEvents,
  eventDisplay: 'block'
})

// selected schedule detail (harus include `.employees`)
const selectedSchedule = computed(() =>
  schedules.value.find(s => s.id === bulk.schedule_id)
)

// build calendar events saat jadwal berubah
watch(selectedSchedule, sch => {
  if (!sch?.month_year) {
    calendarEvents.value = []
    return
  }

  // tanggal di bulan terpilih
  const [year, month] = sch.month_year.split('-').map(Number)
  const dim = new Date(year, month, 0).getDate()
  allDatesInMonth.value = Array.from({ length: dim }, (_, i) => i + 1)

  calendarOptions.initialDate = `${sch.month_year}-01`

  // event “Libur” utk non-working
  const evs = []
  for (let day of allDatesInMonth.value) {
    if (!sch.working_days.includes(day)) {
      const dd = String(day).padStart(2, '0')
      const mm = String(month).padStart(2, '0')
      evs.push({
        title: 'Libur',
        start: `${year}-${mm}-${dd}`,
        allDay: true,
        color: 'red'
      })
    }
  }
  calendarEvents.value = evs
  calendarKey.value++
})

// fetch all schedules (dengan employees di setiap item)
async function loadSchedules() {
  try {
    const { data: res } = await api.get('/schedules')
    schedules.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// bulk assign hanya kirim schedule_id
async function bulkAssign() {
  if (!selectedSchedule.value) return
  loading.value = true
  try {
    await api.post('/schedule-assignments/bulk-assign', {
      schedule_id: bulk.schedule_id
    })
    showToast('Bulk assignments berhasil', true)
    setTimeout(() => router.back(), 1000)
  } catch (e) {
    showToast(
      `Gagal bulk assign: ${e.response?.data?.message || e.message}`,
      false
    )
  } finally {
    loading.value = false
  }
}

// helper toast
function showToast(msg, ok = true) {
  toast.message = msg
  toast.ok = ok
  toast.show = true
  setTimeout(() => (toast.show = false), 3000)
}

// init
onMounted(loadSchedules)
</script>

<style scoped>
/* Animasi toast */
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-enter-from   { transform: translateY(-8px); opacity: 0; }

/* FullCalendar mobile-friendly */
:deep(.fc) { font-size: 0.75rem; }
</style>
