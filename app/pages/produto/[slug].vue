<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type { Product } from '#shared/types'

const route = useRoute()
const toast = useToast()
const cart = useCartStore()
const { public: publicConfig } = useRuntimeConfig()
const whatsappUrl = `https://wa.me/${publicConfig.whatsapp}`

const { data: product, error } = await useFetch<Product>(`/api/products/${route.params.slug}`)
if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado', fatal: true })
}
const p = product as Ref<Product>

const colors = computed(() => [...new Map(p.value.variants.map(v => [v.color, v.colorHex])).entries()])
const color = ref(colors.value[0]?.[0] || '')
const size = ref<string | null>(null)
const quantity = ref(1)
const activeImage = ref(0)

const sizesForColor = computed(() => p.value.variants.filter(v => v.color === color.value))
const variant = computed(() => sizesForColor.value.find(v => v.size === size.value) || null)
const colorHex = computed(() => colors.value.find(([c]) => c === color.value)?.[1])
watch(color, () => {
  if (!sizesForColor.value.some(v => v.size === size.value && v.stock > 0)) size.value = null
})

const installments = computed(() => maxInstallmentsFor(p.value.price))
const pixPrice = computed(() => p.value.price * (1 - PIX_DISCOUNT))
const shippingItems = computed(() => {
  const v = variant.value || sizesForColor.value.find(x => x.stock > 0)
  return v ? [{ productId: p.value.id, sku: v.sku, quantity: quantity.value }] : []
})

const sizeError = ref(false)
function addToCart() {
  if (!variant.value) {
    sizeError.value = true
    toast.add({ severity: 'warn', summary: 'Escolha o tamanho', life: 2500 })
    return
  }
  cart.add(p.value, variant.value, quantity.value)
}

const { data: allProducts } = await useFetch<Product[]>('/api/products')
// primeiro as do mesmo estilo, depois completa com o resto da coleção
const related = computed(() => {
  const sameStyle = (x: Product) => Number(x.category === p.value.category)
  return (allProducts.value || []).filter(x => x.id !== p.value.id).sort((a, b) => sameStyle(b) - sameStyle(a)).slice(0, 4)
})

useSeoMeta({
  title: () => `${p.value.name} | Sempre Gabriela`,
  description: () => p.value.description,
  ogImage: () => `${publicConfig.siteUrl}${p.value.images[0] || '/logo-instagram.jpg'}`
})
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: p.value.name, description: p.value.description,
      image: p.value.images.map(src => `${publicConfig.siteUrl}${src}`),
      // preço de exemplo não vai para o Google
      ...(p.value.confirmed && { offers: { '@type': 'Offer', priceCurrency: 'BRL', price: p.value.price, availability: 'https://schema.org/InStock' } })
    })
  }]
})
</script>

