<template>
  <div class="flex min-h-screen text-slate-900 dark:text-slate-100
              bg-gradient-to-tr from-slate-50 via-slate-200 to-slate-300
              dark:from-[#061325] dark:via-[#0e1a2f] dark:to-black">

    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col
                  bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl
                  ring-1 ring-black/10 dark:ring-white/15 transition-transform
                  md:translate-x-0"
           :class="{ '-translate-x-full': !menuOpen, 'translate-x-0': menuOpen }">

      <!-- brand -->
      <div class="flex items-center gap-3 px-6 pt-6 pb-4">
        <img src="/logo_twka.jpg" class="h-10 w-10 rounded-full ring-2 ring-indigo-500"/>
        <span class="text-xl font-semibold tracking-tight">HRD Dashboard</span>
      </div>

      <!-- profile -->
      <div class="relative mx-4 mb-6 rounded-2xl bg-gradient-to-tr from-indigo-50/60
                  to-transparent dark:from-white/10 p-4 ring-1 ring-indigo-100
                  dark:ring-white/10">
        <button
          @click="openEditProfile"
          class="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <PencilIcon class="h-5 w-5 text-gray-600 dark:text-gray-300"/>
        </button>
        <div class="flex items-center gap-3">
          <img src="https://i.pravatar.cc/64" class="h-12 w-12 rounded-full"/>
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
        <button @click="confirmOpen = true"
                class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg
                       bg-indigo-500/90 px-3 py-2 text-xs font-semibold text-white
                       shadow hover:bg-indigo-600">
          <ArrowLeftOnRectangleIcon class="h-4 w-4"/> Logout
        </button>
      </div>

      <!-- navigation -->
      <nav class="flex-1 space-y-1 px-3">
        <router-link
          v-for="item in navItems"
          :key="item.id"
          :to="item.path"
          class="group relative flex w-full items-start gap-3 overflow-hidden
                 rounded-lg px-4 py-3 text-sm font-medium transition"
          :class="active===item.id
                  ? 'text-indigo-800 dark:text-indigo-200'
                  : 'text-slate-700 dark:text-slate-300'"
        >
          <span
            class="absolute left-0 top-0 h-full w-1 rounded-r bg-indigo-500 transition-transform"
            :class="[active===item.id ? 'translate-x-0' : '-translate-x-full', 'group-hover:translate-x-0']"
          />
          <span
            class="absolute inset-0 z-0 rounded-lg bg-indigo-100/50 dark:bg-white/10
                   backdrop-blur-sm opacity-0 scale-95 transition-all duration-300"
            :class="active===item.id
                    ? 'opacity-100 scale-100'
                    : 'group-hover:opacity-100 group-hover:scale-100'"
          />
          <component
            :is="item.icon"
            class="relative z-10 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            :class="active===item.id ? 'text-indigo-500' : ''"
          />
          <span class="relative z-10 flex-1 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="truncate">{{ item.name }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ item.desc }}</span>
            </div>
            <!-- dot indicator for pending on Requests -->
            <span
              v-if="item.id==='requests' && pendingCount > 0"
              class="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-500 text-xs font-semibold text-white"
            >
              {{ pendingCount }}
            </span>
          </span>
        </router-link>
      </nav>

      <!-- Settings menu at bottom -->
      <div class="mt-auto px-3 pb-6">
        <router-link
          to="/dashboard/settings"
          class="group relative flex w-full items-start gap-3 overflow-hidden
                 rounded-lg px-4 py-3 text-sm font-medium transition"
          :class="active==='settings'
                  ? 'text-indigo-800 dark:text-indigo-200'
                  : 'text-slate-700 dark:text-slate-300'"
        >
          <span
            class="absolute left-0 top-0 h-full w-1 rounded-r bg-indigo-500 transition-transform"
            :class="[active==='settings' ? 'translate-x-0' : '-translate-x-full', 'group-hover:translate-x-0']"
          />
          <span
            class="absolute inset-0 z-0 rounded-lg bg-indigo-100/50 dark:bg-white/10
                   backdrop-blur-sm opacity-0 scale-95 transition-all duration-300"
            :class="active==='settings'
                    ? 'opacity-100 scale-100'
                    : 'group-hover:opacity-100 group-hover:scale-100'"
          />
          <CogIcon
            class="relative z-10 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            :class="active==='settings' ? 'text-indigo-500' : ''"
          />
          <span class="relative z-10 flex flex-col">
            <span class="truncate">Settings</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Pengaturan</span>
          </span>
        </router-link>
      </div>

    </aside>

    <!-- Main -->
    <div class="flex flex-1 flex-col md:ml-72">
      <!-- top-bar -->
      <header class="sticky top-0 z-20 flex justify-between items-center
                     bg-white/60 dark:bg-[#0E1A2F]/80 backdrop-blur-md
                     px-4 md:px-8 py-3 shadow">
        <div class="flex items-center gap-4">
          <button class="md:hidden" @click="menuOpen = !menuOpen">
            <Bars3Icon v-if="!menuOpen" class="h-7 w-7"/>
            <XMarkIcon  v-else class="h-7 w-7"/>
          </button>
          <h2 class="text-lg font-semibold capitalize tracking-tight">
            {{ active.replace('-', ' ') }}
          </h2>
        </div>
        <div class="text-center">
          <p class="text-sm font-medium">{{ greeting }}</p>
          <p class="text-sm">{{ currentDate }}</p>
          <p class="text-sm">{{ currentTime }}</p>
        </div>
        <button @click="toggleDark()"
                class="flex items-center gap-2 rounded-full px-3 py-1 hover:bg-indigo-100 dark:hover:bg-white/10">
          <SunIcon v-if="isDark" class="h-5 w-5"/>
          <MoonIcon v-else class="h-5 w-5"/>
          <span class="text-sm">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </header>

      <!-- page content -->
      <RouterView/>

      <!-- Edit Profile Modal -->
      <transition name="fade">
        <div v-if="editProfileOpen"
             class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#1c2738] shadow-xl">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Edit Profile
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nama</label>
                <input
                  v-model="editName"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  v-model="editEmail"
                  type="email"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                @click="editProfileOpen = false"
                class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              >Batal</button>
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
        <div v-if="confirmOpen"
             class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="w-full max-w-xs rounded-2xl bg-white p-6 dark:bg-[#1c2738] shadow-xl text-center">
            <p class="text-lg font-semibold text-slate-700 dark:text-slate-100">Keluar dari akun?</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Anda akan kembali ke halaman login.</p>
            <div class="mt-6 flex justify-center gap-3">
              <button @click="confirmOpen = false"
                      class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-white/10">
                Batal
              </button>
              <button @click="confirmLogout"
                      class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
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
          class="fixed top-6 right-6 z-[998] flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm text-white"
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 13l4 4L19 7"/>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <span>{{ toastMsg }}</span>
        </div>
      </transition>

      <!-- Watermark -->
      <div class="fixed bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-600 pointer-events-none">
        Design by TWKA 2025 © | Licensed MIT
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToggle, useDark } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  HomeIcon,
  SunIcon,
  ArrowLeftOnRectangleIcon,
  PencilIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

// dark-mode
const isDark     = useDark({ storageKey: 'color-scheme' })
const toggleDark = useToggle(isDark)

// router & active route
const router    = useRouter()
const route     = useRoute()
const active    = computed(() => (route.name ?? 'dashboard').toString().toLowerCase())

// sidebar state
const menuOpen = ref(false)

// profile data
const profile = ref({ name:'', email:'', position_name:'' })
async function loadProfile() {
  try {
    const { data } = await api.get('/me')
    const u = data.data || {}
    profile.value = {
      name: u.name,
      email: u.email,
      position_name: u.position?.position_name,
    }
  } catch (e) { console.error(e) }
}

// edit profile
const editProfileOpen = ref(false)
const editName        = ref('')
const editEmail       = ref('')
const savingProfile   = ref(false)
function openEditProfile() {
  editName.value  = profile.value.name
  editEmail.value = profile.value.email
  editProfileOpen.value = true
}
async function saveProfile() {
  if (savingProfile.value) return
  savingProfile.value = true
  try {
    await api.put('/me', { name: editName.value, email: editEmail.value })
    profile.value.name  = editName.value
    profile.value.email = editEmail.value
    showToast('Profile diperbarui', true)
    editProfileOpen.value = false
  } catch {
    showToast('Gagal menyimpan profile', false)
  } finally {
    savingProfile.value = false
  }
}

// toast & logout modal
const confirmOpen = ref(false)
const toastShow   = ref(false)
const toastMsg    = ref('')
const toastOk     = ref(true)
function showToast(msg, ok=true) {
  toastMsg.value  = msg
  toastOk.value   = ok
  toastShow.value = true
  setTimeout(()=> toastShow.value = false, 2500)
}
async function confirmLogout() {
  confirmOpen.value = false
  try {
    await api.post('/logout')
    localStorage.removeItem('token')
    showToast('Logout berhasil!')
    setTimeout(()=> router.push('/login'), 1200)
  } catch {
    showToast('Gagal logout', false)
  }
}

// nav items
const navItems = [
  { id:'dashboard',  path:'/dashboard',           name:'Dashboard',           desc:'Ringkasan',        icon:HomeIcon },
  { id:'employees',  path:'/dashboard/employees', name:'Management Karyawan', desc:'Data karyawan',    icon:UsersIcon },
  { id:'requests',   path:'/dashboard/requests',  name:'Management Request',  desc:'Permohonan & cuti', icon:ClipboardDocumentCheckIcon },
  { id:'attendance', path:'/dashboard/attendance',name:'Management Absensi',  desc:'Riwayat kehadiran', icon:CalendarDaysIcon },
]

// date/time/greeting
const now         = ref(new Date())
const currentTime = computed(() => now.value.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
const currentDate = computed(() => now.value.toLocaleDateString([], { weekday:'long', day:'numeric', month:'long', year:'numeric' }))
setInterval(() => now.value = new Date(), 1000)
const greeting = computed(() => {
  const h = now.value.getHours()
  if (h >= 5 && h < 11) return 'Selamat pagi'
  if (h >= 11 && h < 15) return 'Selamat siang'
  if (h >= 15 && h < 18) return 'Selamat sore'
  return 'Selamat malam'
})

// pending count for Requests badge
const pendingCount = ref(0)
async function loadPendingCount() {
  try {
    const { data } = await api.get('/leave-requests/all')
    pendingCount.value = data.data.filter(r => r.status==='pending').length
  } catch (e) {
    console.error('Gagal fetch pending count', e)
  }
}

// on mounted
onMounted(() => {
  loadProfile()
  loadPendingCount()
})
</script>

<style scoped>
.fade-enter-active,.fade-leave-active { transition: opacity .25s }
.fade-enter-from,.fade-leave-to { opacity: 0 }
.slide-fade-enter-active,.slide-fade-leave-active { transition: all .35s }
.slide-fade-enter-from,.slide-fade-leave-to { opacity:0; transform:translateY(10px) }

thead tr {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
