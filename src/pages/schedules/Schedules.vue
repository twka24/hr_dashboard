<template>
  <div class="p-6 md:p-10">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <!-- Card Header -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Management Schedules</h1>
        <button
          @click="addSchedule"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium shadow hover:bg-indigo-700 transform hover:scale-105 transition"
        >
          <PlusIcon class="h-5 w-5" /> Tambah Schedule
        </button>
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
          <span
            v-if="!filterPosition && filterActive === ''"
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            <strong>Total keseluruhan: {{ filteredSchedules.length }}</strong>
          </span>
          <span
            v-else
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            <strong>Total keseluruhan:</strong>
            {{ posName }} ({{ filteredSchedules.length }}), STATUS ({{ statusText }})
          </span>
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
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <th class="px-4 py-2 text-left">Nama Schedule</th>
              <th class="px-4 py-2 text-left">Position</th>
              <th class="px-4 py-2 text-left">Bulan</th>
              <th class="px-4 py-2 text-left">Jam Kerja</th>
              <th class="px-4 py-2 text-left">Istirahat</th>
              <th class="px-4 py-2 text-left">Status</th>
              <th class="px-4 py-2 text-left">Dibuat</th>
              <th class="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
    <tr
      v-for="sched in paginatedSchedules"
      :key="sched.id"
      class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <td class="px-4 py-2">{{ sched.schedule_name }}</td>
      <!-- Ganti baris ini: -->
      <td class="px-4 py-2">
        {{ sched.position?.position_name || '-' }}
      </td>
      <td class="px-4 py-2">{{ sched.month_year }}</td>
      <td class="px-4 py-2">{{ sched.start_time }} – {{ sched.end_time }}</td>
      <td class="px-4 py-2">{{ sched.break_start }} – {{ sched.break_end }}</td>
      <td class="px-4 py-2">
        <span v-if="sched.is_active" class="text-green-600 font-semibold">Aktif</span>
        <span v-else class="text-red-600 font-semibold">Nonaktif</span>
      </td>
      <td class="px-4 py-2">{{ formatDate(sched.created_at) }}</td>
      <td class="px-4 py-2">
        <button
          @click="editSchedule(sched.id)"
          class="inline-flex items-center p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
        >
          <PencilSquareIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
        </button>
      </td>
    </tr>
    <tr v-if="!filteredSchedules.length">
      <td colspan="9" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
        Tidak ada data
      </td>
    </tr>
  </tbody>
        </table>
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

const totalSchedules = computed(() => schedules.value.length)

const filteredSchedules = computed(() =>
  schedules.value.filter(s => {
    const okPos = filterPosition.value ? s.position_code === filterPosition.value : true
    const okAct = filterActive.value === ''
      ? true
      : s.is_active === filterActive.value
    return okPos && okAct
  })
)

const paginatedSchedules = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredSchedules.value.slice(start, start + perPage.value)
})

const posName = computed(() => {
  if (!filterPosition.value) return ''
  const p = positions.value.find(p => p.position_code === filterPosition.value)
  return p ? p.position_name.toUpperCase() : ''
})
const statusText = computed(() => {
  if (filterActive.value === '') return ''
  return filterActive.value ? 'AKTIF' : 'NONAKTIF'
})

function dayName(num) {
  const names = {1:'Senin',2:'Selasa',3:'Rabu',4:'Kamis',5:'Jumat',6:'Sabtu',7:'Minggu'}
  return names[num] || num
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { year:'numeric', month:'2-digit', day:'2-digit' })
}

function addSchedule() {
  router.push({ name: 'CreateSchedules' })
}

function editSchedule(id) {
  router.push({ name: 'SchedulesEdit', params: { id } })
}
</script>

<style scoped>
/* Tailwind utilities used; override here if needed */ 
</style>
