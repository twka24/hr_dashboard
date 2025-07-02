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
  SunIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/outline'

/* dark-mode --------------------------------------------------- */
const isDark     = useDark({ storageKey: 'color-scheme' })
const toggleDark = useToggle(isDark)

/* router helpers --------------------------------------------- */
const router = useRouter()
const route  = useRoute()
const active = computed(() => route.name ?? 'dashboard')   // highlight

/* sidebar toggle --------------------------------------------- */
const menuOpen = ref(false)

/* profile (GET /api/me) -------------------------------------- */
const profile = ref({ name: '', email: '', position_name: '' })
async function loadProfile () {
  try {
    const { data } = await api.get('/me')   // { status, data:{...} }
    const u = data?.data ?? {}
    profile.value = {
      name:          u.name,
      email:         u.email,
      position_name: u.position?.position_name,
    }
  } catch (e) { console.error('profile', e) }
}
onMounted(loadProfile)

/* toast + modal ---------------------------------------------- */
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

/* logout ------------------------------------------------------ */
async function confirmLogout () {
  confirmOpen.value = false
  try {
    await api.post('/logout')
    localStorage.removeItem('token')
    showToast('Logout berhasil!')
    setTimeout(() => router.push('/login'), 1200)
  } catch (e) {
    console.error(e)
    showToast('Gagal logout', false)
  }
}

/* menu list --------------------------------------------------- */
const navItems = [
  { id: 'dashboard',  path: '/dashboard',            name: 'Dashboard',           desc:'Ringkasan',        icon: UsersIcon },
  { id: 'employees',  path: '/dashboard/employees',  name: 'Management Karyawan', desc:'Data karyawan',    icon: UsersIcon },
  { id: 'requests',   path: '/dashboard/requests',   name: 'Management Request',  desc:'Permohonan & cuti',icon: ClipboardDocumentCheckIcon },
  { id: 'attendance', path: '/dashboard/attendance', name: 'Management Absensi',  desc:'Riwayat kehadiran',icon: CalendarDaysIcon },
]

</script>

<template>
  <div class="flex min-h-screen text-slate-900 dark:text-slate-100
              bg-gradient-to-tr from-slate-50 via-slate-200 to-slate-300
              dark:from-[#061325] dark:via-[#0e1a2f] dark:to-black">

    <!-- ░░ Sidebar ░░ -->
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
      <div class="mx-4 mb-6 rounded-2xl bg-gradient-to-tr from-indigo-50/60
                  to-transparent dark:from-white/10 p-4 ring-1 ring-indigo-100
                  dark:ring-white/10">
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
        <router-link v-for="item in navItems" :key="item.id" :to="item.path"
                     class="group relative flex w-full items-start gap-3 overflow-hidden
                            rounded-lg px-4 py-3 text-sm font-medium"
                     :class="active===item.id
                             ? 'text-indigo-800 dark:text-indigo-200'
                             : 'text-slate-700 dark:text-slate-300'">
          <span class="absolute left-0 top-0 h-full w-1 rounded-r bg-indigo-500
                       transition-transform duration-300"
                :class="[active===item.id?'translate-x-0':'-translate-x-full',
                         'group-hover:translate-x-0']"/>
          <span class="absolute inset-0 z-0 rounded-lg bg-indigo-100/50 dark:bg-white/10
                       backdrop-blur-sm opacity-0 scale-95 transition-all duration-300"
                :class="active===item.id
                         ? 'opacity-100 scale-100'
                         : 'group-hover:opacity-100 group-hover:scale-100'"/>
          <component :is="item.icon"
                     class="relative z-10 h-5 w-5 flex-shrink-0
                            transition-transform duration-300 group-hover:scale-110"
                     :class="active===item.id?'text-indigo-500':''"/>
          <span class="relative z-10 flex flex-col">
            <span class="truncate">{{ item.name }}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ item.desc }}</span>
          </span>
        </router-link>
      </nav>
    </aside>

    <!-- ░░ Main ░░ -->
    <div class="flex flex-1 flex-col md:ml-72">

      <!-- top-bar -->
      <header class="sticky top-0 z-20 flex items-center gap-4
                     bg-white/60 dark:bg-[#0E1A2F]/80 backdrop-blur-md
                     px-4 md:px-8 py-3 shadow">
        <button class="md:hidden" @click="menuOpen=!menuOpen">
          <Bars3Icon v-if="!menuOpen" class="h-7 w-7"/>
          <XMarkIcon  v-else class="h-7 w-7"/>
        </button>
        <h2 class="flex-1 text-lg font-semibold capitalize tracking-tight">
          {{ active.replace('-', ' ') }}
        </h2>
        <button @click="toggleDark()"
                class="rounded-full p-2 hover:bg-indigo-100 dark:hover:bg-white/10">
          <SunIcon v-if="isDark" class="h-5 w-5"/>
          <MoonIcon v-else class="h-5 w-5"/>
        </button>
      </header>

      <!-- halaman anak -->
      <RouterView/>
    </div>

    <!-- modal & toast (tetap) -->
    <transition name="fade">
      <div v-if="confirmOpen"
           class="fixed inset-0 z-[999] flex items-center justify-center
                  bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-xs rounded-2xl bg-white p-6 text-center
                    dark:bg-[#1c2738] shadow-xl">
          <p class="text-lg font-semibold text-slate-700 dark:text-slate-100">
            Keluar dari akun?
          </p>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Anda akan kembali ke halaman login.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm
                           hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-white/10"
                    @click="confirmOpen=false">Batal</button>
            <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white
                           hover:bg-red-700"
                    @click="confirmLogout">Logout</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="slide-fade">
      <div v-if="toastShow"
           class="fixed bottom-6 right-6 z-[998] flex items-center gap-3
                  rounded-lg px-4 py-3 shadow-lg text-sm text-white"
           :class="toastOk?'bg-emerald-600':'bg-red-600'">
        <svg v-if="toastOk" xmlns="http://www.w3.org/2000/svg"
             class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg"
             class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span>{{ toastMsg }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .25s}
.fade-enter-from,.fade-leave-to{opacity:0}
.slide-fade-enter-active,.slide-fade-leave-active{transition:all .35s}
.slide-fade-enter-from,.slide-fade-leave-to{opacity:0;transform:translateY(10px)}
</style>
