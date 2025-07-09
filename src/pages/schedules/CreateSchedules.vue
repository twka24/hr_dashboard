<template>
  <div class="p-6 md:p-10">
    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="$router.back()"
        class="bg-white dark:bg-gray-700 rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        ← Kembali ke Schedules
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
      <!-- Header -->
      <h1 class="text-2xl font-bold">Buat Schedule Baru</h1>

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

      <!-- Form kiri & kanan -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Kiri -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Schedule Name</label>
            <input
              v-model="form.schedule_name"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Position</label>
            <select
              v-model="form.position_code"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            > 
              <option value="">— Pilih Jabatan —</option>
              <option :value="null">Semua Jabatan</option>
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
            <label class="block text-sm text-gray-700 dark:text-gray-300">Month &amp; Year</label>
           <input
            v-model="form.month_year"
            @input="onMonthChange"
            type="month"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
          />
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="active"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label for="active" class="text-sm text-gray-700 dark:text-gray-300">Active</label>
          </div>
        </div>

        <!-- Kanan -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Start Time</label>
            <input
              v-model="form.start_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">End Time</label>
            <input
              v-model="form.end_time"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Break Start</label>
            <input
              v-model="form.break_start"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300">Break End</label>
            <input
              v-model="form.break_end"
              type="time"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Tombol tambah libur & kalender -->
      <div class="space-y-2">
          <div class="mb-4 flex items-center">
        <div role="group" class="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
  <!-- Tombol Tandai Libur -->
  <button
    @click="addingHoliday = !addingHoliday; if (addingHoliday) editingMode = ''"
    :class="addingHoliday
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
    class="flex items-center gap-2 px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path v-if="!addingHoliday" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
    <span>{{ addingHoliday ? 'Selesai Tandai' : 'Tandai Libur' }}</span>
  </button>

  <!-- Tombol Hapus Libur -->

</div>
</div>

        

        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
          class="border rounded-lg overflow-hidden"
        />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          @click="createSchedule"
          :disabled="saving"
          class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
        >
          {{ saving ? 'Menyimpan…' : 'Buat Schedule' }}
        </button>
      </div>
    </div>

    <!-- Modal Tambah/Edit Libur -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>

      <!-- Modal content -->
      <div class="relative z-50 bg-white dark:bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
        <h2 class="text-lg font-semibold mb-4">
          {{ isEditing ? 'Edit Libur Nasional' : 'Tandai Libur Nasional' }}
        </h2>
        <p class="mb-2"><strong>Tanggal:</strong> {{ modalDate }}</p>
        <input
          v-model="modalTitle"
          type="text"
          placeholder="Judul libur"
          class="w-full mb-4 rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500"
        />
        <div class="flex justify-end gap-2">
          <button
            v-if="isEditing"
            @click="deleteHoliday"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Hapus
          </button>
          <button
            @click="saveHoliday"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Simpan
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import api from '@/services/api'

const router = useRouter()

// 1) ref untuk instance FullCalendar
const calendarRef = ref(null)
// ref untuk instance FullCalendar

// hitung YYYY-MM untuk bulan sekarang
const today     = new Date()
const defaultYm = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`

// state form
const form = reactive({
  position_code: '',
  schedule_name: '',
  working_days: [],
  month_year: defaultYm,
  start_time: '',
  end_time: '',
  break_start: '',
  break_end: '',
  is_active: false,
})

// positions
const positions = ref([])

// toast
const toastShow = ref(false)
const toastMsg = ref('')
const toastOk = ref(true)
const saving = ref(false)
function showToast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 3000)
}

// toggle mode tambah libur
const addingHoliday = ref(false)

// modal state
const modalOpen = ref(false)
const modalDate = ref('')
const modalTitle = ref('Libur Nasional')

// holiday events
const holidayEvents = ref([
  { title: 'Tahun Baru Masehi', date: '2025-01-01' },
  { title: 'Hari Kartini',        date: '2025-04-21' },
  { title: 'Kemerdekaan RI',      date: '2025-08-17' },
])

// semua tanggal di bulan aktif
let allDatesInMonth = []

// generate dates & default working_days (exclude Sundays + holidays)
function onMonthChange() {
  if (!form.month_year) return

  // 1) rebuild semua tanggal & working_days seperti biasa
  const [year, month] = form.month_year.split('-').map(Number)
  allDatesInMonth = []
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const dd = String(d).padStart(2, '0')
    const mm = String(month).padStart(2, '0')
    allDatesInMonth.push(`${year}-${mm}-${dd}`)
  }
  form.working_days = allDatesInMonth.filter(date => {
    const dayOfWeek = new Date(date).getDay()
    const isHoliday = holidayEvents.value.some(e => e.date === date)
    return dayOfWeek !== 0 && !isHoliday
  })

  // 2) setelah DOM update, navigasi & rerender cells
  nextTick(() => {
    const calendarApi = calendarRef.value?.getApi()
    if (!calendarApi) return

    // ambil YYYY-MM dari view sekarang
    const d    = calendarApi.view.currentStart
   const viewYm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`

    // navigasi hanya kalau beda
    if (viewYm !== form.month_year) {
      calendarApi.gotoDate(`${form.month_year}-01`)
    }

    // highlight ulang non-working days
    calendarApi.rerenderCells()
  })
}


