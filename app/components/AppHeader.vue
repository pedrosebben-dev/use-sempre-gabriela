<script setup lang="ts">
const cart = useCartStore()
const count = computed(() => cart.count)
const openCart = () => { cart.drawerOpen = true }
const mobileOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { mobileOpen.value = false })

const links = [
  { label: 'Coleção', to: '/produtos' },
  ...CATEGORIES.map(c => ({ label: c.label, to: `/produtos?category=${c.value}` }))
]
</script>

<template>
  <div class="announce">
    <div class="container">
      <span><i class="pi pi-truck" /> Frete grátis acima de {{ formatBRL(FREE_SHIPPING_FROM) }}</span>
      <span class="hide-sm"><i class="pi pi-qrcode" /> {{ PIX_DISCOUNT * 100 }}% off no Pix</span>
      <span class="hide-sm"><i class="pi pi-credit-card" /> Até {{ MAX_INSTALLMENTS }}x sem juros</span>
    </div>
  </div>
  <header class="header">
    <div class="container bar">
      <Button
        class="menu-btn" icon="pi pi-bars" text rounded aria-label="Abrir menu"
        @click="mobileOpen = true"
      />
      <BrandLogo :size="42" />
      <nav class="nav" aria-label="Principal">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
      </nav>
      <div class="actions">
        <Button
          as="a" href="https://www.instagram.com/use.sempregabriela/" target="_blank" rel="noopener"
          icon="pi pi-instagram" text rounded aria-label="Instagram" class="hide-sm"
        />
        <OverlayBadge v-if="count" :value="count" size="small">
          <Button icon="pi pi-shopping-bag" text rounded aria-label="Abrir sacola" @click="openCart" />
        </OverlayBadge>
        <Button v-else icon="pi pi-shopping-bag" text rounded aria-label="Abrir sacola" @click="openCart" />
      </div>
    </div>
  </header>

  <Drawer v-model:visible="mobileOpen" header="Menu" position="left" class="mobile-drawer">
    <nav class="mobile-nav">
      <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
      <NuxtLink to="/trocas">Trocas e devoluções</NuxtLink>
      <NuxtLink to="/sobre">Sobre a marca</NuxtLink>
    </nav>
  </Drawer>
</template>

<style scoped>
.announce { background: var(--sg-ink); color: var(--sg-cream); font-size: .8rem; }
.announce .container { display: flex; justify-content: center; gap: 32px; padding-top: 8px; padding-bottom: 8px; }
.announce i { font-size: .8rem; margin-right: 6px; color: var(--sg-peach); }
.header { position: sticky; top: 0; z-index: 50; background: rgb(255 250 245 / .9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--sg-line); }
.bar { display: flex; align-items: center; gap: 24px; height: 72px; }
.nav { display: flex; gap: 26px; margin-left: auto; font-weight: 500; font-size: .95rem; }
.nav a { position: relative; padding: 4px 0; }
.nav a::after { content: ''; position: absolute; left: 0; bottom: 0; width: 0; height: 2px; background: var(--sg-red); transition: width .2s; }
.nav a:hover::after { width: 100%; }
.actions { display: flex; align-items: center; gap: 4px; margin-left: 12px; }
.actions :deep(.p-button) { color: var(--sg-ink); }
.menu-btn { display: none; color: var(--sg-ink) !important; }
.mobile-nav { display: flex; flex-direction: column; gap: 4px; }
.mobile-nav a { padding: 12px 4px; border-bottom: 1px solid var(--sg-line); font-weight: 500; }
@media (max-width: 900px) {
  .nav { display: none; }
  .menu-btn { display: inline-flex; }
  .actions { margin-left: auto; }
  .bar { gap: 8px; }
}
@media (max-width: 640px) {
  .hide-sm { display: none; }
}
</style>
