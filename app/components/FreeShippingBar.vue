<script setup lang="ts">
const cart = useCartStore()
</script>

<template>
  <div class="fsb">
    <p v-if="cart.freeShippingRemaining > 0" class="small">
      Faltam <strong>{{ formatBRL(cart.freeShippingRemaining) }}</strong> para ganhar <strong>frete grátis</strong> 🚚
    </p>
    <p v-else class="small"><i class="pi pi-check-circle" /> Você ganhou <strong>frete grátis</strong> no PAC!</p>
    <ProgressBar :value="cart.freeShippingProgress" :show-value="false" style="height: 6px" />
  </div>
</template>

<style scoped>
.fsb { display: flex; flex-direction: column; gap: 8px; background: var(--sg-cream); padding: 12px 14px; border-radius: 12px; }
.fsb i { color: #2e7d32; }
</style>
