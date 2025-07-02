<!-- src/pages/Employees.vue -->
<template>
  <div class="p-6 md:p-10">
    <!-- horizontal margin of exactly 20px -->
    <div class="mx-[20px]">
      <!-- Card -->
      <div
        class="w-full overflow-hidden rounded-3xl
               bg-white dark:bg-gray-800 shadow-xl"
      >
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start
                 sm:items-center p-6 border-b border-gray-100 dark:border-gray-700"
        >
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Management Karyawan
          </h1>
          <button
            @click="onAdd"
            class="mt-4 sm:mt-0 inline-flex items-center gap-2
                   rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium
                   shadow hover:bg-indigo-700 transform hover:scale-105 transition"
          >
            <PlusIcon class="h-5 w-5" /> Tambah Karyawan
          </button>
        </div>

        <!-- Toolbar -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
          <!-- Search + Filter -->
          <div class="flex flex-1 flex-col md:flex-row gap-4 w-full">
            <!-- Search -->
            <div class="relative w-full md:w-1/2">
              <MagnifyingGlassIcon
                class="absolute left-3 top-1/2 -translate-y-1/2
                       text-gray-400 dark:text-gray-500 h-5 w-5"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari berdasarkan nama..."
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
                       focus:bg-white dark:focus:bg-gray-600
                       focus:ring-2 focus:ring-indigo-500
                       placeholder-gray-500 dark:placeholder-gray-400
                       text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 transition"
              />
            </div>

            <!-- Position Filter -->
            <div class="relative w-full md:w-1/3">
              <select
                v-model="filterPosition"
                class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
                       focus:ring-2 focus:ring-indigo-500
                       text-gray-900 dark:text-gray-100 pl-4 pr-10 py-2 transition"
              >
                <option value="">— Semua Jabatan —</option>
                <option v-for="pos in positions" :key="pos" :value="pos">
                  {{ pos }}
                </option>
              </select>
              <ChevronDownIcon
                class="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
              />
            </div>
          </div>

          <!-- Rows / Columns / More -->
          <div class="flex items-center gap-2">
            <!-- Rows per page -->
            <div class="relative">
              <select
                v-model.number="perPage"
                @change="page = 1"
                class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700
                       focus:ring-2 focus:ring-indigo-500
                       text-gray-900 dark:text-gray-100 pl-3 pr-8 py-2 transition"
              >
                <option v-for="n in [5,10,20,50]" :key="n" :value="n">
                  Show {{ n }} rows
                </option>
              </select>
              <ChevronDownIcon
                class="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none"
              />
            </div>
            <!-- Manage Columns -->
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto p-6 bg-white dark:bg-gray-800">
          <table class="w-full table-auto border-collapse">
            <thead class="bg-indigo-100 dark:bg-indigo-900">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Kode</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nama</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jabatan</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Email</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Telepon</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Dibuat</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="emp in paginated"
                :key="emp.id"
                class="border-b even:bg-gray-50 dark:even:bg-gray-700
                       hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ emp.employee_code }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ emp.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ emp.position.position_name }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100 truncate">{{ emp.email }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ emp.phone_number }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ new Date(emp.created_at).toLocaleDateString() }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="onEdit(emp)"
                    class="inline-flex items-center p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
                  >
                    <PencilSquareIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </button>
                </td>
              </tr>
              <tr v-if="!paginated.length">
                <td colspan="7" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada data yang sesuai.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center items-center gap-2 px-6 pb-6 bg-white dark:bg-gray-800">
          <button
            @click="prevPage"
            :disabled="page===1"
            class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <span class="px-2 text-sm text-gray-600 dark:text-gray-300">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import {
  PlusIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  FunnelIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

// state
const employees      = ref([])
const loading        = ref(true)
const error          = ref('')
const searchQuery    = ref('')
const filterPosition = ref('')

// pagination
const page    = ref(1)
const perPage = ref(10)

// fetch
async function loadEmployees() {
  loading.value = true
  error.value   = ''
  try {
    const { data } = await api.get('/employees')
    employees.value = data.data
  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat data karyawan.'
  } finally {
    loading.value = false
  }
}
onMounted(loadEmployees)

// computed
const positions = computed(() =>
  Array.from(new Set(employees.value.map(e => e.position.position_name)))
)
const filtered = computed(() =>
  employees.value
    .filter(e =>
      e.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
    )
    .filter(e =>
      !filterPosition.value ||
      e.position.position_name === filterPosition.value
    )
)
const totalPages = computed(() =>
  Math.ceil(filtered.value.length / perPage.value)
)
const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
)

// handlers
function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }
function onAdd() { alert('Buka form tambah karyawan') }
function onEdit(emp) { alert(`Edit: ${emp.name}`) }
function onManageColumns() { alert('Manage Columns') }
function onFilter() { alert('Open Filters') }
function onMore() { alert('More actions') }
</script>

<style scoped>
thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
