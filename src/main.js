import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import './assets/main.css'   // pastikan file ini ada

const app = createApp(App)

app.use(createPinia())  // ⬅️  daftar plugin setelah app dibuat
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
