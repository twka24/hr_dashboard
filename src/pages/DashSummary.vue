<template>
  <div class="p-6 md:p-10">
    <h1 class="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">
      Ringkasan Dashboard
    </h1>

    <div v-if="loading" class="flex justify-center py-20">
      <svg class="h-12 w-12 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"/>
      </svg>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion-div
        class="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 p-6 shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.1 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Karyawan</p>
        <p class="mt-4 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
          {{ totalEmployees }}
        </p>
      </motion-div>

      <motion-div
        class="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 p-6 shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Pending Request</p>
        <p class="mt-4 text-3xl font-extrabold text-yellow-500">
          {{ pendingRequests }}
        </p>
      </motion-div>

      <motion-div
        class="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 p-6 shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Hadir Hari Ini</p>
        <p class="mt-4 text-3xl font-extrabold text-green-500">
          {{ presentToday }}
        </p>
      </motion-div>

      <motion-div
        class="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/10 p-6 shadow-lg ring-1 ring-black/10 dark:ring-white/15 hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Terlambat Hari Ini</p>
        <p class="mt-4 text-3xl font-extrabold text-red-500">
          {{ lateToday }}
        </p>
      </motion-div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// state metrik
const totalEmployees  = ref(0)
const pendingRequests = ref(0)
const presentToday    = ref(0)
const lateToday       = ref(0)
const loading         = ref(true)

// load data ringkasan
async function loadSummary() {
  loading.value = true
  try {
    // Total karyawan
    const empRes = await api.get('/employees')
    totalEmployees.value = Array.isArray(empRes.data.data)
      ? empRes.data.data.length
      : 0

  } catch (e) {
    console.error('Ringkasan gagal dimuat', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadSummary)
</script>

<style scoped>
/* Tailwind & vueuse/motion menangani animasi */
</style>
