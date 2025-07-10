<!-- src/pages/Employees.vue -->
<template>
  <div class="p-6 md:p-10">
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
            @click="showAddModal = true"
            class="mt-4 sm:mt-0 inline-flex items-center gap-2
                   rounded-lg bg-blue-600 px-4 py-2 text-white font-medium
                   shadow hover:bg-blue-700 transform hover:scale-105 transition"
          >
            <PlusIcon class="h-5 w-5" /> Tambah Karyawan
          </button>
        </div>

        <!-- Toolbar: Search, Date, Position, Clear -->
        <div class="p-6">
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
    <!-- Search -->
    <div>
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Pencarian</label>
      <div class="relative">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari berdasarkan nama..."
          class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
                 focus:bg-white dark:focus:bg-gray-600
                 focus:ring-2 focus:ring-blue-500
                 placeholder-gray-500 dark:placeholder-gray-400
                 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 transition"
        />
      </div>
    </div>

    <!-- Date From -->
    <div>
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Dari Tanggal</label>
      <input
        v-model="dateFrom"
        type="date"
        class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
               focus:ring-2 focus:ring-blue-500
               text-gray-900 dark:text-gray-100 px-3 py-2 transition"
      />
    </div>

    <!-- Date To -->
    <div>
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Sampai Tanggal</label>
      <input
        v-model="dateTo"
        type="date"
        class="w-full rounded-lg bg-gray-100 dark:bg-gray-700
               focus:ring-2 focus:ring-blue-500
               text-gray-900 dark:text-gray-100 px-3 py-2 transition"
      />
    </div>

    <!-- Position Filter -->
    <div>
      <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
      <div class="relative">
        <select
          v-model="filterPosition"
          class="appearance-none w-full rounded-lg bg-gray-100 dark:bg-gray-700
                 focus:ring-2 focus:ring-blue-500
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

    <!-- Clear Filters -->
    <div class="flex items-end justify-end">
      <button
        @click="clearFilters"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Hapus Filter
      </button>
    </div>
  </div>
</div>


        <!-- Export & Import -->
        <div class="flex items-center justify-start gap-3 px-6 pb-4">
  <button
    @click="exportExcel"
    class="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition"
  >
    Excel
  </button>
  <label
    class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 cursor-pointer transition"
  >
    Import
    <input
      type="file"
      accept=".xlsx,.xls"
      @change="importExcel"
      class="hidden"
    />
  </label>
  <!-- Rows per page selector moved to the rightmost -->
  <div class="ml-auto relative">
    <select
      v-model.number="perPage"
      @change="page = 1"
      class="appearance-none rounded-lg bg-gray-100 dark:bg-gray-700
             focus:ring-2 focus:ring-blue-500
             text-gray-900 dark:text-gray-100
             pl-3 pr-8 py-2 transition"
    >
      <option v-for="n in [5,10,20,50]" :key="n" :value="n">
        Show {{ n }} rows
      </option>
    </select>
    <ChevronDownIcon
      class="absolute right-3 top-1/2 -translate-y-1/2
             text-gray-400 dark:text-gray-500
             h-5 w-5 pointer-events-none"
    />
  </div>