// non-working days computed (string-based)
const nonWorkingDays = computed(() =>
  allDatesInMonth.filter(date => !form.working_days.includes(date))
)

// sync saat navigasi kalender
function onDatesSet(arg) {
  const d   = arg.view.currentStart
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`
  if (form.month_year !== iso) {
    form.month_year = iso
    onMonthChange()
  }
}


// klik tanggal
function handleDateClick(arg) {
  // pakai dateStr langsung (YYYY-MM-DD lokal)
  const dateStr   = arg.dateStr
  const dayOfWeek = arg.date.getDay()

  if (addingHoliday.value) {
    // buka modal untuk edit/tambah libur nasional
    modalDate.value  = dateStr
    const idx = holidayEvents.value.findIndex(e => e.date === dateStr)
    modalTitle.value = idx > -1
      ? holidayEvents.value[idx].title
      : 'Libur Nasional'
    modalOpen.value    = true

  } else {
    // kalau Minggu atau sudah libur nasional, abaikan
    if (dayOfWeek === 0) return
    if (holidayEvents.value.some(e => e.date === dateStr)) return

    // toggle di working_days
    const i = form.working_days.indexOf(dateStr)
    if (i > -1) form.working_days.splice(i, 1)
    else        form.working_days.push(dateStr)

    // rerender kalender agar class fc-non-working ter-update
    nextTick(() => {
      calendarRef.value?.getApi().rerenderCells()
    })
  }
}

// modal edit logic
const editingIndex = computed(() =>
  holidayEvents.value.findIndex(e => e.date === modalDate.value)
)
const isEditing = computed(() => editingIndex.value !== -1)

function saveHoliday() {
  const idx = editingIndex.value
  if (idx > -1) {
    holidayEvents.value[idx].title = modalTitle.value
  } else {
    holidayEvents.value.push({ title: modalTitle.value, date: modalDate.value })
  }
  const wi = form.working_days.indexOf(modalDate.value)
  if (wi > -1) form.working_days.splice(wi,1)
  closeModal()
}

function deleteHoliday() {
  const idx = editingIndex.value
  if (idx > -1) {
    const removed = holidayEvents.value.splice(idx,1)[0]
    if (allDatesInMonth.includes(removed.date)) {
      const wd = new Date(removed.date).getDay()
      if (wd !== 0 && !form.working_days.includes(removed.date)) {
        form.working_days.push(removed.date)
      }
    }
  }
  closeModal()
}

function closeModal() {
  modalOpen.value = false
  modalDate.value = ''
  modalTitle.value = ''
}

// FullCalendar options with dayCellClassNames
const calendarOptions = reactive({
  plugins: [ dayGridPlugin, interactionPlugin ],
  initialView: 'dayGridMonth',
  events: holidayEvents.value,
  dateClick: handleDateClick,
  eventColor:   'red',
  datesSet: onDatesSet,
  height: 450,
  dayMaxEvents: true,

 dayCellClassNames(arg) {
    // bangun YYYY-MM-DD secara lokal (tanpa toISOString)
    const d   = arg.date
    const yyyy = d.getFullYear()
    const mm   = String(d.getMonth()+1).padStart(2,'0')
    const dd   = String(d.getDate()).padStart(2,'0')
    const dateStr = `${yyyy}-${mm}-${dd}`


    const isHoliday = holidayEvents.value.some(e => e.date === dateStr)

    return ( isHoliday)
      ? ['']
      : []
  }
});


watch(holidayEvents, nv => { 
  calendarOptions.events = nv 
})
watch(form.working_days, () => {
  nextTick(() => { calendarRef.value?.getApi().rerenderCells() })
})

// load positions
async function loadPositions() {
  try {
    const { data: res } = await api.get('/positions')
    positions.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// submit schedule
async function createSchedule() {
  if (saving.value) return
  if (form.end_time <= form.start_time) {
    showToast('Waktu selesai harus setelah waktu mulai.', false)
    return
  }
  saving.value = true
  try {
    const days = form.working_days.map(d => parseInt(d.split('-')[2], 10))
    const payload = {
      position_code: form.position_code === '' ? null : form.position_code,
      schedule_name: form.schedule_name,
      working_days: days,
      month_year: form.month_year,
      start_time: form.start_time,
      end_time: form.end_time,
      break_start: form.break_start,
      break_end: form.break_end,
      is_active: form.is_active,
    }
    const { status } = await api.post('/schedules', payload)
    if (status === 201) {
      showToast('Schedule berhasil dibuat', true)
      router.push({ name: 'Schedules' })
    } else {
      showToast(`Unexpected status: ${status}`, false)
    }
  } catch (err) {
    console.error(err)
    const errs = err.response?.data?.errors
    if (errs) showToast(Object.values(errs).flat().join('\n'), false)
    else     showToast('Gagal membuat schedule', false)
  } finally {
    saving.value = false
  }
}

// inisialisasi
onMounted(async () => {
  await loadPositions()
  onMonthChange()
})
</script>

<style scoped>
/* highlight tanggal NON-working */
::v-deep .fc-non-working {
  background-color: rgba(220, 38, 38, 0.2) !important;
}
</style>
