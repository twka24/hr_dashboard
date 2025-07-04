<template>
  <div class="p-6 md:p-10">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Positions
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 md:p-10 space-y-6">
      <!-- Header dengan tombol Delete sejajar -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Edit Position – {{ position.position_name }}</h1>
        <button
          @click="showDeleteModal = true"
          :disabled="saving"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Memproses…' : 'Hapus Position' }}
        </button>
      </div>

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

      <!-- Form Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Position Details -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Position Code</label>
            <input
              v-model="position.position_code"
              disabled
              class="w-full rounded-lg border-gray-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Position Name</label>
            <input
              v-model="position.position_name"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Prefix</label>
            <input
              v-model="position.prefix"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- Geofence Settings -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Attendance Radius (m)</label>
            <input
              v-model.number="radius"
              type="number" min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Office Latitude</label>
            <input
              v-model.number="lat"
              @change="updateMarker"
              type="number" step="0.0001"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Office Longitude</label>
            <input
              v-model.number="lng"
              @change="updateMarker"
              type="number" step="0.0001"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Map Preview & Search -->
      <div>
        <label class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Radius Absen</label>
        <input
          ref="searchBox"
          type="text"
          placeholder="Search location..."
          class="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
        />
        <div ref="mapContainer" class="w-full h-64 rounded-lg overflow-hidden border"></div>
      </div>

      <!-- Actions: hanya Refresh & Save -->
      <div class="flex justify-end gap-3">
        <button
          @click="refresh"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Muat Ulang
        </button>
        <button
          @click="saveAll"
          :disabled="saving"
          class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Memproses…' : 'Perbarui Semua' }}
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Konfirmasi Hapus</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus position ini?
          </p>
          <div class="flex justify-end gap-3 pt-4">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Batal
            </button>
            <button
              @click="confirmDelete"
              :disabled="saving"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              {{ saving ? 'Memproses…' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

// Toast
const toastShow = ref(false)
const toastMsg  = ref('')
const toastOk   = ref(true)
function showToast(msg, ok = true) {
  toastMsg.value = msg; toastOk.value = ok; toastShow.value = true
  setTimeout(() => toastShow.value = false, 2500)
}

// Router & route
const route = useRoute()
const router = useRouter()
const code  = route.params.kode_position

// State & refs
const position        = ref({ position_code:'', position_name:'', prefix:'' })
const radius          = ref(0)
const lat             = ref(null)
const lng             = ref(null)
const saving          = ref(false)
const showDeleteModal = ref(false)

const searchBox    = ref(null)
const mapContainer = ref(null)
let map, marker, searchBoxObj

// Inisialisasi map
function initMap() {
  return new Promise(resolve => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = () => {
      map = new google.maps.Map(mapContainer.value, {
        center: { lat: -6.2088, lng: 106.8456 },
        zoom: 13
      })
      marker = new google.maps.Marker({
        map,
        position: map.getCenter(),
        draggable: true
      })
      marker.addListener('dragend', () => {
        const p = marker.getPosition()
        lat.value = parseFloat(p.lat().toFixed(4))
        lng.value = parseFloat(p.lng().toFixed(4))
      })
      searchBoxObj = new google.maps.places.SearchBox(searchBox.value)
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBox.value)
      searchBoxObj.addListener('places_changed', () => {
        const places = searchBoxObj.getPlaces()
        if (!places?.length) return
        const p = places[0].geometry.location
        map.panTo(p)
        marker.setPosition(p)
        lat.value = parseFloat(p.lat().toFixed(4))
        lng.value = parseFloat(p.lng().toFixed(4))
      })
      resolve()
    }
    document.head.appendChild(script)
  })
}

// Load data
async function loadDetails() {
  try {
    const { data: r1 } = await api.get(`/positions/${code}`)
    Object.assign(position.value, {
      position_code: r1.data.position_code,
      position_name: r1.data.position_name,
      prefix: r1.data.prefix
    })
    const { data: r2 } = await api.get(`/positions/${code}/attendance-radius`)
    const p = r2.data ?? r2
    radius.value = p.attendance_radius
    lat.value = p.office_latitude != null ? Number(parseFloat(p.office_latitude).toFixed(4)) : null
    lng.value = p.office_longitude!= null ? Number(parseFloat(p.office_longitude).toFixed(4)) : null
    if (map && marker && lat.value!=null && lng.value!=null) {
      const pos = { lat: lat.value, lng: lng.value }
      map.setCenter(pos)
      marker.setPosition(pos)
    }
  } catch (err) {
    console.error(err)
    showToast('Gagal memuat data.', false)
  }
}

// Save updates
async function saveAll() {
  saving.value = true
  try {
    await api.put(`/positions/${code}`, {
      position_name: position.value.position_name,
      prefix: position.value.prefix
    })
    await api.put(`/positions/${code}/attendance-radius`, {
      attendance_radius: radius.value,
      office_latitude: lat.value,
      office_longitude: lng.value
    })
    showToast('Data berhasil diperbarui')
  } catch {
    showToast('Gagal memperbarui data', false)
  } finally {
    saving.value = false
  }
}

// Konfirmasi hapus
async function confirmDelete() {
  saving.value = true
  try {
    await api.delete(`/positions/${code}`)
    showToast('Position berhasil dihapus')
    router.back()
  } catch {
    showToast('Gagal menghapus position', false)
  } finally {
    saving.value = false
    showDeleteModal.value = false
  }
}

// Update marker saat input manual
function updateMarker() {
  if (!marker) return
  const p = { lat: lat.value, lng: lng.value }
  marker.setPosition(p)
  map.panTo(p)
}

// Reload data
function refresh() {
  loadDetails()
}

onMounted(async () => {
  await initMap()
  await loadDetails()
})
</script>

<style scoped>
.slide-fade-enter-active { transition: all .3s }
.slide-fade-enter-from { transform: translateY(-10px); opacity: 0 }
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
