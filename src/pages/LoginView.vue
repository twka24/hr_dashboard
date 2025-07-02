<template>
  <!-- Dynamic night-sky gradient with brand colours (navy • red • black) -->
  <div
    class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#0e2d5c] to-black bg-[length:500%_500%] animate-bg-pan"
  >
    <!-- Floating crimson glow -->
    <motion-div
      class="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-[#d90429]/30 blur-3xl"
      :initial="{ y: -25 }"
      :animate="{ y: 20 }"
      :transition="{ repeat: Infinity, duration: 8, repeatType: 'reverse' }"
    />
    <!-- Floating navy glow -->
    <motion-div
      class="pointer-events-none absolute bottom-0 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#044eb5]/30 blur-3xl"
      :initial="{ x: 0, y: 0 }"
      :animate="{ x: -30, y: 30 }"
      :transition="{ repeat: Infinity, duration: 10, repeatType: 'reverse' }"
    />
    <!-- Spinning diamond accent -->
    <motion-div
      class="pointer-events-none absolute top-24 left-1/2 h-24 w-24 -translate-x-1/2 rotate-45 border-2 border-white/10 bg-white/5"
      :initial="{ rotate: 0 }"
      :animate="{ rotate: 360 }"
      :transition="{ repeat: Infinity, duration: 25, ease: 'linear' }"
    />

    <!-- Glassy login card -->
    <motion-div
      class="relative z-10 w-full max-w-lg rounded-3xl bg-white/90 backdrop-blur-md p-10 shadow-2xl md:p-14"
      :initial="{ opacity: 0, scale: 0.9 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } }"
    >
      <!-- Logo & heading -->
      <div class="mb-8 text-center">
        <img
          src="/logo_twka.jpg"
          alt="Company Logo"
          class="mx-auto mb-4 h-16 w-16 rounded-full object-contain shadow-lg ring-2 ring-[#0A1128]"
        />
        <h1 class="text-3xl font-extrabold tracking-wide text-[#0A1128]">
          HRD Dashboard
        </h1>
        <p class="mt-1 text-gray-600">
          Sign in to manage attendance & employees
        </p>
      </div>

      <!-- SUCCESS alert -->
      <transition name="fade-slide">
        <div
          v-if="successMsg"
          class="mb-6 flex items-center gap-3 rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{{ successMsg }}</span>
        </div>
      </transition>

      <!-- ERROR alert -->
      <transition name="fade-slide">
        <div
          v-if="errorMsg"
          class="mb-6 flex items-center gap-3 rounded-lg border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>{{ errorMsg }}</span>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-gray-700"
            >Email</label
          >
          <div class="relative">
            <UserIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="user@example.com"
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-[#044eb5] focus:ring-1 focus:ring-[#044eb5]"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label for="pass" class="mb-1 block text-sm font-medium text-gray-700"
            >Password</label
          >
          <div class="relative">
            <LockClosedIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              id="pass"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-[#044eb5] focus:ring-1 focus:ring-[#044eb5]"
            />
          </div>
        </div>

        <!-- Submit -->
       <button
  type="button"
  @click.prevent="handleSubmit"
  :disabled="loading"
  class="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-[#0A1128] to-[#d90429] py-3 font-semibold tracking-wide text-white shadow-md transition hover:shadow-xl focus:ring-2 focus:ring-[#d90429] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
>
          <span v-if="!loading">Login</span>
          <svg
            v-else
            class="mx-auto h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 018-8h-4l3 3 3-3h-4a8 8 0 01-8 8 8 8 0 01-8-8z"
            ></path>
          </svg>
        </button>
      </form>

      <!-- Quick stats (slide up) -->
      <motion-div
        class="mt-10 grid grid-cols-2 gap-6 text-center"
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, delay: 0.3 }"
      >
        <div>
          <p class="text-sm font-medium text-gray-400">Employees</p>
          <span class="mt-1 block text-lg font-extrabold text-[#044eb5]">128</span>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-400">Present Today</p>
          <span class="mt-1 block text-lg font-extrabold text-[#044eb5]">120</span>
        </div>
      </motion-div>

      <p class="mt-10 text-center text-xs text-gray-400">
        PT Towuti Karya Abadi v1.2 © 2025 Company
      </p>
    </motion-div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserIcon, LockClosedIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleSubmit() {
  errorMsg.value   = ''
  successMsg.value = ''
  loading.value    = true
 
  try {
    // 1) Panggil login
    const response = await api.post('/login', {
      email:    email.value,
      password: password.value,
    })

    // 2) Ambil token dari payload (sesuaikan path jika di-backend-mu berbeda)
    const token = response.data.data?.token || response.data.token
    if (!token) throw new Error('Token tidak ditemukan di response')

    // 3) Simpan & set default header untuk semua request berikutnya
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // 4) Tampilkan notifikasi sukses
    successMsg.value = 'Login berhasil! Mengalihkan…'

    // 5) Tunggu sebentar agar user sempat lihat pesan
    await new Promise(resolve => setTimeout(resolve, 1200))

    // 6) Navigasi ke dashboard
     window.location.href = '/dashboard'

  } catch (err) {
    // jika error dari server, tampilkan message-nya; kalau tidak, pakai fallback
    errorMsg.value =
      err.response?.data?.message ||
      err.message ||
      'Login gagal — periksa kembali email dan password.'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* Slow diagonal gradient movement */
@keyframes bg-pan {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}
.animate-bg-pan {
  animation: bg-pan 20s linear infinite;
}

/* Error / success fade-slide transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>