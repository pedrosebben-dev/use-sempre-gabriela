<script setup lang="ts">
const config = useRuntimeConfig()
const instagramUrl = `https://www.instagram.com/${config.public.instagram}/`
const whatsappUrl = `https://wa.me/${config.public.whatsapp}`
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container cols">
      <div class="stack about">
        <BrandLogo :size="48" light />
        <p>Moda para todas as suas versões. Peças escolhidas a dedo por Gabriela e Letícia, enviadas para todo o Brasil.</p>
        <div class="row">
          <Button
            as="a" :href="instagramUrl" target="_blank" rel="noopener"
            icon="pi pi-instagram" rounded outlined severity="contrast" aria-label="Instagram"
          />
          <Button
            as="a" :href="whatsappUrl" target="_blank" rel="noopener"
            icon="pi pi-whatsapp" rounded outlined severity="contrast" aria-label="WhatsApp"
          />
        </div>
      </div>
      <div class="stack">
        <h4>Loja</h4>
        <NuxtLink v-for="c in CATEGORIES" :key="c.value" :to="`/produtos?category=${c.value}`">{{ c.label }}</NuxtLink>
        <NuxtLink to="/produtos">Ver tudo</NuxtLink>
      </div>
      <div class="stack">
        <h4>Ajuda</h4>
        <NuxtLink to="/trocas">Trocas e devoluções</NuxtLink>
        <NuxtLink to="/trocas#entrega">Prazos de entrega</NuxtLink>
        <NuxtLink to="/trocas#pagamento">Formas de pagamento</NuxtLink>
        <NuxtLink to="/sobre">Sobre a marca</NuxtLink>
      </div>
      <div class="stack">
        <h4>Pagamento seguro</h4>
        <div class="pay">
          <span><i class="pi pi-qrcode" /> Pix</span>
          <span><i class="pi pi-credit-card" /> Cartão</span>
          <span><i class="pi pi-barcode" /> Boleto</span>
        </div>
        <p class="small">Processado pelo Mercado Pago. Entregas pelos Correios (PAC e SEDEX).</p>
      </div>
    </div>
    <div class="legal-band">
      <address class="container legal">
        <span>© {{ year }} {{ STORE.name }}</span>
        <span>{{ STORE.legalName }} · CNPJ {{ STORE.cnpj }}</span>
        <span>{{ storeAddressLine() }}</span>
        <span>
          <a :href="`mailto:${STORE.email}`">{{ STORE.email }}</a> ·
          <a :href="`tel:+${STORE.whatsapp}`">{{ STORE.phone }}</a>
        </span>
      </address>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--sg-gradient); color: #fff; margin-top: 40px; }
.cols { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 40px; padding-top: 56px; padding-bottom: 40px; }
.about p { max-width: 34ch; opacity: .9; }
h4 { margin: 0 0 4px; font-size: .8rem; letter-spacing: .14em; text-transform: uppercase; opacity: .85; }
a { opacity: .95; }
a:hover { text-decoration: underline; }
.pay { display: flex; flex-wrap: wrap; gap: 8px; }
.pay span { background: rgb(255 255 255 / .16); padding: 6px 12px; border-radius: 999px; font-size: .85rem; }
.pay i { margin-right: 4px; }
.small { opacity: .85; }
.legal-band { background: var(--sg-ink); color: var(--sg-cream); }
.legal { display: flex; flex-direction: column; gap: 4px; padding-top: 18px; padding-bottom: 24px; font-size: .8rem; font-style: normal; overflow-wrap: anywhere; }
:deep(.p-button-outlined) { color: #fff; border-color: rgb(255 255 255 / .6); }
@media (max-width: 860px) { .cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .cols { grid-template-columns: 1fr; } }
</style>
