<template>
  <div class="p-6 md:p-10">
    <!-- Card Wrapper -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <!-- Card Header -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">
          Bulk Assignments
        </h1>
        <div class="flex space-x-2">
          <router-link
            :to="{ name: 'BulkAssignments' }"
            class="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon class="h-5 w-5" />
            <span>Buat Bulk Assignments</span>
          </router-link>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Filter Jadwal</label>
          <select
            v-model="filterSchedule"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">— Semua Jadwal —</option>
            <option v-for="name in scheduleNames" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status Assignment</label>
          <select
            v-model="filterActive"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">— Semua —</option>
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
        <div></div>
      </div>

      <!-- Summary & Rows-per-page -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex-1 text-center font-bold text-gray-700 dark:text-gray-300">
          Total keseluruhan: {{ filteredGrouped.length }}
        </div>
        <div class="flex items-center text-gray-700 dark:text-gray-300">
          <span class="mr-2">Show</span>
          <select
            v-model.number="perPage"
            @change="page = 1"
            class="rounded-lg border border-gray-300 px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="ml-2">rows</span>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left table-auto">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <th class="px-4 py-2">Schedule</th>
              <th class="px-4 py-2">Jabatan</th>
              <th class="px-4 py-2">Periode</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in paginatedGrouped"
              :key="item.id"
              class="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <td class="px-4 py-2">{{ item.schedule_name }}</td>
              <td class="px-4 py-2">{{ item.position_name }}</td>
              <td class="px-4 py-2">{{ item.month_year }}</td>
              <td class="px-4 py-2">
                <span :class="item.is_active ? 'text-green-600' : 'text-red-600'">
                  {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-4 py-2">
                <router-link
                  :to="{ name: 'DetailScheduleAssignments', params: { id: item.id } }"
                  class="inline-flex items-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                >
                  <EyeIcon class="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </router-link>
              </td>
            </tr>
            <tr v-if="!filteredGrouped.length">
              <td colspan="5" class="px-4 py-2 text-center text-gray-500">Tidak ada data.</td>
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
import api from '@/services/api'
import { EyeIcon, PlusIcon } from '@heroicons/vue/24/outline'

const assignments    = ref([])
const filterSchedule = ref('')
const filterActive   = ref('')
const perPage        = ref(10)
const page           = ref(1)

// muat data assignments
async function loadAssignments() {
  try {
    const { data: res } = await api.get('/schedule-assignments')
    assignments.value   = res.data
  } catch (e) {
    console.error('Gagal memuat schedule assignments:', e)
  }
}
onMounted(loadAssignments)

// daftar nama schedule unik untuk filter
const scheduleNames = computed(() =>
  [...new Set(assignments.value.map(a => a.schedule.schedule_name))]
)

// grouping + filter sebelum paginasi
const filteredGrouped = computed(() => {
  const map = {}
  assignments.value.forEach(item => {
    const posName = item.schedule.position?.position_name || 'Semua Jabatan'
    const key = `${item.schedule.schedule_name}|${posName}|${item.month_year}`
    if (!map[key]) {
      map[key] = {
        id:            item.id,
        schedule_name: item.schedule.schedule_name,
        position_name: posName,
        month_year:    item.month_year,
        is_active:     item.is_active
      }
    }
  })
  return Object.values(map).filter(item => {
    const okSched = filterSchedule.value
      ? item.schedule_name === filterSchedule.value
      : true
    const okAct = filterActive.value !== ''
      ? item.is_active === filterActive.value
      : true
    return okSched && okAct
  })
})

// paginasi
const paginatedGrouped = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredGrouped.value.slice(start, start + perPage.value)
})
const totalPages = computed(() =>
  Math.ceil(filteredGrouped.value.length / perPage.value) || 1
)
function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }
</script>

<style scoped>
/* Tailwind utilities sudah menangani styling */
</style>
