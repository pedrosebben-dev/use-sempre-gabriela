<script setup lang="ts">
import type { CartLine } from '~/stores/cart'

defineProps<{ line: CartLine; compact?: boolean }>()
const cart = useCartStore()
</script>

<template>
  <div class="line" :class="{ compact }">
    <NuxtLink :to="`/produto/${line.slug}`" class="thumb">
      <ProductImage :src="line.image" :alt="line.name" :color="line.colorHex" />
    </NuxtLink>
    <div class="body">
      <div class="row between top">
        <NuxtLink :to="`/produto/${line.slug}`" class="name">{{ line.name }}</NuxtLink>
        <Button icon="pi pi-trash" text rounded size="small" severity="secondary" aria-label="Remover" @click="cart.remove(line.sku)" />
      </div>
      <span class="muted small">{{ line.color }} · Tam. {{ line.size }}</span>
      <div class="row between">
        <InputNumber
          :model-value="line.quantity" show-buttons button-layout="horizontal" :min="1" :max="line.maxStock"
          input-class="qty-input" size="small" increment-button-icon="pi pi-plus" decrement-button-icon="pi pi-minus"
          :aria-label="`Quantidade de ${line.name}`"
          @update:model-value="v => cart.setQuantity(line.sku, Number(v))"
        />
        <span class="price">{{ formatBRL(line.price * line.quantity) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line { display: grid; grid-template-columns: 88px 1fr; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--sg-line); }
.compact { grid-template-columns: 72px 1fr; }
.thumb :deep(.pimg) { border-radius: 12px; }
.body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.top { align-items: flex-start; }
.name { font-weight: 600; }
:deep(.qty-input) { width: 2.6rem; text-align: center; padding-left: 0; padding-right: 0; }
</style>
