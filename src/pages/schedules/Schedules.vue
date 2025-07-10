<template>
  <div class="p-6 md:p-10">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <!-- Card Header -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Management Schedules</h1>
        <div class="flex space-x-2">
          <button
            @click="addSchedule"
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium shadow hover:bg-indigo-700 transform hover:scale-105 transition"
          >
            <PlusIcon class="h-5 w-5" />
            Tambah Schedule
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
          <select
            v-model="filterPosition"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
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
        </div>
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            v-model="filterActive"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
          >
            <option value="">Semua</option>
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      <!-- Summary & Rows-per-page -->
      <div class="flex items-center">
        <!-- centered summary -->
        <div class="flex-1 text-center">
        </div>

        <!-- per-page dropdown -->
        <div class="relative">
          <select
            v-model.number="perPage"
            @change="page = 1"
            class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700
                   focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100
                   pl-3 pr-8 py-2 transition"
          >
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">
              Show {{ n }} rows
            </option>
          </select>
          <ChevronDownIcon
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
          />
        </div>
      </div>

      <!-- Table -->
     <div class="overflow-x-aut bg-white dark:bg-gray-800">
          <table class="w-full table-auto border-collapse">
               <thead class="bg-indigo-100 dark:bg-indigo-900">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nama Schedule</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jabatan</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Bulan</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jam Kerja</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Istirahat</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Dibuat</th>
              <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sched in paginatedSchedules"
              :key="sched.id"
              class="border-b even:bg-gray-50 dark:even:bg-gray-700
                       hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
              >
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ sched.schedule_name }}</td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ sched.position?.position_name || 'Semua Jabatan' }}</td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ sched.month_year }}</td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ sched.start_time }} – {{ sched.end_time }}</td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ sched.break_start }} – {{ sched.break_end }}</td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                <span v-if="sched.is_active" class="text-green-600 font-semibold">Aktif</span>
                <span v-else class="text-red-600 font-semibold">Nonaktif</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ formatDate(sched.created_at) }}</td>
              <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                <button
                  @click="editSchedule(sched.id)"
                  class="inline-flex items-center p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                >
                  <PencilSquareIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </button>
              </td>
            </tr>
            <tr v-if="!filteredSchedules.length">
              <td colspan="8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                Tidak ada data
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-center gap-2 py-4">
        <button
          @click="prevPage"
          :disabled="page===1"
          class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          Prev
        </button>
        <span class="text-sm text-gray-700 dark:text-gray-300">
          Halaman {{ page }} / {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="page===totalPages"
          class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { PlusIcon, ChevronDownIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const router         = useRouter()
const positions      = ref([])
const schedules      = ref([])
const filterPosition = ref('')
const filterActive   = ref('')
const perPage        = ref(10)
const page           = ref(1)

// load data
async function loadPositions() {
  const { data: res } = await api.get('/positions')
  positions.value = res.data
}
async function loadSchedules() {
  const { data: res } = await api.get('/schedules')
  schedules.value = res.data
}
onMounted(() => {
  loadPositions()
  loadSchedules()
})

// filtering & pagination
const filteredSchedules = computed(() =>
  schedules.value.filter(s => {
    const okPos = filterPosition.value ? s.position_code === filterPosition.value : true
    const okAct = filterActive.value === '' ? true : s.is_active === filterActive.value
    return okPos && okAct
  })
)
const paginatedSchedules = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredSchedules.value.slice(start, start + perPage.value)
})
const totalPages = computed(() =>
  Math.ceil(filteredSchedules.value.length / perPage.value) || 1
)

// helper texts
const posName = computed(() => {
  if (!filterPosition.value) return ''
  const p = positions.value.find(p => p.position_code === filterPosition.value)
  return p ? p.position_name.toUpperCase() : ''
})
const statusText = computed(() => {
  if (filterActive.value === '') return ''
  return filterActive.value ? 'AKTIF' : 'NONAKTIF'
})

// navigation
function addSchedule() {
  router.push({ name: 'CreateSchedules' })
}
function editSchedule(id) {
  router.push({ name: 'SchedulesEdit', params: { id } })
}

// pagination controls
function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }

// format date
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
thead tr { position: sticky; top: 0; z-index: 10 }
/* Tailwind utilities sudah banyak; tambahkan override di sini jika perlu */
</style>
