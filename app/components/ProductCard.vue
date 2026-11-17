<script setup lang="ts">
import type { Product } from '#shared/types'

const props = defineProps<{ product: Product }>()
const colors = computed(() => [...new Map(props.product.variants.map(v => [v.color, v.colorHex])).entries()])
const installments = computed(() => maxInstallmentsFor(props.product.price))
const discountPct = computed(() =>
  props.product.compareAtPrice ? Math.round((1 - props.product.price / props.product.compareAtPrice) * 100) : 0
)
</script>

<template>
  <NuxtLink :to="`/produto/${product.slug}`" class="pcard">
    <div class="media">
      <ProductImage :src="product.images[0]" :alt="product.name" :color="colors[0]?.[1]" />
      <div class="badges">
        <Tag v-if="discountPct" :value="`-${discountPct}%`" severity="danger" rounded />
        <Tag v-else-if="product.isNew" value="Novidade" rounded class="tag-new" />
      </div>
    </div>
    <div class="info">
      <h3>{{ product.name }}</h3>
      <div class="row prices">
        <span class="price">{{ formatBRL(product.price) }}</span>
        <span v-if="product.compareAtPrice" class="price-old">{{ formatBRL(product.compareAtPrice) }}</span>
      </div>
      <p class="muted small">
        {{ installments }}x de {{ formatBRL(product.price / installments) }} sem juros
      </p>
      <div class="swatches" aria-label="Cores disponíveis">
        <span v-for="[name, hex] in colors" :key="name" class="sw" :style="{ background: hex }" :title="name" />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.pcard { display: flex; flex-direction: column; gap: 14px; }
.media { position: relative; }
.pcard:hover :deep(img) { transform: scale(1.04); }
.badges { position: absolute; top: 12px; left: 12px; }
.tag-new { background: var(--sg-ink); color: #fff; }
.info { display: flex; flex-direction: column; gap: 4px; }
.info h3 { font-family: var(--sg-sans); font-weight: 600; font-size: 1rem; }
.prices { gap: 8px; }
.swatches { display: flex; gap: 6px; margin-top: 4px; }
.sw { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgb(0 0 0 / .12); }
</style>
