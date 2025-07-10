<!-- src/pages/settings/Index.vue -->
<template>
  <div class="flex h-full">
    <aside class="w-48 bg-white dark:bg-gray-800 border-r">
      <nav class="p-4 space-y-2">
        <RouterLink
          :to="{ name: 'SettingsPositions' }"
          class="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="isOnPositions
                    ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
                    : ''"
        >
          Positions
        </RouterLink>
      </nav>
    </aside>
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// true ketika route path-nya ada di bawah /dashboard/settings/positions
const isOnPositions = computed(() =>
  route.path.startsWith('/dashboard/settings/positions')
)
</script>

<style scoped>
/* opsional: styling sidebar tambahan */
</style>
