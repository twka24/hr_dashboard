<!-- src/pages/AttendanceDetail.vue -->
<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">

      <!-- Back button -->
      <button
        @click="router.push({ name: 'Attendance' })"
        class="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform hover:scale-105"
      >
        <ArrowLeftIcon class="h-5 w-5" />
        Back
      </button>

      <!-- Card -->
      <div
        v-if="!loading && attendance"
        class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl"
      >
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700"
        >
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Detail Absensi #{{ attendance.id }}
          </h1>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Kode Karyawan</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.employee.employee_code }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Nama</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.employee.name }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Posisi</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.employee.position.position_name }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Tanggal</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ formatDate(attendance.attendance_date) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Jam Masuk</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.check_in ? formatTime(attendance.check_in) : '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Lokasi Masuk</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.check_in_location || '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Jam Pulang</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.check_out ? formatTime(attendance.check_out) : '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Lokasi Pulang</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.check_out_location || '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Istirahat Mulai</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.break_start ? formatTime(attendance.break_start) : '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Istirahat Selesai</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.break_end ? formatTime(attendance.break_end) : '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p
                class="font-medium"
                :class="{
                  'text-green-600': attendance.status==='present',
                  'text-red-600':   attendance.status==='absent',
                  'text-yellow-600': attendance.status==='late' || attendance.status==='cuti'
                }"
              >
                {{ attendance.status }}
              </p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">Notes</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.notes || '-' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Dibuat</p>
              <p class="font-medium text-gray-600 dark:text-gray-400">
                {{ formatDateTime(attendance.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Maps Section -->
        <div class="p-6 border-t border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Lokasi Absensi
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Check-in Map -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Check-in</p>
              <div v-if="embedUrl('in')">
                <iframe
                  :src="embedUrl('in')"
                  class="w-full h-64 rounded-lg border-0"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
              <p v-else class="text-sm text-gray-600 dark:text-gray-500">
                Tidak ada lokasi check-in
              </p>
            </div>
            <!-- Check-out Map -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Check-out</p>
              <div v-if="embedUrl('out')">
                <iframe
                  :src="embedUrl('out')"
                  class="w-full h-64 rounded-lg border-0"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
              <p v-else class="text-sm text-gray-600 dark:text-gray-500">
                Tidak ada lokasi check-out
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg
          class="h-12 w-12 animate-spin text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
          <path fill="currentColor" class="opacity-75"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"/>
        </svg>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-center text-red-600">
        {{ error || 'Data absensi tidak tersedia.' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const attendance = ref(null)
const loading = ref(true)
const error = ref('')

// Format helpers
function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString()
}

// Build embed URL for Google Maps (coords or address)
function embedUrl(type) {
  const lat = type==='in'
    ? attendance.value.check_in_latitude
    : attendance.value.check_out_latitude
  const lng = type==='in'
    ? attendance.value.check_in_longitude
    : attendance.value.check_out_longitude
  const loc = type==='in'
    ? attendance.value.check_in_location
    : attendance.value.check_out_location

  if (lat && lng) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
  } else if (loc) {
    return `https://www.google.com/maps?q=${encodeURIComponent(loc)}&z=15&output=embed`
  }
  return null
}

// Load detail
onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get(`/attendances/${route.params.id}`)
    attendance.value = res.data.data
  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat detail absensi.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