</div>


        <!-- Table -->
        <div class="overflow-x-auto p-6 bg-white dark:bg-gray-800">
          <table class="w-full table-auto border-collapse">
            <thead class="bg-blue-100 dark:bg-blue-900">
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
                       hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
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
                    class="inline-flex items-center p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                  >
                    <PencilSquareIcon class="h-5 w-5 text-blue-600 dark:text-blue-300" />
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

    <!-- Modal Tambah Karyawan -->
    <transition name="fade">
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Tambah Karyawan</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Nama</label>
              <input v-model="newEmp.name" type="text" placeholder="John Doe"
                class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"/>
            </div>
            <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
            <div class="flex items-center gap-2">
              <select
                v-model="newEmp.position_code"
                class="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
              >
                <option value="">— Pilih Jabatan —</option>
                <option
                  v-for="p in positionsList"
                  :key="p.position_code"
                  :value="p.position_code"
                >
                  {{ p.position_name }}
                </option>
              </select>
              <button
                type="button"
                @click="openAddPositionModal"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Jabatan
              </button>
            </div>
          </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Telepon</label>
              <input v-model="newEmp.phone_number" type="text" placeholder="081234567890"
                class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"/>
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Email</label>
              <input v-model="newEmp.email" type="email" placeholder="user@company.com"
                class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"/>
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Password</label>
              <input v-model="newEmp.password" type="password" placeholder="******"
                class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"/>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform hover:scale-105"
            >
              Batal
            </button>
            <button
              type="button"
              @click="submitNew"
              :disabled="submitting"
              class="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-transform hover:scale-105"
            >
              <svg v-if="submitting" class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"/>
              </svg>
              <span v-if="!submitting">Simpan</span>
              <span v-else>Memproses…</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Tambah Jabatan -->
    <transition name="fade">
      <div
        v-if="showAddPositionModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Tambah Jabatan</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Nama Jabatan</label>
              <input v-model="newPosition.position_name" type="text" placeholder="Manager"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"/>
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Prefix</label>
              <input v-model="newPosition.prefix" type="text" placeholder="MNG"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"/>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              @click="showAddPositionModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Batal
            </button>
            <button
              type="button"
              @click="submitNewPosition"
              :disabled="posSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Edit Karyawan -->
    <transition name="fade">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <header class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">Edit Karyawan</h2>
          </header>
          <form @submit.prevent="submitEdit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
              <input
                v-model="editEmp.name"
                type="text"
                placeholder="Masukkan nama lengkap"
                class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Jabatan</label>
              <select
                v-model="editEmp.position_code"
                class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Pilih Jabatan —</option>
                <option
                  v-for="p in positionsList"
                  :key="p.position_code"
                  :value="p.position_code"
                >
                  {{ p.position_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Telepon</label>
              <input
                v-model="editEmp.phone_number"
                type="text"
                placeholder="0812xxxxxxx"
                class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                v-model="editEmp.email"
                type="email"
                placeholder="email@domain.com"
                class="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span class="italic font-normal">(kosongkan jika tidak diubah)</span>
              </label>
              <div class="mt-1 flex items-center space-x-3">
                <input
                  v-model="editEmp.password"
                  type="password"
                  placeholder="••••••••"
                  class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  @click="resetPassword"
                  :disabled="resetting || !editEmp.password.trim()"
                  class="px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition-transform hover:scale-105"
                >
                  <span v-if="!resetting">Ubah Password</span>
                  <span v-else>Memproses…</span>
                </button>
              </div>
            </div>
            <div class="md:col-span-2 flex items-center justify-between mt-6">
              <button
                @click="askDelete"
                :disabled="deleting"
                type="button"
                class="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition-transform hover:scale-105"
              >
                <TrashIcon class="h-5 w-5" />
                <span v-if="!deleting">Hapus data karyawan?</span>
                <span v-else>Memproses…</span>
              </button>
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform hover:scale-105"
                >
                  Batal
                </button>
                <button
                  @click="submitEdit"
                  :disabled="editing"
                  class="px-5 py-3 bg-green-600 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-transform hover:scale-105"
                >
                  <span v-if="!editing">Perbarui</span>
                  <span v-else>Memproses…</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </transition>
<!-- ===================== MODAL KONFIRMASI HAPUS ===================== -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center">
          <TrashIcon class="h-12 w-12 mx-auto text-red-600 mb-4" />
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Yakin ingin menghapus karyawan?
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Data <span class="font-semibold">“{{ deleteTarget.name }}”</span> akan dihapus permanen.
          </p>
          <div class="flex justify-center gap-4">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Batal
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="px-5 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition"
            >
              <span v-if="!deleting">Ya, Hapus</span>
              <span v-else>Memproses…</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
    <!-- Toast -->
    <transition name="slide-fade">
      <div
        v-if="toastShow"
        class="fixed top-6 right-6 z-50 flex items-center gap-3
               rounded-lg px-4 py-3 shadow-lg text-sm text-white"
        :class="toastOk ? 'bg-emerald-600' : 'bg-red-600'"
      >
        <svg v-if="toastOk" xmlns="http://www.w3.org/2000/svg"
             class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg"
             class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>{{ toastMsg }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import * as XLSX from 'xlsx'

const employees      = ref([])
const loading        = ref(true)
const error          = ref('')
const searchQuery    = ref('')
const filterPosition = ref('')
const dateFrom       = ref('')
const dateTo         = ref('')

const page    = ref(1)
const perPage = ref(10)

const showAddModal     = ref(false)
const positionsList    = ref([])
const newEmp           = ref({ name:'', position_code:'', phone_number:'', email:'', password:'' })

const showEditModal    = ref(false)
const editEmp          = ref({ employee_code:'', name:'', position_code:'', phone_number:'', email:'', password:'' })

const submitting       = ref(false)
const editing          = ref(false)
const resetting        = ref(false)
const deleting         = ref(false)

const toastShow        = ref(false)
const toastMsg         = ref('')
const toastOk          = ref(true)
function showToast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value  = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 2500)
}

// --- New Position Modal state & handlers ---
const showAddPositionModal = ref(false)
const newPosition          = ref({ position_name:'', prefix:'' })
const posSubmitting        = ref(false)
const showDeleteModal = ref(false)
const deleteTarget    = ref({ employee_code:'', name:'' })

function openAddPositionModal() {
  newPosition.value = { position_name:'', prefix:'' }
  showAddPositionModal.value = true
}

function askDelete() {
  // dipanggil dari tombol di modal Edit
  deleteTarget.value = { ...editEmp.value }   // salin data aktif
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (deleting.value) return
  deleting.value = true
  try {
    await api.delete(`/employees/${deleteTarget.value.employee_code}`)
    showToast('Karyawan berhasil dihapus', true)
    showDeleteModal.value = false
    showEditModal.value   = false
    await loadEmployees()
  } catch {
    showToast('Gagal menghapus karyawan', false)
  } finally { deleting.value = false }
}

async function submitNewPosition() {
  if (posSubmitting.value) return
  posSubmitting.value = true
  try {
    await api.post('/positions', newPosition.value)
    await loadPositions()
    showAddPositionModal.value = false
  } catch {
    showToast('Gagal menambahkan jabatan', false)
  } finally {
    posSubmitting.value = false
  }
}
// ---------------------------------------------

async function loadEmployees() {
  loading.value = true
  try {
    const { data } = await api.get('/employees')
    employees.value = data.data
  } catch {
    showToast('Gagal memuat data karyawan.', false)
  } finally { loading.value = false }
}

async function loadPositions() {
  try {
    const { data } = await api.get('/positions')
    positionsList.value = data.data
  } catch {}
}

onMounted(() => {
  loadEmployees()
  loadPositions()
})

const positions = computed(() =>
  Array.from(new Set(employees.value.map(e => e.position.position_name)))
)

const filtered = computed(() =>
  employees.value
    .filter(e => e.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase()))
    .filter(e => !filterPosition.value || e.position.position_name === filterPosition.value)
    .filter(e => !dateFrom.value   || new Date(e.created_at) >= new Date(dateFrom.value))
    .filter(e => !dateTo.value     || new Date(e.created_at) <= new Date(dateTo.value))
)

