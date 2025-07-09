<template>
  <div class="p-6 md:p-10">
    <!-- Breadcrumb / Kembali -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali Bulk Assignments
      </button>
    </div>

    <!-- Kartu Detail -->
    <div
      v-if="assignment"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6 relative"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Detail Penugasan Jadwal
        </h1>
        <button
          @click="showDeleteModal = true"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
        >
          Hapus Penugasan
        </button>
      </div>

      <!-- Toast -->
      <transition name="slide-fade">
        <div
          v-if="toast.show"
          class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-2 shadow-lg text-sm text-white"
          :class="toast.ok ? 'bg-emerald-600' : 'bg-red-600'"
        >
          {{ toast.message }}
        </div>
      </transition>

      <!-- Informasi Detail -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <strong class="block text-sm text-gray-700 dark:text-gray-300 mb-1"
            >Jadwal</strong
          >
          <p class="text-gray-900 dark:text-gray-100">
            {{ assignment.schedule.schedule_name }}
          </p>
        </div>
        <div>
          <strong class="block text-sm text-gray-700 dark:text-gray-300 mb-1"
            >Tanggal Penugasan</strong
          >
          <p class="text-gray-900 dark:text-gray-100">
            {{ assignment.assignment_date.slice(0, 10) }}
          </p>
        </div>
        <div>
          <strong class="block text-sm text-gray-700 dark:text-gray-300 mb-1"
            >Periode</strong
          >
          <p class="text-gray-900 dark:text-gray-100">
            {{ assignment.month_year }}
          </p>
        </div>
        <div>
          <strong class="block text-sm text-gray-700 dark:text-gray-300 mb-1"
            >Status</strong
          >
          <p
            :class="
              assignment.is_active ? 'text-green-600' : 'text-red-600'
            "
            class="font-semibold"
          >
            {{ assignment.is_active ? 'Aktif' : 'Nonaktif' }}
          </p>
        </div>
      </div>

      <!-- Daftar Karyawan -->
      <div class="mt-6">
        <h2 class="text-lg font-medium text-gray-800 dark:text-gray-100">
          Karyawan dengan Jadwal Ini
        </h2>
        <ul
          v-if="sameScheduleEmployees.length"
          class="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1"
        >
          <li v-for="emp in sameScheduleEmployees" :key="emp.id">
            {{ emp.name }} ({{ emp.employee_code }})
          </li>
        </ul>
        <p v-else class="mt-2 text-gray-500 dark:text-gray-400">
          Tidak ada karyawan lain dengan jadwal ini.
        </p>
      </div>

      <!-- Kalender -->
      <div class="mt-6">
        <h2
          class="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2"
        >
          Kalender Jadwal
        </h2>
        <FullCalendar
          :key="calendarKey"
          ref="calendarRef"
          :options="calendarOptions"
          class="border rounded-lg overflow-hidden"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="flex justify-center items-center h-64">
      <span class="text-gray-500 dark:text-gray-400">Memuat detail...</span>
    </div>

    <!-- Popup Konfirmasi Hapus -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="showDeleteModal = false"
        ></div>
        <div
          class="relative bg-white dark:bg-gray-800 w-80 rounded-2xl shadow-lg p-6"
        >
          <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Konfirmasi Hapus
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Semua penugasan untuk jadwal
            <span class="font-semibold">{{ assignment.schedule.schedule_name }}</span>
            akan dihapus.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Batal
            </button>
            <button
              @click="confirmDelete"
              :disabled="loading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ loading ? 'Menghapus…' : 'Hapus Semuanya' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import api from '@/services/api'

/* ---- router & route ---- */
const router = useRouter()
const route = useRoute()
const id = route.params.id

/* ---- state ---- */
const assignment = ref(null)
const allAssignments = ref([])
const loading = ref(false)
const error = ref('')

const toast = reactive({
  show: false,
  message: '',
  ok: true
})

/* ---- modal state ---- */
const showDeleteModal = ref(false)

/* ---- unique employees ---- */
const sameScheduleEmployees = computed(() => {
  if (!assignment.value) return []
  const seen = new Set()
  return allAssignments.value
    .filter(a => a.schedule_id === assignment.value.schedule_id)
    .map(a => a.employee)
    .filter(emp => {
      const eid = emp?.id
      if (!eid || seen.has(eid)) return false
      seen.add(eid)
      return true
    })
})

/* ---- toast helper ---- */
function showToast(msg, ok = true) {
  toast.message = msg
  toast.ok = ok
  toast.show = true
  setTimeout(() => (toast.show = false), 3000)
}

/* ---- delete logic ---- */
async function confirmDelete() {
  loading.value = true
  try {
    const toDelete = allAssignments.value
      .filter(a => a.schedule_id === assignment.value.schedule_id)
      .map(a => a.id)

    await Promise.all(
      toDelete.map(delId => api.delete(`/schedule-assignments/${delId}`))
    )

    showToast('Semua penugasan berhasil dihapus', true)
    showDeleteModal.value = false
    setTimeout(() => router.back(), 1000)
  } catch {
    showToast('Gagal menghapus penugasan', false)
  } finally {
    loading.value = false
  }
}

/* ---- Calendar state ---- */
const calendarRef = ref(null)
const calendarKey = ref(0)
const calendarEvents = ref([])

const calendarOptions = reactive({
  plugins:     [ dayGridPlugin ],
  initialView: 'dayGridMonth',
  initialDate: '',
  height:      500,
  events:      calendarEvents,
  eventDisplay:'block',
})

/* ---- build calendar ---- */
function setupCalendar() {
  if (!assignment.value) return

  // 1) set initialDate to first day of the selected month
  const [year, month] = assignment.value.schedule.month_year.split('-').map(Number)
  calendarOptions.initialDate = `${year}-${String(month).padStart(2,'0')}-01`

  // 2) build events: non-working days as "Libur"
  const wd = assignment.value.schedule.working_days || []
  const daysInMonth = new Date(year, month, 0).getDate()
  const evs = []
  for (let d = 1; d <= daysInMonth; d++) {
    if (!wd.includes(d)) {
      const key = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      evs.push({
        title : 'Libur',
        start : key,
        allDay: true,
        color : 'red'
      })
    }
  }
  calendarEvents.value = evs

  // 3) force re-render
  calendarKey.value++
}

/* ---- data fetchers ---- */
async function loadAllAssignments() {
  try {
    const { data: res } = await api.get('/schedule-assignments')
    allAssignments.value = res.data
  } catch (e) {
    console.error('Gagal fetch daftar penugasan', e)
  }
}

async function loadDetail() {
  loading.value = true
  try {
    const { data: res } = await api.get(`/schedule-assignments/${id}`)
    assignment.value = res.data
    setupCalendar()
  } catch {
    showToast('Data tidak ditemukan', false)
    setTimeout(() => router.back(), 1500)
  } finally {
    loading.value = false
  }
}

/* ---- init ---- */
onMounted(() => {
  loadAllAssignments()
  loadDetail()
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateY(-8px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>