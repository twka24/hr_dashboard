<!-- src/pages/AttendanceDetail.vue -->
<template>
  <div class="p-6 md:p-10">
    <div class="mx-[20px]">
      <!-- Back -->
      <div class="flex items-center gap-2 mb-4">
        <button
          @click="$router.back()"
          class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
        >
          ← Kembali ke Absensi
        </button>
      </div>

      <!-- ===== Card ===== -->
      <div
        v-if="!loading && attendance"
        class="w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl"
      >
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 dark:border-gray-700 gap-3"
        >
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Detail Absensi
          </h1>

          <!-- Tombol aksi -->
          <div class="flex gap-2">
            <button
              v-if="!editMode"
              @click="startEdit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Edit
            </button>

            <template v-else>
              <button
                @click="saveEdit"
                :disabled="saving"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {{ saving ? 'Menyimpan…' : 'Simpan' }}
              </button>
              <button
                @click="cancelEdit"
                :disabled="saving"
                class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 transition"
              >
                Batal
              </button>
            </template>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Kode Karyawan -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Kode Karyawan</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.employee?.employee_code || '-' }}
              </p>
            </div>

            <!-- Nama -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Nama</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.employee?.name || '-' }}
              </p>
            </div>

            <!-- Posisi -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Posisi</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.employee?.position?.position_name || 'Semua Jabatan' }}
              </p>
            </div>

            <!-- Tanggal -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Tanggal</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ formatDate(attendance.attendance_date) || '-' }}
              </p>
            </div>

            <!-- Jam Masuk -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Jam Masuk</p>
              <template v-if="editMode">
                <input
                  v-model="form.check_in"
                  type="time"
                  class="w-full rounded-lg border px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </template>
              <template v-else>
                <p class="font-medium text-gray-800 dark:text-gray-100">
                  {{ attendance.check_in ? formatTime(attendance.check_in) : '-' }}
                </p>
              </template>
            </div>

            <!-- Lokasi Masuk -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Lokasi Masuk</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.check_in_location || '-' }}
              </p>
            </div>

            <!-- Jam Pulang -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Jam Pulang</p>
              <template v-if="editMode">
                <input
                  v-model="form.check_out"
                  type="time"
                  class="w-full rounded-lg border px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </template>
              <template v-else>
                <p class="font-medium text-gray-800 dark:text-gray-100">
                  {{ attendance.check_out ? formatTime(attendance.check_out) : '-' }}
                </p>
              </template>
            </div>

            <!-- Lokasi Pulang -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Lokasi Pulang</p>
              <p class="font-medium text-gray-800 dark:text-gray-100">
                {{ attendance.check_out_location || '-' }}
              </p>
            </div>

            <!-- Istirahat Mulai -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Istirahat Mulai</p>
              <template v-if="editMode">
                <input
                  v-model="form.break_start"
                  type="time"
                  class="w-full rounded-lg border px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </template>
              <template v-else>
                <p class="font-medium text-gray-800 dark:text-gray-100">
                  {{ attendance.break_start ? formatTime(attendance.break_start) : '-' }}
                </p>
              </template>
            </div>

            <!-- Istirahat Selesai -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Istirahat Selesai</p>
              <template v-if="editMode">
                <input
                  v-model="form.break_end"
                  type="time"
                  class="w-full rounded-lg border px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </template>
              <template v-else>
                <p class="font-medium text-gray-800 dark:text-gray-100">
                  {{ attendance.break_end ? formatTime(attendance.break_end) : '-' }}
                </p>
              </template>
            </div>

            <!-- Status -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <template v-if="editMode">
                <select
                  v-model="form.status"
                  class="w-full rounded-lg border px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="hadir">hadir</option>
                  <option value="late">late</option>
                  <option value="alpha">alpha</option>
                  <option value="izin">izin</option>
                  <option value="cuti">cuti</option>
                </select>
              </template>
              <template v-else>
                <p
                  class="font-medium"
                  :class="{
                    'text-green-600': attendance.status==='hadir',
                    'text-yellow-600': ['late','cuti','izin'].includes(attendance.status),
                    'text-red-600': ['alpha','absent'].includes(attendance.status)
                  }"
                >
                  {{ attendance.status }}
                </p>
              </template>
            </div>

            <!-- Notes -->
            <div class="sm:col-span-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">Notes</p>
              <template v-if="editMode">
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                ></textarea>
              </template>
              <template v-else>
                <p class="font-medium text-gray-800 dark:text-gray-100">
                  {{ attendance.notes || '-' }}
                </p>
              </template>
            </div>

            <!-- Dibuat -->
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Dibuat</p>
              <p class="font-medium text-gray-600 dark:text-gray-400">
                {{ formatDateTime(attendance.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Lokasi Absensi -->
        <div class="p-6 border-t border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Lokasi Absensi
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

        <!-- Kalender Absensi Bulan Ini -->
        <div class="p-6 border-t border-gray-100 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Kalender Absensi Bulan Ini
          </h2>
          <FullCalendar :options="calendarOptions" />
        </div>
      </div>

      <!-- Loading & Error -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg
          class="h-12 w-12 animate-spin text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12" cy="12" r="10"
            stroke="currentColor" stroke-width="4"
            class="opacity-25"
          />
          <path
            fill="currentColor"
            class="opacity-75"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8z"
          />
        </svg>
      </div>
      <div v-if="error" class="text-center text-red-600">{{ error }}</div>

      <!-- Toast -->
      <transition name="fade">
        <div
          v-if="toast.show"
          class="fixed top-6 right-6 z-[999] rounded-lg px-4 py-3 shadow-lg text-sm text-white"
          :class="toast.ok ? 'bg-emerald-600' : 'bg-red-600'"
        >
          {{ toast.message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const router = useRouter()
const route  = useRoute()

const attendance = ref(null)
const loading    = ref(true)
const error      = ref('')
const editMode   = ref(false)
const saving     = ref(false)

const form = reactive({
  check_in:    '',
  check_out:   '',
  break_start: '',
  break_end:   '',
  status:      '',
  notes:       ''
})

// FullCalendar setup
const calendarEvents  = ref([])
const calendarOptions = reactive({
  plugins:     [ dayGridPlugin ],
  initialView: 'dayGridMonth',
  initialDate: '',            // akan di-set di onMounted()
  events:      calendarEvents,
  eventDisplay:'block',
  height:      'auto',
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}
function formatTime(v) {
  if (!v) return '-'
  if (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v)) return v
  return new Date(v).toLocaleTimeString('id-ID',{ hour:'2-digit', minute:'2-digit' })
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('id-ID',{ year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' })
}
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
  if(lat&&lng) return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
  if(loc)      return `https://www.google.com/maps?q=${encodeURIComponent(loc)}&z=15&output=embed`
  return null
}

const toast = reactive({ show:false, message:'', ok:true })
function showToast(msg, ok=true) {
  toast.message = msg
  toast.ok      = ok
  toast.show    = true
  setTimeout(() => toast.show = false, 3000)
}

function timeHHmm(v) {
  if(!v) return ''
  if(typeof v==='string' && /^\d{2}:\d{2}$/.test(v)) return v
  return new Date(v).toISOString().substring(11,16)
}
function populateForm() {
  form.check_in    = timeHHmm(attendance.value.check_in)
  form.check_out   = timeHHmm(attendance.value.check_out)
  form.break_start = timeHHmm(attendance.value.break_start)
  form.break_end   = timeHHmm(attendance.value.break_end)
  form.status      = attendance.value.status || 'hadir'
  form.notes       = attendance.value.notes  || ''
}
function startEdit() {
  if(!attendance.value) return
  populateForm()
  editMode.value = true
}
function cancelEdit() {
  editMode.value = false
}

async function saveEdit() {
  if(saving.value) return
  saving.value = true
  try {
    await api.put(`/attendances/${attendance.value.id}`, {
      check_in:    form.check_in    || null,
      check_out:   form.check_out   || null,
      break_start: form.break_start || null,
      break_end:   form.break_end   || null,
      status:      form.status,
      notes:       form.notes
    })
    showToast('Berhasil diperbarui', true)
    const { data } = await api.get(`/attendances/${attendance.value.id}`)
    attendance.value = data.data
    editMode.value   = false
  } catch(e) {
    console.error(e)
    showToast('Gagal menyimpan', false)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // 1) ambil detail
    const { data: d1 } = await api.get(`/attendances/${route.params.id}`)
    attendance.value   = d1.data

    // 2) atur kalender ke bulan dari attendance_date
    const base = new Date(attendance.value.attendance_date)
    const Y    = base.getFullYear()
    const M    = String(base.getMonth()+1).padStart(2,'0')
    calendarOptions.initialDate = `${Y}-${M}-01`

    // 3) ambil semua & filter milik karyawan ini
    const respAll = await api.get('/attendances')
    const all     = respAll.data.data
    const code    = attendance.value.employee.employee_code
    const myRecs  = all.filter(a => a.employee_code === code)

    // 4) kumpulkan tanggal hadir
    const hadirSet = new Set(myRecs.map(a => a.attendance_date.substr(0,10)))

    // 5) tentukan first & last day di bulan tersebut
    const first = new Date(Y, base.getMonth(),   1)
    const last  = new Date(Y, base.getMonth()+1, 0)

    // 6) bangun events
    const evs = []
    for (let d = new Date(first); d <= last; d.setDate(d.getDate()+1)) {
      const key = d.toISOString().substr(0,10)
      if (hadirSet.has(key)) {
        const rec = myRecs.find(a => a.attendance_date.substr(0,10) === key)
         evs.push({ start: key, allDay: true, display:'background', backgroundColor:'white' })
        
      } else {
        evs.push({ title: 'Libur', start: key, allDay: true, color:'red' })
      }
    }
    calendarEvents.value = evs

  } catch (e) {
    console.error(e)
    error.value = 'Gagal memuat detail absensi atau kalender.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s }
.fade-enter-from, .fade-leave-to       { opacity: 0 }
</style>