const totalPages = computed(() =>
  Math.ceil(filtered.value.length / perPage.value) || 1
)
const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * perPage.value, page.value * perPage.value)
)

const isFiltered = computed(() =>
  !!(searchQuery.value || filterPosition.value || dateFrom.value || dateTo.value)
)
const totalCount = computed(() => filtered.value.length)

function clearFilters() {
  searchQuery.value    = ''
  filterPosition.value = ''
  dateFrom.value       = ''
  dateTo.value         = ''
  page.value           = 1
}

function prevPage() { if (page.value > 1) page.value-- }
function nextPage() { if (page.value < totalPages.value) page.value++ }

function exportExcel() {
  const rows = filtered.value.map(e => ({
    Kode: e.employee_code,
    Nama: e.name,
    Jabatan: e.position.position_name,
    Email: e.email,
    Telepon: e.phone_number,
    Dibuat: new Date(e.created_at).toLocaleDateString()
  }))
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(ws, [['Daftar Karyawan']], { origin: 'A1' })
  ws['!merges'] = [{ s:{ r:0,c:0 }, e:{ r:0,c:4 } }]
  ws['!cols'] = Array(6).fill({ wch: 20 })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Karyawan')
  XLSX.writeFile(wb, 'karyawan_export.xlsx')
}

