<template>
  <div class="p-6 md:p-10">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali Bulk Assignments
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6 relative">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Bulk Assignments
        </h1>
      </div>

      <!-- Toast Notification -->
      <transition name="slide-fade">
        <div
          v-if="toast.show"
          class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-2 shadow-lg text-sm text-white"
          :class="toast.ok ? 'bg-emerald-600' : 'bg-red-600'"
        >
          {{ toast.message }}
        </div>
      </transition>

      <!-- Form: pilih schedule, periode, posisi dynamic -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Pilih Schedule -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Pilih Schedule
          </label>
          <select
            v-model="bulk.schedule_id"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
          >
            <option value="" disabled>— Pilih Jadwal —</option>
            <option
              v-for="sch in schedules"
              :key="sch.id"
              :value="sch.id"
            >
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

        <!-- Posisi (dynamic fields with remove) -->
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Posisi
          </label>
          <div v-for="(code, idx) in bulk.position_codes" :key="idx" class="flex items-center mb-2">
            <select
              v-model="bulk.position_codes[idx]"
              :disabled="loading"
              class="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            >
              <option value="">Semua Jabatan</option>
              <option
                v-for="pos in positions"
                :key="pos.position_code"
                :value="pos.position_code"
              >
                {{ pos.position_name }}
              </option>
            </select>
            <button
              @click.prevent="removePosition(idx)"
              type="button"
              :disabled="loading"
              class="ml-2 text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
          <button
            @click.prevent="addPosition"
            type="button"
            :disabled="loading"
            class="mt-1 text-sm text-blue-600 hover:underline"
          >
            + Tambah Posisi
          </button>
        </div>
      </div>

      <!-- Detail Schedule -->
      <div
        v-if="selectedSchedule"
        class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 space-y-4"
      >
        <h2 class="font-medium text-gray-800 dark:text-gray-100 mb-2">Detail Jadwal</h2>
        <ul class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>ID:</strong> {{ selectedSchedule.id }}</li>
          <li><strong>Nama:</strong> {{ selectedSchedule.schedule_name }}</li>
          <li><strong>Waktu:</strong> {{ selectedSchedule.start_time }} – {{ selectedSchedule.end_time }}</li>
          <li><strong>Istirahat:</strong> {{ selectedSchedule.break_start }} – {{ selectedSchedule.break_end }}</li>
          <li><strong>Hari Kerja:</strong> {{ selectedSchedule.working_days.join(', ') }}</li>
          <li><strong>Status:</strong> <span :class="selectedSchedule.is_active ? 'text-green-600' : 'text-red-600'">{{ selectedSchedule.is_active ? 'Aktif' : 'Tidak Aktif' }}</span></li>
        </ul>

        <!-- Kalender Hari Kerja -->
        <div>
          <FullCalendar
            :key="calendarKey"
            ref="calendarRef"
            :options="calendarOptions"
            class="mt-4 border rounded-lg overflow-hidden"
          />
        </div>
      </div>

      <!-- Button Bulk Assign -->
      <div class="flex justify-end">
        <button
          @click="bulkAssign"
          :disabled="loading || !bulk.schedule_id"
          class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z" />
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

// router instance
const router = useRouter()

// state
const schedules = ref([])
const positions = ref([])
const bulk = reactive({ schedule_id: '', position_codes: [''] })
const toast = reactive({ show: false, message: '', ok: true })
const loading = ref(false)

// Calendar refs & state
const calendarRef = ref(null)
const calendarKey = ref(0)
const allDatesInMonth = ref([])

// Compute selected schedule
const selectedSchedule = computed(() => schedules.value.find(s => s.id === bulk.schedule_id))

// Reset posisi otomatis saat jadwal dipilih
watch(selectedSchedule, sch => {
  if (sch && sch.position?.position_code) {
    bulk.position_codes = [sch.position.position_code]
  } else {
    bulk.position_codes = ['']
  }
})

// Compute non-working days
const nonWorkingDays = computed(() => {
  if (!selectedSchedule.value?.working_days || !allDatesInMonth.value.length) return []
  return allDatesInMonth.value.filter(d => !selectedSchedule.value.working_days.includes(d))
})

// Calendar options
const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  initialDate: '',
  height: 500,
  dayCellClassNames(arg) {
    return nonWorkingDays.value.includes(arg.date.getDate()) ? ['fc-non-working'] : []
  }
})

// Watch selectedSchedule to set dates and calendar date
watch(selectedSchedule, sch => {
  if (sch && sch.month_year) {
    const [y,m] = sch.month_year.split('-').map(Number)
    const dim = new Date(y, m, 0).getDate()
    allDatesInMonth.value = Array.from({ length: dim }, (_, i) => i + 1)
    calendarOptions.initialDate = `${sch.month_year}-01`
    calendarKey.value++
  }
})

// Load data
async function loadSchedules() {
  const { data: res } = await api.get('/schedules')
  schedules.value = res.data
}
async function loadPositions() {
  const { data: res } = await api.get('/positions')
  positions.value = res.data
}

// Helpers
function showToast(msg, ok = true) {
  toast.message = msg; toast.ok = ok; toast.show = true
  setTimeout(() => (toast.show = false), 3000)
}
function addPosition() { bulk.position_codes.push('') }
function removePosition(i) { bulk.position_codes.length > 1 ? bulk.position_codes.splice(i,1) : bulk.position_codes = [''] }

// Bulk assign
async function bulkAssign() {
  if (!selectedSchedule.value) return
  loading.value = true
  try {
    // jika hanya satu kode dan kosong, kirim null
    let payloadPositions = bulk.position_codes.length === 1 && !bulk.position_codes[0]
      ? null
      : bulk.position_codes
    const payload = {
      schedule_id: bulk.schedule_id,
      month_year: selectedSchedule.value.month_year,
      position_code: payloadPositions
    }
    await api.post('/schedule-assignments/bulk-assign', payload)
    showToast('Bulk assignments berhasil', true)
    setTimeout(() => router.back(), 2000)
  } catch (e) {
    showToast(`Gagal melakukan bulk assignments: ${e.response?.data?.message || e.message}`, false)
  } finally { loading.value = false }
}

// Init
onMounted(() => {
  loadSchedules()
  loadPositions()
})
</script>

<style scoped>
.slide-fade-enter-active { transition: all .3s ease }
.slide-fade-enter-from { transform: translateY(-8px); opacity: 0 }

/* non-working day highlight */
::v-deep .fc-non-working {
  background-color: rgba(220, 38, 38, 0.2) !important;
}
</style>
