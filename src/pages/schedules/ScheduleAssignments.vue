<<template>
  <div class="p-6 md:p-10">
    <!-- Card Wrapper -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Bulk Assignments</h1>
        <router-link
          :to="{ name: 'BulkAssignments' }"
          class="inline-flex items-center space-x-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Buat Bulk Assignments</span>
        </router-link>
      </div>

      <!-- Body -->
      <div class="px-6 py-6 space-y-6">
        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Filter Jadwal</label>
            <select
              v-model="filterSchedule"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">— Semua Jadwal —</option>
              <option v-for="name in scheduleNames" :key="name" :value="name">
                {{ name }}
              </option>
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
          <div><!-- spacer --></div>
        </div>

        <!-- Summary & Rows-per-page -->
        <div class="flex items-center justify-between">
          <div class="flex-1 text-center font-bold text-gray-700 dark:text-gray-300"><!-- summary --></div>
          <div class="relative">
            <select
              v-model.number="perPage"
              @change="page = 1"
              class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 pl-3 pr-8 py-2 transition"
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
          <table class="w-full table-auto border-collapse">
            <thead class="bg-blue-100 dark:bg-blue-900">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Schedule</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Jabatan</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Periode</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">Aksi</th>
              </tr>
            </thead>

            <!-- Loading Spinner -->
            <tbody v-if="loading">
              <tr>
                <td colspan="5" class="px-4 py-12 text-center">
                  <svg
                    class="animate-spin h-8 w-8 text-blue-600 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                </td>
              </tr>
            </tbody>

            <!-- Data Rows -->
            <tbody v-else>
              <tr
                v-for="item in paginatedGrouped"
                :key="item.id"
                class="border-b even:bg-gray-50 dark:even:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ item.schedule_name }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ item.position_name }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{{ formatMonthYear(item.month_year) }}</td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  <span :class="item.is_active ? 'text-green-600' : 'text-red-600'">
                    {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                  <router-link
                    :to="{ name: 'DetailScheduleAssignments', params: { id: item.id } }"
                    class="inline-flex items-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                  >
                    <EyeIcon class="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </router-link>
                </td>
              </tr>
              <tr v-if="!filteredGrouped.length">
                <td colspan="5" class="px-4 py-6">
                  <div class="flex flex-col items-center justify-center">
                    <DotLottieVue
                      src="https://lottie.host/0d0b58ce-53fe-47dc-aaa1-51b392330e59/J7lGZekeC3.json"
                      autoplay
                      loop
                      class="w-34 h-34"
                    />
                    <p class="mt-2 text-gray-500 dark:text-gray-400 text-center">
                      Tidak ada data Bulk Assignments
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-center gap-2 py-4">
          <button
            @click="prevPage"
            :disabled="page === 1"
            class="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-300">
            Halaman {{ page }} / {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="page === totalPages"
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
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { EyeIcon, PlusIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'


const assignments    = ref([])
const filterSchedule = ref('')
const filterActive   = ref('')
const perPage        = ref(10)
const page           = ref(1)

// Fungsi baru, hanya untuk format “Juli 2025” (bulan – tahun)
function formatMonthYear(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    month: 'long',
    year:  'numeric'
  })
}

// muat data assignments
const loading = ref(true)
async function loadAssignments() {
  loading.value = true
  try {
    const { data } = await api.get('/schedule-assignments')
    assignments.value = data.data
  } finally {                   // sukses atau gagal
    loading.value = false       // spinner hilang, data (jika ada) tampil
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
