<!-- src/pages/RequestDetail.vue -->
<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">

      <!-- Back button -->
     <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Request
      </button>
    </div>

      <!-- Card -->
      <div
        v-if="!loading && request"
        class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl"
      >
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700"
        >
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Detail Request
          </h1>

          <!-- Approve & Reject – tampil HANYA jika status pending -->
          <div
            class="flex gap-2"
            v-if="request && request.status === 'pending'"
          >
            <!-- Approve -->
            <button
              @click="openConfirm('approved')"
              :disabled="actioning"
              class="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
              <CheckIcon class="h-5 w-5" /> Approve
            </button>
            <!-- Reject -->
            <button
              @click="openConfirm('rejected')"
              :disabled="actioning"
              class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
              <XMarkIcon class="h-5 w-5" /> Reject
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Karyawan</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ request.employee.name }} ({{ request.employee.employee_code }})
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Tipe</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">{{ request.type }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Dari</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">{{ request.start_date }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Sampai</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">{{ request.end_date }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">Alasan</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">{{ request.reason }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p
                class="font-medium"
                :class="{
                  'text-yellow-600': request.status==='pending',
                  'text-green-600': request.status==='approved',
                  'text-red-600':   request.status==='rejected'
                }"
              >
                {{ request.status }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Dibuat</p>
              <p class="font-medium text-gray-600 dark:text-gray-400">
                {{ new Date(request.created_at).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div
          class="flex justify-end gap-2 p-6 border-t border-gray-100 dark:border-gray-700"
        >
          <!-- Edit – tampil HANYA jika status pending -->
          <button
            v-if="request && request.status === 'pending'"
            @click="openEdit()"
            class="px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition-transform hover:scale-105 inline-flex items-center gap-2"
          >
            <PencilSquareIcon class="h-5 w-5" /> Edit
          </button>

          <!-- Delete (tetap seperti semula) -->
          <button
            v-if="request && request.status === 'pending'"
            @click="openDelete()"
            class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-transform hover:scale-105 inline-flex items-center gap-2"
          >
            <TrashIcon class="h-5 w-5" /> Delete
          </button>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg
          class="h-12 w-12 animate-spin text-blue-600"
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
      <div v-if="!loading && !request" class="text-center text-red-600">
        {{ error || 'Data request tidak tersedia.' }}
      </div>
    </div>

    <!-- Confirm Decision Modal -->
    <transition name="fade">
  <div
    v-if="showConfirmModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Konfirmasi {{ pendingDecision === 'approved' ? 'Approve' : 'Reject' }}
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Anda yakin ingin
        <span class="font-medium">
          {{ pendingDecision === 'approved' ? 'menyetujui' : 'menolak' }}
        </span>
        request #{{ request.id }} dari
        <span class="font-medium">{{ request.employee.name }}</span>?
      </p>
      <div class="flex justify-end gap-3">
        <button
          @click="showConfirmModal = false"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-transform hover:scale-105"
        >
          Batal
        </button>
        <button
          @click="confirmDecision()"
          :disabled="actioning"
          :class="[
            'px-4 py-2 text-white rounded-full disabled:opacity-50 transition-transform hover:scale-105',
            pendingDecision === 'approved'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          ]"
        >
          <span v-if="!actioning">
            Ya, {{ pendingDecision === 'approved' ? 'Setujui' : 'Tolak' }}
          </span>
          <span v-else>Memproses…</span>
        </button>
      </div>
    </div>
  </div>
</transition>

    <!-- Edit Modal (tidak diubah) -->
    <transition name="fade">
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Edit Request</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Tipe</label>
              <select
                v-model="editReq.type"
                class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
              >
                <option value="cuti">cuti</option>
                <option value="izin">izin</option>
              </select>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  v-model="editReq.start_date"
                  type="date"
                  class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
                />
              </div>
              <div class="flex-1">
                <label class="block text-sm text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  v-model="editReq.end_date"
                  type="date"
                  class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm text-gray-700 dark:text-gray-300">Alasan</label>
              <textarea
                v-model="editReq.reason"
                rows="3"
                class="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showEditModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-transform hover:scale-105"
            >
              Batal
            </button>
            <button
              @click="submitEdit()"
              :disabled="editing"
              class="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition-transform hover:scale-105"
            >
              <span v-if="!editing">Simpan</span>
              <span v-else>Memproses…</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal (tidak diubah) -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Konfirmasi Delete
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Anda yakin ingin menghapus request #{{ request.id }}?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 transition-transform hover:scale-105"
            >
              Batal
            </button>
            <button
              @click="confirmDelete()"
              :disabled="actioning"
              class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 transition-transform hover:scale-105"
            >
              <span v-if="!actioning">Ya, Hapus</span>
              <span v-else>Memproses…</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast (tidak diubah) -->
    <transition name="slide-fade">
      <div
        v-if="toastShow"
        class="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm text-white"
        :class="toastOk ? 'bg-emerald-600' : 'bg-red-600'"
      >
        <svg
          v-if="toastOk"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>{{ toastMsg }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import {
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route  = useRoute()

const request = ref(null)
const loading = ref(true)
const error   = ref('')

// decision confirm
const showConfirmModal = ref(false)
const pendingDecision  = ref('')

// edit modal
const showEditModal = ref(false)
const editReq       = ref({ type:'', start_date:'', end_date:'', reason:'' })

// delete confirm
const showDeleteModal = ref(false)

// loading states
const actioning = ref(false)
const editing   = ref(false)

// toast
const toastShow = ref(false)
const toastMsg  = ref('')
const toastOk   = ref(true)
function showToast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value  = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 2500)
}

// load from localStorage
onMounted(() => {
  const stored = localStorage.getItem('selectedRequest')
  if (stored) {
    request.value = JSON.parse(stored)
  } else {
    error.value = 'Data request tidak tersedia.'
  }
  loading.value = false
})

// open decision confirm
function openConfirm(dec) {
  pendingDecision.value = dec
  showConfirmModal.value = true
}

async function confirmDecision() {
  console.log('pendingDecision.value:', pendingDecision.value)
  const payload = { decision: pendingDecision.value }
  console.log('Payload yang dikirim:', payload)

  showConfirmModal.value = false
  actioning.value = true
  try {
    await api.put(
      `/leave-requests/${request.value.id}/decision`,
      payload
    )
    request.value.status = pendingDecision.value
    showToast(`Request ${pendingDecision.value}`, true)
  } catch {
    showToast('Gagal mengambil keputusan', false)
  } finally {
    actioning.value = false
  }
}

// open edit
function openEdit() {
  Object.assign(editReq.value, {
    type:       request.value.type,
    start_date: request.value.start_date,
    end_date:   request.value.end_date,
    reason:     request.value.reason,
  })
  showEditModal.value = true
}
async function submitEdit() {
  if (editing.value) return
  editing.value = true
  try {
    await api.put(`/leave-requests/${request.value.id}`, { ...editReq.value })
    Object.assign(request.value, editReq.value)
    showEditModal.value = false
    showToast('Request diperbarui', true)
  } catch {
    showToast('Gagal memperbarui', false)
  } finally {
    editing.value = false
  }
}

// open delete confirm
function openDelete() {
  showDeleteModal.value = true
}
async function confirmDelete() {
  showDeleteModal.value = false
  actioning.value = true
  try {
    await api.delete(`/leave-requests/${request.value.id}`)
    showToast('Request dihapus', true)
    router.push({ name: 'Requests' })
  } catch {
    showToast('Gagal menghapus', false)
  } finally {
    actioning.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0 }
</style>
