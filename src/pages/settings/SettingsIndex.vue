<!-- src/pages/settings/Index.vue -->
<template>
  <div class="flex h-full">
    <aside class="w-48 bg-white dark:bg-gray-800 border-r">
      <nav class="p-4 space-y-2">
        <RouterLink
          :to="{ name: 'SettingsPositions' }"
          class="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="isActive('SettingsPositions') ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''"
        >
          Positions
        </RouterLink>
        <RouterLink
          :to="{ name: 'SettingsEmployees' }"
          class="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="isActive('SettingsEmployees') ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''"
        >
          Employees
        </RouterLink>
        <!-- … menu lain -->
      </nav>
    </aside>

    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

function isActive(name) {
  return route.name === name
}
</script>

<style scoped>
/* nothing to add */
</style>
