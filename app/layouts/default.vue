<script setup lang="ts">
const { data: cfg } = useStoreConfig()
</script>

<template>
  <div class="layout">
    <p v-if="cfg.preview" class="preview-bar" role="status">
      Prévia da loja: nomes, preços, tamanhos e estoque ainda são exemplos.
    </p>
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
    <CartDrawer />
    <Toast position="top-center" />
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }
.preview-bar { background: var(--sg-peach); color: var(--sg-ink); text-align: center; font-size: .8rem; font-weight: 600; padding: 6px 16px; }
</style>
