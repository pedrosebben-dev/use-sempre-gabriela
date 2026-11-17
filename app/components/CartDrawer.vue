<script setup lang="ts">
const cart = useCartStore()
function go(path: string) {
  cart.drawerOpen = false
  navigateTo(path)
}
</script>

<template>
  <Drawer v-model:visible="cart.drawerOpen" position="right" class="cart-drawer" :style="{ width: 'min(420px, 100vw)' }">
    <template #header>
      <h3>Sua sacola <span class="muted">({{ cart.count }})</span></h3>
    </template>

    <div v-if="!cart.lines.length" class="empty">
      <i class="pi pi-shopping-bag" />
      <p>Sua sacola está vazia.</p>
      <Button label="Ver a coleção" @click="go('/produtos')" />
    </div>

    <div v-else class="content">
      <FreeShippingBar />
      <div class="lines">
        <CartLineItem v-for="l in cart.lines" :key="l.sku" :line="l" compact />
      </div>
    </div>

    <template v-if="cart.lines.length" #footer>
      <div class="stack">
        <div class="row between">
          <span>Subtotal</span>
          <span class="price">{{ formatBRL(cart.subtotal) }}</span>
        </div>
        <p class="muted small">ou {{ formatBRL(cart.subtotal * (1 - PIX_DISCOUNT)) }} no Pix · frete calculado no checkout</p>
        <Button label="Finalizar compra" icon="pi pi-lock" class="w-full sg-cta" @click="go('/checkout')" />
        <Button label="Ver sacola completa" text class="w-full" @click="go('/carrinho')" />
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
.empty { display: grid; place-items: center; gap: 12px; text-align: center; padding: 60px 0; }
.empty i { font-size: 2.5rem; color: var(--sg-peach); }
.content { display: flex; flex-direction: column; gap: 8px; }
</style>
