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

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <!-- Header -->
      <h1 class="text-2xl font-bold">Buat Schedule Baru</h1>

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
              v-model="form.schedule_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Position</label>
            <select
              v-model="form.position_code"
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
              v-model="form.month_year"
              type="month"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="form.is_active"
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
              v-model="form.start_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">End Time</label>
            <input
              v-model="form.end_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Break Start</label>
            <input
              v-model="form.break_start"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Break End</label>
            <input
              v-model="form.break_end"
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
              v-model="form.working_days"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ name }}</span>
          </label>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          @click="createSchedule"
          :disabled="saving"
          class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Menyimpan…' : 'Buat Schedule' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const form = reactive({
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
const dayOptions = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
}

const toastShow = ref(false)
const toastMsg = ref('')
const toastOk = ref(true)
const saving = ref(false)

function showToast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 3000)
}

async function loadPositions() {
  try {
    const { data: res } = await api.get('/positions')
    positions.value = res.data
  } catch (e) {
    console.error(e)
  }
}

async function createSchedule() {
  if (saving.value) return

  // Validasi: end_time harus setelah start_time
  if (form.end_time <= form.start_time) {
    showToast('Waktu selesai harus setelah waktu mulai.', false)
    return
  }

  saving.value = true
  try {
    const { status } = await api.post('/schedules', {
      position_code: form.position_code,
      schedule_name: form.schedule_name,
      working_days: form.working_days,
      month_year: form.month_year,
      start_time: form.start_time,
      end_time: form.end_time,
      break_start: form.break_start,
      break_end: form.break_end,
      is_active: form.is_active,
    })
    if (status === 201) {
      showToast('Schedule berhasil dibuat', true)
      router.push({ name: 'Schedules' })
    } else {
      showToast(`Unexpected status: ${status}`, false)
    }
  } catch (err) {
    console.error(err)
    if (err.response && err.response.data && err.response.data.errors) {
      const messages = Object.values(err.response.data.errors)
        .flat()
        .join('\n')
      showToast(messages, false)
    } else {
      showToast('Gagal membuat schedule', false)
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadPositions)
</script>

<style scoped>
.slide-fade-enter-active { transition: all .3s }
.slide-fade-enter-from { transform: translateY(-10px); opacity: 0 }
</style>
