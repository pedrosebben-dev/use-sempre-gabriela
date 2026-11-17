<script setup lang="ts">
const cart = useCartStore()
useSeoMeta({ title: 'Sacola | Sempre Gabriela' })
</script>

<template>
  <div class="container page">
    <h1>Sua sacola</h1>

    <ClientOnly>
      <div v-if="!cart.lines.length" class="empty card">
        <i class="pi pi-shopping-bag" />
        <p>Sua sacola está vazia por enquanto.</p>
        <Button as="router-link" to="/produtos" label="Explorar a coleção" />
      </div>

      <div v-else class="layout">
        <div class="card">
          <CartLineItem v-for="l in cart.lines" :key="l.sku" :line="l" />
          <div class="row between foot">
            <Button as="router-link" to="/produtos" label="Continuar comprando" icon="pi pi-arrow-left" text />
            <Button label="Esvaziar sacola" text severity="secondary" @click="cart.clear()" />
          </div>
        </div>

        <aside class="stack">
          <div class="card stack">
            <FreeShippingBar />
            <ShippingCalculator :items="cart.apiItems" />
          </div>
          <div class="card stack">
            <div class="row between"><span>Subtotal</span><span class="price">{{ formatBRL(cart.subtotal) }}</span></div>
            <div class="row between pix"><span>No Pix ({{ PIX_DISCOUNT * 100 }}% off)</span><span class="price">{{ formatBRL(cart.subtotal * (1 - PIX_DISCOUNT)) }}</span></div>
            <p class="muted small">Ou em até {{ maxInstallmentsFor(cart.subtotal) }}x sem juros no cartão.</p>
            <Button as="router-link" to="/checkout" label="Finalizar compra" icon="pi pi-lock" class="sg-cta w-full" />
          </div>
        </aside>
      </div>
      <template #fallback>
        <Skeleton height="300px" border-radius="18px" />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
h1 { margin-bottom: 28px; }
.layout { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
.foot { margin-top: 12px; flex-wrap: wrap; }
.pix { color: #1b7a55; }
.empty { text-align: center; display: grid; justify-items: center; gap: 14px; padding: 60px 24px; }
.empty i { font-size: 2.4rem; color: var(--sg-peach); }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
</style>
