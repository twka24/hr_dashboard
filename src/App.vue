<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <!-- Jika bukan halaman Dashboard, render langsung tanpa transition -->
    <component
      v-if="route.name !== 'DashboardHome'"
      :is="Component"
      :key="route.fullPath"
    />

    <!-- Hanya untuk halaman Dashboard (route.name === 'Dashboard'), pakai transition -->
    <transition
      v-else
      name="page-slide"
      mode="out-in"
      appear
    >
      <component
        :is="Component"
        :key="route.fullPath"
      />
    </transition>
  </RouterView>
</template>

<style>
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.page-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}
</style>