<template>
  <div class="container page">
    <Breadcrumb
      :home="{ icon: 'pi pi-home', url: '/' }"
      :model="[{ label: 'Loja', url: '/produtos' }, { label: categoryLabel(p.category), url: `/produtos?category=${p.category}` }, { label: p.name }]"
      class="crumbs"
    />

    <div class="pdp">
      <!-- GALERIA -->
      <div class="gallery" :class="{ single: p.images.length < 2 }">
        <div v-if="p.images.length > 1" class="thumbs">
          <button
            v-for="(img, i) in p.images" :key="img"
            class="thumb" :class="{ active: activeImage === i }" :aria-label="`Foto ${i + 1}`" @click="activeImage = i"
          >
            <ProductImage :src="img" :alt="`${p.name}, foto ${i + 1}`" :color="colorHex" sizes="84px" />
          </button>
        </div>
        <ProductImage :src="p.images[activeImage]" :alt="p.name" :color="colorHex" class="main-img" sizes="(max-width: 900px) 100vw, 600px" eager />
      </div>

      <!-- INFO -->
      <div class="info">
        <div class="row wrap">
          <Tag v-if="p.isNew" value="Novidade" rounded />
          <Tag v-if="p.isBestSeller" value="Mais vendido" severity="warn" rounded />
        </div>
        <h1>{{ p.name }}</h1>
        <div class="prices">
          <div class="row">
            <span class="price big">{{ formatBRL(p.price) }}</span>
            <span v-if="p.compareAtPrice" class="price-old">{{ formatBRL(p.compareAtPrice) }}</span>
          </div>
          <p class="muted">ou {{ installments }}x de {{ formatBRL(p.price / installments) }} sem juros</p>
          <p class="pix"><i class="pi pi-qrcode" /> <strong>{{ formatBRL(pixPrice) }}</strong> no Pix ({{ PIX_DISCOUNT * 100 }}% off)</p>
        </div>

        <Divider />

        <div class="opt">
          <span class="lbl">Cor: <strong>{{ color }}</strong></span>
          <div class="row wrap">
            <button
              v-for="[name, hex] in colors" :key="name" class="swatch" :class="{ on: color === name }"
              :style="{ background: hex }" :aria-label="name" :aria-pressed="color === name" @click="color = name"
            />
          </div>
        </div>

        <div class="opt">
          <div class="row between">
            <span class="lbl">Tamanho: <strong>{{ size || '—' }}</strong></span>
            <a :href="whatsappUrl" target="_blank" rel="noopener" class="small link">Dúvida no tamanho?</a>
          </div>
          <div class="row wrap">
            <button
              v-for="v in sizesForColor" :key="v.sku" class="size" :class="{ on: size === v.size, err: sizeError && !size }"
              :disabled="v.stock === 0" @click="size = v.size; sizeError = false"
            >
              {{ v.size }}
            </button>
          </div>
          <small v-if="variant && variant.stock <= 2" class="low">Restam só {{ variant.stock }} peças nesse tamanho!</small>
        </div>

        <div class="buy row">
          <InputNumber
            v-model="quantity" show-buttons button-layout="horizontal" :min="1" :max="variant?.stock || 10"
            input-class="qty" increment-button-icon="pi pi-plus" decrement-button-icon="pi pi-minus" aria-label="Quantidade"
          />
          <Button label="Adicionar à sacola" icon="pi pi-shopping-bag" class="sg-cta grow" @click="addToCart" />
        </div>

        <div class="card ship-card">
          <ShippingCalculator :items="shippingItems" />
        </div>

        <Accordion :value="['0']" multiple>
          <AccordionPanel value="0">
            <AccordionHeader>Descrição</AccordionHeader>
            <AccordionContent>
              <p>{{ p.description }}</p>
              <ul class="details">
                <li v-for="d in p.details" :key="d">{{ d }}</li>
              </ul>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="1">
            <AccordionHeader>Medidas</AccordionHeader>
            <AccordionContent>
              <p>
                A tabela de medidas desta peça ainda vai ser publicada. Em dúvida no tamanho?
                <a :href="whatsappUrl" target="_blank" rel="noopener" class="link">Chama a gente no WhatsApp</a>.
              </p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="2">
            <AccordionHeader>Trocas e devoluções</AccordionHeader>
            <AccordionContent>
              <p>Primeira troca grátis em até 7 dias após o recebimento. A peça precisa estar com etiqueta e sem sinais de uso. <NuxtLink to="/trocas" class="link">Saiba mais</NuxtLink>.</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </div>

    <section v-if="related.length" class="related">
      <h2>Combina com você</h2>
      <div class="grid">
        <ProductCard v-for="r in related" :key="r.id" :product="r" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.crumbs { background: transparent; padding: 0 0 20px; }
.pdp { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 48px; align-items: start; }
.gallery { display: grid; grid-template-columns: 84px minmax(0, 1fr); gap: 14px; position: sticky; top: 96px; }
.thumbs { display: flex; flex-direction: column; gap: 10px; }
.thumb { padding: 0; border: 2px solid transparent; border-radius: 14px; background: none; cursor: pointer; }
.thumb.active { border-color: var(--sg-red); }
.gallery.single { grid-template-columns: minmax(0, 1fr); }
.thumb :deep(.pimg) { border-radius: 12px; }
.info { display: flex; flex-direction: column; gap: 16px; }
.info h1 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); }
.prices { display: flex; flex-direction: column; gap: 4px; }
.big { font-size: 1.7rem; }
.pix { color: #1b7a55; }
.opt { display: flex; flex-direction: column; gap: 10px; }
.lbl { font-size: .92rem; }
.swatch { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 1px var(--sg-line); cursor: pointer; }
.swatch.on { box-shadow: 0 0 0 2px var(--sg-red); }
.size { min-width: 52px; height: 44px; border-radius: 12px; border: 1px solid var(--sg-line); background: #fff; font-weight: 600; cursor: pointer; font-family: inherit; color: var(--sg-ink); }
.size:hover:not(:disabled) { border-color: var(--sg-ink); }
.size.on { background: var(--sg-ink); color: #fff; border-color: var(--sg-ink); }
.size.err { border-color: var(--sg-red); }
.size:disabled { opacity: .35; text-decoration: line-through; cursor: not-allowed; }
.low { color: var(--sg-red); font-weight: 600; }
.buy { align-items: stretch; }
.grow { flex: 1; }
:deep(.qty) { width: 3rem; text-align: center; }
.ship-card { padding: 18px; }
.link { color: var(--sg-red); text-decoration: underline; }
.details { padding-left: 18px; margin: 12px 0 0; }
.related { margin-top: 80px; }
.related h2 { margin-bottom: 24px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px 20px; }
@media (max-width: 900px) {
  .pdp { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .gallery { position: static; grid-template-columns: minmax(0, 1fr); }
  .thumbs { flex-direction: row; order: 2; }
  .thumbs { overflow-x: auto; }
  .thumb { width: 72px; flex: none; }
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 14px; }
}
</style>
