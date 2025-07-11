<!-- src/pages/settings/menu/Positions.vue -->
<template>
  <div class="relative">
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

    <div class="p-6 md:p-10">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 md:p-10 space-y-6">
        <!-- Header & tombol Tambah -->
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">Settings – Positions</h1>
          <button
            @click="openAdd"
            class="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon class="h-5 w-5" /> Tambah Position
          </button>
        </div>

        <!-- Filter Input -->
        <div class="flex items-center gap-4">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          <input
            v-model="filter"
            placeholder="Filter by position name…"
            class="flex-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 pl-3 pr-3 py-2 transition"
          />
        </div>

        <!-- Positions Table -->
        <div class="overflow-x-auto bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner">
          <table class="min-w-full">
            <thead class="bg-gray-200 dark:bg-gray-600">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Code</th>
                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Name</th>
                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Prefix</th>
                <th class="px-4 py-3 text-left text-sm font-semibold dark:text-gray-200">Created At</th>
                <th class="px-4 py-3 text-center text-sm font-semibold dark:text-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pos in filteredPositions"
                :key="pos.id"
                class="border-b even:bg-white dark:even:bg-gray-800"
              >
                <td class="px-4 py-2 text-sm dark:text-gray-100">{{ pos.position_code }}</td>
                <td class="px-4 py-2 text-sm dark:text-gray-100">{{ pos.position_name }}</td>
                <td class="px-4 py-2 text-sm dark:text-gray-100">{{ pos.prefix }}</td>
                <td class="px-4 py-2 text-sm dark:text-gray-400">
                  {{ new Date(pos.created_at).toLocaleDateString() }}
                </td>
                <td class="px-4 py-2 text-center space-x-2">
                  <button
                    @click="onEdit(pos)"
                    class="text-green-500 hover:text-green-600 p-1"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredPositions.length">
                <td colspan="5" class="px-4 py-6">
                  <div class="flex flex-col items-center justify-center">
                    <DotLottieVue
                      src="https://lottie.host/0d0b58ce-53fe-47dc-aaa1-51b392330e59/J7lGZekeC3.json"
                      autoplay
                      loop
                      class="w-34 h-34"
                    />
                    <p class="mt-2 text-gray-500 dark:text-gray-400 text-center">
                      Tidak ada data posisi.
                    </p>
                  </div>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        <!-- Modal Tambah Position -->
          <teleport to="body">
        <transition name="fade">
          <div
            v-if="showAdd"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 class="text-xl font-semibold mb-4 dark:text-gray-100">
                Tambah Position
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-700 dark:text-gray-300">Position Name</label>
                  <input
                    v-model="newPos.position_name"
                    type="text"
                    placeholder="Manager"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label class="block text-sm text-gray-700 dark:text-gray-300">Prefix</label>
                  <input
                    v-model="newPos.prefix"
                    type="text"
                    placeholder="MNG"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  @click="savePosition"
                  :disabled="loadingAdd"
                  class="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {{ loadingAdd ? 'Memproses…' : 'Simpan' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
        </teleport>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const router     = useRouter()
const positions  = ref([])
const filter     = ref('')
const showAdd    = ref(false)
const newPos     = ref({ position_name:'', prefix:'' })
const loadingAdd = ref(false)

const filteredPositions = computed(() =>
  filter.value
    ? positions.value.filter(p =>
        p.position_name.toLowerCase().includes(filter.value.toLowerCase())
      )
    : positions.value
)

async function load() {
  const { data } = await api.get('/positions')
  positions.value = data.data
}

function openAdd() {
  newPos.value = { position_name:'', prefix:'' }
  showAdd.value = true
}

function closeModal() {
  showAdd.value = false
}

async function savePosition() {
  loadingAdd.value = true
  try {
    await api.post('/positions', newPos.value)
    await load()
    showAdd.value = false
  } finally {
    loadingAdd.value = false
  }
}

// navigasi ke halaman detail (jika ada)
function onDetail(pos) {
  router.push({ name: 'PositionDetail', params: { id: pos.id } })
}

// navigasi ke halaman edit penuh
function onEdit(pos) {
  router.push({
    name: 'SettingsEditPosition',
    params: { kode_position: pos.position_code }
  })
}

onMounted(load)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.slide-fade-enter-active { transition: all .3s }
.slide-fade-enter-from { transform: translateY(-10px); opacity: 0 }
</style>