function importExcel(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async evt => {
    const data = new Uint8Array(evt.target.result)
    const wb = XLSX.read(data, { type: 'array' })
    const form = new FormData()
    form.append('file', file)
    try {
      await api.post('/employees/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      showToast('Import berhasil', true)
      loadEmployees()
    } catch {
      showToast('Import gagal', false)
    }
  }
  reader.readAsArrayBuffer(file)
}

function onEdit(emp) {
  editEmp.value = {
    employee_code : emp.employee_code,
    name          : emp.name,
    position_code : emp.position.position_code ?? '',
    phone_number  : emp.phone_number,
    email         : emp.email,
    password      : ''
  }
  showEditModal.value = true
}

async function submitNew() {
  if (submitting.value) return
  submitting.value = true
  try {
    await api.post('/employees', newEmp.value)
    showAddModal.value = false
    await loadEmployees()
    showToast('Karyawan berhasil ditambahkan', true)
    Object.assign(newEmp.value, { name:'', position_code:'', phone_number:'', email:'', password:'' })
  } catch {
    showToast('Gagal menambahkan karyawan', false)
  } finally { submitting.value = false }
}

async function submitEdit() {
  if (editing.value) return
  editing.value = true
  try {
    await api.put(`/employees/${editEmp.value.employee_code}`, {
      name         : editEmp.value.name,
      position_code: editEmp.value.position_code,
      phone_number : editEmp.value.phone_number,
      email        : editEmp.value.email
    })
    showToast('Data karyawan berhasil diperbarui', true)
    showEditModal.value = false
    await loadEmployees()
  } catch {
    showToast('Gagal memperbarui data', false)
  } finally { editing.value = false }
}

async function resetPassword() {
  if (resetting.value || !editEmp.value.password.trim()) return
  resetting.value = true
  try {
    await api.post(`/employees/${editEmp.value.employee_code}/reset-password`, {
      new_password: editEmp.value.password
    })
    showToast('Password berhasil diubah', true)
    editEmp.value.password = ''
  } catch {
    showToast('Gagal mengubah password', false)
  } finally { resetting.value = false }
}

async function deleteEmployee() {
  if (!confirm(`Yakin ingin menghapus karyawan “${editEmp.value.name}”?`)) return
  deleting.value = true
  try {
    await api.delete(`/employees/${editEmp.value.employee_code}`)
    showToast('Karyawan berhasil dihapus', true)
    showEditModal.value = false
    await loadEmployees()
  } catch {
    showToast('Gagal menghapus karyawan', false)
  } finally { deleting.value = false }
}
</script>


<style scoped>
/***** Scrollbar for horizontal table on mobile *****/
.custom-scroll::-webkit-scrollbar {
  height: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: theme('colors.blue.400');
  border-radius: 9999px;
}

/* Sticky table header */
thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Transitions (reuse existing) */
.fade-enter-active, .fade-leave-active { transition: opacity .25s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0 }
</style>
