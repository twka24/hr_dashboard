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
        <h1 class="text-2xl font-bold">Edit Schedule &ndash; {{ schedule.schedule_name }}</h1>
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
              <option value="">— Pilih Jabatan —</option>
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
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Working Days</label>
        <div class="flex flex-wrap gap-4">
          <label
            v-for="(name,num) in dayOptions"
            :key="num"
            class="flex items-center gap-2"
          >
            <input
              type="checkbox"
              :value="num"
              v-model="schedule.working_days"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ name }}</span>
          </label>
        </div>
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
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <!-- Modal -->
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const id     = route.params.id

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

const toastShow = ref(false)
const toastMsg  = ref('')
const toastOk   = ref(true)
const saving    = ref(false)
const deleting  = ref(false)
const showDeleteModal = ref(false)

const dayOptions = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
}

function showToast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value  = ok
  toastShow.value = true
  setTimeout(() => toastShow.value = false, 2500)
}

async function loadPositions() {
  try {
    const { data: res } = await api.get('/positions')
    positions.value = res.data
  } catch (e) {
    console.error(e)
  }
}

async function loadDetail() {
  try {
    const { data: res } = await api.get(`/schedules/${id}`)
    Object.assign(schedule, res.data)
  } catch (e) {
    console.error(e)
    showToast('Gagal memuat detail', false)
  }
}

async function saveSchedule() {
  if (saving.value) return
  saving.value = true
  try {
    await api.put(`/schedules/${id}`, {
      position_code: schedule.position_code,
      schedule_name: schedule.schedule_name,
      working_days: schedule.working_days,
      month_year: schedule.month_year,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_start: schedule.break_start,
      break_end: schedule.break_end,
      is_active: schedule.is_active,
    })
    showToast('Jadwal berhasil disimpan')
    router.back()
  } catch (e) {
    console.error(e)
    showToast('Gagal menyimpan jadwal', false)
  } finally {
    saving.value = false
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function deleteSchedule() {
  if (deleting.value) return
  deleting.value = true
  try {
    await api.delete(`/schedules/${id}`)
    showToast('Jadwal berhasil dihapus')
    router.back()
  } catch (e) {
    console.error(e)
    showToast('Gagal menghapus jadwal', false)
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

onMounted(() => {
  loadPositions()
  loadDetail()
})
</script>

<style scoped>
.slide-fade-enter-active { transition: all .3s }
.slide-fade-enter-from { transform: translateY(-10px); opacity: 0 }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
