<script setup lang="ts">
import type { Product } from '#shared/types'

const route = useRoute()
const router = useRouter()
const { data: products, status } = await useFetch<Product[]>('/api/products', { default: () => [] })

const categoryOptions = [{ label: 'Tudo', value: '' }, ...CATEGORIES]
const sortOptions = [
  { label: 'Destaques', value: 'featured' },
  { label: 'Menor preço', value: 'price-asc' },
  { label: 'Maior preço', value: 'price-desc' }
]
const sizeOptions = computed(() => [...new Set(products.value.flatMap(p => p.variants.map(v => v.size)))])

const category = computed({
  get: () => String(route.query.category || ''),
  set: v => router.replace({ query: { ...route.query, category: v || undefined } })
})
const sort = ref('featured')
const search = ref('')
const sizeFilter = ref<string[]>([])

const filtered = computed(() => {
  let list = [...products.value]
  if (category.value) list = list.filter(p => p.category === category.value)
  if (search.value.trim()) {
    const s = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(s))
  }
  if (sizeFilter.value.length) list = list.filter(p => p.variants.some(v => sizeFilter.value.includes(v.size) && v.stock > 0))
  if (sort.value === 'price-asc') list.sort((a, b) => a.price - b.price)
  if (sort.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  return list
})

const title = computed(() =>
  categoryOptions.find(c => c.value === category.value && c.value)?.label || 'Toda a coleção'
)
useSeoMeta({ title: () => `${title.value} | Sempre Gabriela` })
</script>

<template>
  <div class="container page">
    <Breadcrumb :home="{ icon: 'pi pi-home', url: '/' }" :model="[{ label: 'Loja', url: '/produtos' }, { label: title }]" class="crumbs" />
    <div class="top">
      <div>
        <h1>{{ title }}</h1>
        <p class="muted">{{ filtered.length }} {{ filtered.length === 1 ? 'peça' : 'peças' }}</p>
      </div>
      <IconField class="search">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Buscar peça" aria-label="Buscar peça" />
      </IconField>
    </div>

    <div class="filters">
      <SelectButton v-model="category" :options="categoryOptions" option-label="label" option-value="value" :allow-empty="false" class="cats" aria-label="Categoria" />
      <div class="row wrap">
        <MultiSelect v-model="sizeFilter" :options="sizeOptions" placeholder="Tamanho" :show-toggle-all="false" class="w-sel" />
        <Select v-model="sort" :options="sortOptions" option-label="label" option-value="value" class="w-sel" aria-label="Ordenar" />
      </div>
    </div>

    <div v-if="status === 'pending'" class="grid">
      <Skeleton v-for="i in 8" :key="i" height="380px" border-radius="18px" />
    </div>
    <div v-else-if="filtered.length" class="grid">
      <ProductCard v-for="p in filtered" :key="p.id" :product="p" />
    </div>
    <div v-else class="empty">
      <i class="pi pi-search" />
      <p>Nenhuma peça encontrada com esses filtros.</p>
      <Button label="Limpar filtros" text @click="() => { search = ''; sizeFilter = []; category = '' }" />
    </div>
  </div>
</template>

<style scoped>
.crumbs { background: transparent; padding: 0 0 16px; }
.top { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.filters { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin: 28px 0; padding: 14px 0; border-top: 1px solid var(--sg-line); border-bottom: 1px solid var(--sg-line); }
.cats { flex-wrap: wrap; }
.w-sel { min-width: 170px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 36px 24px; }
.empty { text-align: center; padding: 80px 0; display: grid; gap: 10px; justify-items: center; }
.empty i { font-size: 2rem; color: var(--sg-peach); }
@media (max-width: 760px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 14px; }
  .cats { overflow-x: auto; flex-wrap: nowrap; max-width: 100%; }
  .search { width: 100%; }
  .search :deep(input) { width: 100%; }
}
</style>
