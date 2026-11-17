<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <NuxtLayout>
    <div class="container err">
      <span class="g">g.</span>
      <h1>{{ is404 ? 'Ops, essa peça sumiu da arara' : 'Algo deu errado' }}</h1>
      <p class="muted">{{ is404 ? 'A página que você procura não existe ou foi removida.' : error.statusMessage }}</p>
      <Button label="Voltar para a loja" @click="clearError({ redirect: '/produtos' })" />
    </div>
  </NuxtLayout>
</template>

<style scoped>
.err { text-align: center; padding: 100px 20px; display: grid; justify-items: center; gap: 14px; }
.g { font-family: var(--sg-display); font-size: 6rem; font-weight: 700; color: var(--sg-red); line-height: 1; }
</style>
