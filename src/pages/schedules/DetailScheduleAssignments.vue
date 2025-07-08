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
            Anda yakin ingin menghapus penugasan ini?
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
              {{ loading ? 'Menghapus…' : 'Hapus' }}
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

const toast = reactive({
  show: false,
  message: '',
  ok: true
})

/* ---- modal state ---- */
const showDeleteModal = ref(false)

/* ---- fetch detail ---- */
async function loadDetail() {
  try {
    const { data: res } = await api.get(`/schedule-assignments/${id}`)
    assignment.value = res.data
    setupCalendar()
  } catch {
    showToast('Data tidak ditemukan', false)
    setTimeout(() => router.back(), 1500)
  }
}

/* ---- fetch all assignments ---- */
async function loadAllAssignments() {
  try {
    const { data: res } = await api.get('/schedule-assignments')
    allAssignments.value = res.data
  } catch (e) {
    console.error('Gagal fetch daftar penugasan', e)
  }
}

/* ---- unique employees ---- */
const sameScheduleEmployees = computed(() => {
  if (!assignment.value) return []
  const seen = new Set()
  return allAssignments.value
    .filter((a) => a.schedule_id === assignment.value.schedule_id)
    .map((a) => a.employee)
    .filter((emp) => {
      if (seen.has(emp.id)) return false
      seen.add(emp.id)
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
    await api.delete(`/schedule-assignments/${id}`)
    showToast('Penugasan berhasil dihapus', true)
    showDeleteModal.value = false
    setTimeout(() => router.back(), 1000)
  } catch {
    showToast('Gagal menghapus penugasan', false)
  } finally {
    loading.value = false
  }
}

/* ---------- Calendar logic ---------- */
const calendarRef = ref(null)
const calendarKey = ref(0)
const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  initialDate: '',
  height: 500,
  dayCellClassNames(arg) {
    // libur: hari minggu ATAU tanggal di luar working_days
    const wd = assignment.value?.schedule.working_days || []
    const d = arg.date
    if (d.getDay() === 0 || !wd.includes(d.getDate())) {
      return ['fc-non-working']
    }
    return []
  }
})

function setupCalendar() {
  if (!assignment.value) return
  const my = assignment.value.schedule.month_year
  calendarOptions.initialDate = `${my}-01`
  calendarKey.value++
}

/* ---- init ---- */
onMounted(() => {
  loadDetail()
  loadAllAssignments()
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

/* highlight tanggal non-working */
::v-deep .fc-non-working {
  background-color: rgba(220, 38, 38, 0.2) !important;
}
</style>
