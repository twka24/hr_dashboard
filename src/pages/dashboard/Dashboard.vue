<!-- DashboardLayout.vue -->
<template>
  <div
    class="flex min-h-screen text-slate-900 dark:text-slate-100
           bg-gradient-to-tr from-slate-50 via-slate-200 to-slate-300
           dark:from-[#061325] dark:via-[#0e1a2f] dark:to-black"
  >
    <!-- ========================== SIDEBAR ========================== -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex flex-col
             w-64 sm:w-64 lg:w-72 xl:w-80 2xl:w-80
             bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl
             ring-1 ring-black/10 dark:ring-white/15 transition-transform duration-300
             md:translate-x-0"
      :class="{ '-translate-x-full': !menuOpen, 'translate-x-0': menuOpen }"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-4 sm:px-6 pt-6 pb-4">
        <span class="text-lg sm:text-xl font-semibold tracking-tight">HRIS</span>
         <img src="https://tkago.abeng.id/assets/images/logo_bengkel/wVlkHBOXDt.png" class="h-10 w-25  ring-blue-500" />
      </div>

      <!-- Profile card -->
      <div
        class="relative mx-3 sm:mx-4 mb-6 rounded-2xl bg-gradient-to-tr from-blue-50/60 to-transparent dark:from-white/10 p-4 ring-1 ring-blue-100 dark:ring-white/10"
      >
        <button
          @click="openEditProfile"
          class="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <PencilIcon class="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div class="flex items-center gap-3">
          <img src="/hr_manager.png" class="h-12 w-12 rounded-full" />
          <div class="text-sm min-w-0">
            <p class="font-bold truncate">{{ profile.name || '...' }}</p>
            <p class="text-xs truncate text-slate-500 dark:text-slate-400">
              {{ profile.position_name }}
            </p>
            <p class="text-xs truncate text-slate-400 dark:text-slate-500">
              {{ profile.email }}
            </p>
          </div>
        </div>
        <button
          @click="confirmOpen = true"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg
                 bg-blue-500/90 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-blue-600"
        >
          <ArrowLeftOnRectangleIcon class="h-4 w-4" />
          Logout
        </button>
      </div>

      <!-- ===================== NAVIGATION ===================== -->
      <nav class="flex-1 space-y-1 px-2 sm:px-3 overflow-y-auto custom-scroll">
        <template v-for="item in navItems" :key="item.id">
          <!-- ===== Link menu utama ===== -->
          <router-link
            :to="item.path"
            active-class=""
            exact-active-class=""
            class="group relative flex w-full items-start gap-3 overflow-hidden rounded-lg px-3 sm:px-4 py-3 text-sm font-medium transition"
            :class="[
              (item.id === 'schedules' ? scheduleGroupParent.includes(active) : active === item.id)
               ? 'text-blue-800 dark:text-blue-200'
               : 'text-slate-700 dark:text-slate-300'
            ]"
          >
            <span
              class="absolute left-0 top-0 h-full w-1 rounded-r bg-blue-500 transition-transform"
              :class="[
                (item.id === 'schedules' ? scheduleGroupParent.includes(active) : active === item.id)
                ? 'translate-x-0'
                : '-translate-x-full',
                'group-hover:translate-x-0'
              ]"
            />
            <span
              class="absolute inset-0 z-0 rounded-lg bg-blue-100/50 dark:bg-white/10 backdrop-blur-sm opacity-0 scale-95 transition-all duration-300"
              :class="[
                (item.id === 'schedules' ? scheduleGroupParent.includes(active) : active === item.id)
                ? 'opacity-100 scale-100'
                : 'group-hover:opacity-100 group-hover:scale-100'
              ]"
            />
            <component
              :is="item.icon"
              class="relative z-10 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              :class="[
                (item.id === 'schedules' ? scheduleGroupParent.includes(active) : active === item.id)
                ? 'text-blue-500'
                : '' ]"
            />
            <span class="relative z-10 flex-1 flex items-center justify-between min-w-0">
              <div class="flex flex-col min-w-0">
                <span class="truncate">{{ item.name }}</span>
                <!-- Hide description on very small screens for compact sidebar -->
                <span class="text-xs text-slate-500 dark:text-slate-400 hidden xl:inline">{{ item.desc }}</span>
              </div>
              <span
                v-if="item.id === 'requests' && pendingCount > 0"
                class="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-500 text-xs font-semibold text-white"
              >
                {{ pendingCount }}
              </span>
            </span>
          </router-link>

          <!-- ===== Sub-menu Bulk Assignments ===== -->
          <router-link
            v-if="item.id === 'schedules' && scheduleGroupAll.includes(active)"
            :to="{ name: 'ScheduleAssignments' }"
            active-class=""
            exact-active-class=""
            class="group relative flex w-auto min-w-[calc(100%-2rem)] items-center gap-3 ml-6 sm:ml-8 rounded-lg px-3 sm:px-4 py-3 text-sm font-medium transition
                   text-slate-700 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-white/10"
            :class="[
              ['scheduleassignments','detailscheduleassignments','bulkassignments'].includes(active)
              ? 'text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-white/10'
              : '' ]"
          >
            <span
              class="absolute left-0 top-3 h-[calc(100%-1.5rem)] w-1 rounded-r bg-blue-500 transition-transform"
              :class="[
                ['scheduleassignments','detailscheduleassignments','bulkassignments'].includes(active)
                ? 'translate-x-0'
                : '-translate-x-full group-hover:translate-x-0' ]"
            />
            <DocumentDuplicateIcon
              class="relative z-10 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              :class="[
                ['scheduleassignments','detailscheduleassignments','bulkassignments'].includes(active)
                ? 'text-blue-500'
                : 'text-slate-400' ]"
            />
            <span class="relative z-10 truncate">Bulk Assignments</span>
          </router-link>
        </template>
      </nav>

      <!-- ============ SETTINGS ============ -->
      <div class="mt-auto px-2 sm:px-3 pb-6">
        <router-link
          :to="{ name: 'SettingsPositions' }"
          active-class=""
          exact-active-class=""
          class="group relative flex w-full items-start gap-3 overflow-hidden rounded-lg px-3 sm:px-4 py-3 text-sm font-medium transition"
          :class="active === 'settings' ? 'text-blue-800 dark:text-blue-200' : 'text-slate-700 dark:text-slate-300'"
        >
          <span
            class="absolute left-0 top-0 h-full w-1 rounded-r bg-blue-500 transition-transform"
            :class="[ active === 'settings' ? 'translate-x-0' : '-translate-x-full', 'group-hover:translate-x-0' ]"
          />
          <span
            class="absolute inset-0 z-0 rounded-lg bg-blue-100/50 dark:bg-white/10 backdrop-blur-sm opacity-0 scale-95 transition-all duration-300"
            :class="active === 'settings' ? 'opacity-100 scale-100' : 'group-hover:opacity-100 group-hover:scale-100'"
          />
          <CogIcon
            class="relative z-10 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            :class="active === 'settings' ? 'text-blue-500' : ''"
          />
          <span class="relative z-10 flex flex-col min-w-0">
            <span class="truncate">Settings</span>
            <span class="text-xs text-slate-500 dark:text-slate-400 hidden xl:inline">Pengaturan</span>
          </span>
        </router-link>
      </div>
    </aside>

    <!-- ========================== MAIN ========================== -->
    <div
      class="flex flex-1 flex-col ml-0 sm:ml-64 lg:ml-72 xl:ml-80 transition-[margin] duration-300"
    >
      <!-- Header -->
      <header
        class="sticky top-0 z-20 flex flex-wrap justify-between items-center gap-y-2
               bg-white/60 dark:bg-[#0E1A2F]/80 backdrop-blur-md
               px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 shadow"
      >
        <div class="flex items-center gap-3 sm:gap-4">
          <button class="md:hidden" @click="menuOpen = !menuOpen">
            <Bars3Icon v-if="!menuOpen" class="h-6 w-6" />
            <XMarkIcon  v-else class="h-6 w-6" />
          </button>
          <h2 class="text-base sm:text-lg font-semibold capitalize tracking-tight truncate max-w-[60vw]">
            {{ active.replace('-', ' ') }}
          </h2>
        </div>
        <div class="text-center flex-1 order-last md:order-none">
          <p class="text-xs sm:text-sm font-medium">{{ greeting }}</p>
          <p class="text-xs sm:text-sm">{{ currentDate }}</p>
          <p class="text-xs">{{ currentTime }}</p>
        </div>
        <button
          @click="toggleDark()"
          class="flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-3 py-1 hover:bg-blue-100 dark:hover:bg-white/10"
        >
          <SunIcon v-if="isDark" class="h-4 w-4 sm:h-5 sm:w-5" />
          <MoonIcon v-else class="h-4 w-4 sm:h-5 sm:w-5" />
          <span class="hidden sm:inline text-xs sm:text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </header>

      <!-- Router view -->
      <RouterView v-slot="{ Component, route }">
        <component
          v-if="route.name === 'DashboardHome'"
          :is="Component"
          :key="route.fullPath"
        />
        <transition v-else name="page-slide" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>

      <!-- ===== Modals, Toast, Watermark ===== -->
      <!-- Edit Profile Modal -->
      <transition name="fade">
        <div
          v-if="editProfileOpen"
          class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div class="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#1c2738] shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Edit Profile
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                <input
                  v-model="editName"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  v-model="editEmail"
                  type="email"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="mt-6 flex flex-wrap justify-end gap-3">
              <button
                @click="editProfileOpen = false"
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Batal
              </button>
              <button
                @click="saveProfile"
                :disabled="savingProfile"
                class="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50"
              >
                <span v-if="!savingProfile">Simpan</span>
                <span v-else>Memproses…</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Logout Modal -->
      <transition name="fade">
        <div
          v-if="confirmOpen"
          class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div class="w-full max-w-xs rounded-2xl bg-white p-6 dark:bg-[#1c2738] shadow-xl text-center overflow-y-auto max-h-[90vh]">
            <p class="text-lg font-semibold text-slate-700 dark:text-slate-100">Keluar dari akun?</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Anda akan kembali ke halaman login.</p>
            <div class="mt-6 flex flex-wrap justify-center gap-3">
              <button
                @click="confirmOpen = false"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                @click="confirmLogout"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Toast -->
      <transition name="slide-fade">
        <div
          v-if="toastShow"
          class="fixed top-4 sm:top-6 right-4 sm:right-6 z-[998] flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-xs sm:text-sm text-white"
          :class="toastOk ? 'bg-emerald-600' : 'bg-red-600'"
        >
          <svg
            v-if="toastOk"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span class="truncate max-w-[60vw]">{{ toastMsg }}</span>
        </div>
      </transition>

      <!-- Watermark -->
      <div
        class="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-600 pointer-events-none"
      >
        Design by TWKA 2025 © | Licensed MIT
      </div>
    </div>
  </div>
</template>

<script setup>
/* ---------- UNUSED IMPORTS REMOVED BY BUNDLER IN PRODUCTION ---------- */
import { ref, reactive, onMounted, computed } from 'vue'
import { useToggle, useDark } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import {
  Bars3Icon,
  XMarkIcon,
  PencilIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
  CogIcon,
  HomeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/vue/24/outline'

/* ---------- Dark-mode ---------- */
const isDark     = useDark({ storageKey: 'color-scheme' })
const toggleDark = useToggle(isDark)

/* ---------- Router & active menu ---------- */
const router = useRouter()
const route  = useRoute()

// halaman yang dianggap bagian jadwal (induk Schedule aktif)
const scheduleGroupParent = [
  'schedules',
  'createschedules',
  'schedulesedit'
]
// seluruh halaman jadwal (termasuk BulkAssign.) hanya untuk men-show submenu
const scheduleGroupAll = [
  ...scheduleGroupParent,
  'scheduleassignments',
  'detailscheduleassignments',
  'bulkassignments'
]
const active = computed(() => {
  const name = (route.name ?? '').toString()
  const map  = {
    RequestDetail    : 'requests',
    AttendanceDetail : 'attendance',
    CreateSchedules  : 'createschedules',
    SchedulesEdit    : 'schedulesedit'
  }
  return (map[name] ?? name).toLowerCase()
})

/* ---------- Sidebar ---------- */
const menuOpen = ref(false)

/* ---------- Profile ---------- */
const profile     = reactive({ name: '', email: '', position_name: '' })
const lastFetched = ref(0)

function readCache () {
  const raw = localStorage.getItem('hr-dashboard-profile')
  if (!raw) return false
  try {
    const { profile: p, ts } = JSON.parse(raw)
    profile.name          = p.name
    profile.email         = p.email
    profile.position_name = p.position_name
    lastFetched.value     = ts
    return true
  } catch { return false }
}

async function loadProfile (force = false) {
  const now = Date.now()
  if (!force && lastFetched.value && now - lastFetched.value < 5 * 60 * 1000) return
  try {
    const { data } = await api.get('/me')
    const u = data.data || {}
    profile.name          = u.name
    profile.email         = u.email
    profile.position_name = u.position?.position_name || ''
    lastFetched.value     = now
    localStorage.setItem(
      'hr-dashboard-profile',
      JSON.stringify({ profile: { ...profile }, ts: now })
    )
  } catch (e) { console.error('Gagal load profile', e) }
}

/* ---------- Edit profile ---------- */
const editProfileOpen = ref(false)
const editName        = ref('')
const editEmail       = ref('')
const savingProfile   = ref(false)

function openEditProfile () {
  editName.value        = profile.name
  editEmail.value       = profile.email
  editProfileOpen.value = true
}

async function saveProfile () {
  if (savingProfile.value) return
  savingProfile.value = true
  try {
    await api.put('/me', { name: editName.value, email: editEmail.value })
    profile.name  = editName.value
    profile.email = editEmail.value
    localStorage.setItem(
      'hr-dashboard-profile',
      JSON.stringify({ profile: { ...profile }, ts: Date.now() })
    )
    showToast('Profil diperbarui', true)
    editProfileOpen.value = false
  } catch { showToast('Gagal menyimpan profil', false) }
  finally { savingProfile.value = false }
}

/* ---------- Logout & toast ---------- */
const confirmOpen = ref(false)
const toastShow   = ref(false)
const toastMsg    = ref('')
const toastOk     = ref(true)

function showToast (msg, ok = true) {
  toastMsg.value  = msg
  toastOk.value   = ok
  toastShow.value = true
  setTimeout(() => (toastShow.value = false), 2500)
}

async function confirmLogout () {
  confirmOpen.value = false
  try {
    await api.post('/logout')
    localStorage.removeItem('token')
    showToast('Logout berhasil!', true)
    setTimeout(() => router.push('/login'), 1200)
  } catch { showToast('Gagal logout', false) }
}

/* ---------- Navigation items ---------- */
const navItems = [
  { id: 'dashboard',  path: '/dashboard',           name: 'Dashboard',           desc: 'Ringkasan',         icon: HomeIcon },
  { id: 'employees',  path: '/dashboard/employees', name: 'Management Karyawan', desc: 'Data karyawan',     icon: UsersIcon },
  { id: 'requests',   path: '/dashboard/requests',  name: 'Management Request',  desc: 'Permohonan & cuti', icon: ClipboardDocumentCheckIcon },
  { id: 'schedules',  path: '/dashboard/schedules', name: 'Management Schedule', desc: 'Jadwal & Shift',    icon: ClockIcon },
  { id: 'attendance', path: '/dashboard/attendance',name: 'Management Absensi',  desc: 'Riwayat kehadiran', icon: CalendarDaysIcon }
]

/* ---------- Clock & greeting ---------- */
const now         = ref(new Date())
const currentTime = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
const currentDate = computed(() => now.value.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
setInterval(() => (now.value = new Date()), 1000)

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h >= 5 && h < 11) return 'Selamat pagi'
  if (h >= 11 && h < 15) return 'Selamat siang'
  if (h >= 15 && h < 18) return 'Selamat sore'
  return 'Selamat malam'
})

/* ---------- Pending leave-request count ---------- */
const pendingCount = ref(0)
async function loadPendingCount () {
  try {
    const { data } = await api.get('/leave-requests/all')
    pendingCount.value = data.data.filter(r => r.status === 'pending').length
  } catch (e) { console.error('Gagal fetch pending count', e) }
}

/* ---------- Init ---------- */
onMounted(() => {
  if (!readCache()) loadProfile(true)
  else               loadProfile(false)
  loadPendingCount()
})
</script>

<style scoped>
/***************************
 * Transition Animations
 ***************************/
.slide-fade-enter-active { transition: all .3s ease; }
.slide-fade-enter-from   { transform: translateY(-8px); opacity: 0; }
.fade-enter-active       { transition: opacity .3s ease; }
.fade-enter-from         { opacity: 0; }

/***************************
 * Custom Scrollbar for Sidebar (visible on hover for better UX on mobile)
 ***************************/
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.blue.500') transparent;
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: theme('colors.blue.500');
  border-radius: 8px;
}
.custom-scroll:hover::-webkit-scrollbar-thumb {
  background-color: theme('colors.blue.600');
}
</style>