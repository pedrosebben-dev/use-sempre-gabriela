<script setup lang="ts">
withDefaults(defineProps<{ size?: number; light?: boolean; wordmark?: boolean }>(), {
  size: 40,
  light: false,
  wordmark: true
})
</script>

<template>
  <NuxtLink to="/" class="brand" :class="{ light }" aria-label="Sempre Gabriela — início">
    <img src="/logo-instagram.jpg" alt="" :width="size" :height="size" class="mark" :style="{ width: `${size}px`, height: `${size}px` }">
    <span v-if="wordmark" class="word">
      <small>sempre</small>
      <strong>Gabriela</strong>
    </span>
  </NuxtLink>
</template>

<style scoped>
.brand { display: inline-flex; align-items: center; gap: 10px; }
.mark { border-radius: 50%; box-shadow: 0 2px 10px rgb(217 48 31 / .25); }
.word { display: flex; flex-direction: column; line-height: 1; }
.word small { font-size: .7rem; letter-spacing: .3em; text-transform: uppercase; color: var(--sg-muted); font-weight: 600; }
.word strong { font-family: var(--sg-display); font-size: 1.45rem; font-weight: 600; color: var(--sg-red); letter-spacing: -0.01em; }
.light .word small { color: rgb(255 255 255 / .8); }
.light .word strong { color: #fff; }
</style>
