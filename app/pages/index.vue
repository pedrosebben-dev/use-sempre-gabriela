<script setup lang="ts">
import type { Product } from '#shared/types'

const { data: products } = await useFetch<Product[]>('/api/products')
const featured = computed(() => (products.value || []).filter(p => p.isBestSeller).slice(0, 4))
const news = computed(() => (products.value || []).filter(p => p.isNew).slice(0, 4))

const categories = [
  { label: 'Vestidos', slug: 'vestidos', color: '#C4532F' },
  { label: 'Conjuntos', slug: 'conjuntos', color: '#D8C3A5' },
  { label: 'Blusas', slug: 'blusas', color: '#E9A3A0' },
  { label: 'Saias', slug: 'saias', color: '#B5743C' },
  { label: 'Calças', slug: 'calcas', color: '#5B3A29' },
  { label: 'Macacões', slug: 'macacoes', color: '#1F2D4D' }
]

const perks = [
  { icon: 'pi pi-truck', title: 'Entrega para todo o Brasil', text: `PAC e SEDEX pelos Correios. Grátis acima de ${formatBRL(FREE_SHIPPING_FROM)}.` },
  { icon: 'pi pi-qrcode', title: `${PIX_DISCOUNT * 100}% off no Pix`, text: 'Aprovação na hora e desconto automático.' },
  { icon: 'pi pi-credit-card', title: `Até ${MAX_INSTALLMENTS}x sem juros`, text: 'Em todos os cartões de crédito.' },
  { icon: 'pi pi-refresh', title: 'Primeira troca grátis', text: 'Até 7 dias após o recebimento.' }
]

useSeoMeta({
  title: 'Sempre Gabriela | Moda feminina para todas as suas versões',
  ogTitle: 'Sempre Gabriela | Moda feminina'
})
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="kicker">Nova coleção · Verão 27</span>
          <h1>Moda para todas as suas <em>versões</em>.</h1>
          <p>Vestidos, conjuntos e peças-chave escolhidas a dedo. Encontre sua próxima peça favorita — e receba em casa.</p>
          <div class="row wrap">
            <Button as="router-link" to="/produtos" label="Comprar agora" icon="pi pi-arrow-right" icon-pos="right" class="sg-cta btn-light" />
            <Button as="router-link" to="/produtos?tag=novidades" label="Ver novidades" class="sg-cta btn-ghost" outlined />
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="blob">
            <span class="g">g.</span>
          </div>
          <div class="chip c1"><i class="pi pi-sparkles" /> chegou agora</div>
          <div class="chip c2"><i class="pi pi-heart-fill" /> {{ PIX_DISCOUNT * 100 }}% off no Pix</div>
        </div>
      </div>
    </section>

    <!-- PERKS -->
    <section class="perks container">
      <div v-for="p in perks" :key="p.title" class="perk">
        <i :class="p.icon" />
        <div>
          <strong>{{ p.title }}</strong>
          <p class="muted small">{{ p.text }}</p>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section container">
      <div class="head">
        <div>
          <span class="eyebrow">Categorias</span>
          <h2>Escolha por estilo</h2>
        </div>
      </div>
      <div class="cats">
        <NuxtLink v-for="c in categories" :key="c.slug" :to="`/produtos?category=${c.slug}`" class="cat" :style="{ '--c': c.color }">
          <span>{{ c.label }}</span>
          <i class="pi pi-arrow-up-right" />
        </NuxtLink>
      </div>
    </section>

    <!-- BEST SELLERS -->
    <section class="section container">
      <div class="head">
        <div>
          <span class="eyebrow">Mais amadas</span>
          <h2>As queridinhas da Gabi</h2>
        </div>
        <NuxtLink to="/produtos" class="see-all">Ver tudo <i class="pi pi-arrow-right" /></NuxtLink>
      </div>
      <div class="grid">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- STORY BANNER -->
    <section class="container">
      <div class="story">
        <div>
          <span class="eyebrow light">Sobre nós</span>
          <h2>Tá, mas quem é Gabriela?</h2>
          <p>A Sempre Gabriela nasceu da vontade de vestir mulheres reais em todas as suas fases: a do trabalho, a do rolê, a do domingo de sol. Cada peça passa pelas nossas mãos antes de chegar nas suas.</p>
          <Button as="router-link" to="/sobre" label="Conheça a marca" class="btn-light" />
        </div>
        <img src="/logo-instagram.jpg" alt="Logo Sempre Gabriela" class="story-logo">
      </div>
    </section>

    <!-- NEW -->
    <section class="section container">
      <div class="head">
        <div>
          <span class="eyebrow">Chegou agora</span>
          <h2>Novidades</h2>
        </div>
        <NuxtLink to="/produtos?tag=novidades" class="see-all">Ver novidades <i class="pi pi-arrow-right" /></NuxtLink>
      </div>
      <div class="grid">
        <ProductCard v-for="p in news" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- INSTAGRAM -->
    <section class="container insta">
      <i class="pi pi-instagram" />
      <h2>@use.sempregabriela</h2>
      <p class="muted">Looks, bastidores e o que acabou de chegar. Segue a gente!</p>
      <Button as="a" href="https://www.instagram.com/use.sempregabriela/" target="_blank" rel="noopener" label="Seguir no Instagram" outlined />
    </section>
  </div>
</template>

<style scoped>
.hero { background: var(--sg-gradient); color: #fff; overflow: hidden; }
.hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; min-height: 560px; padding-top: 56px; padding-bottom: 56px; }
.hero-copy { display: flex; flex-direction: column; gap: 20px; }
.kicker { display: inline-block; width: fit-content; background: rgb(255 255 255 / .18); padding: 6px 14px; border-radius: 999px; font-size: .8rem; font-weight: 600; letter-spacing: .06em; }
.hero h1 em { font-style: italic; color: var(--sg-cream); }
.hero p { font-size: 1.1rem; max-width: 46ch; opacity: .95; }
.btn-light.p-button { background: var(--sg-cream); color: var(--sg-red-deep); border-color: var(--sg-cream); }
.btn-light.p-button:not(:disabled):hover { background: #fff; color: var(--sg-red-deep); border-color: #fff; }
.btn-ghost.p-button { color: #fff; border-color: rgb(255 255 255 / .7); }
.btn-ghost.p-button:not(:disabled):hover { background: rgb(255 255 255 / .12); color: #fff; border-color: #fff; }

.hero-art { position: relative; display: grid; place-items: center; min-height: 380px; }
.blob {
  width: min(380px, 80%); aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 30% 30%, rgb(255 255 255 / .25), rgb(255 255 255 / .05) 60%);
  border: 1px solid rgb(255 255 255 / .35); box-shadow: inset 0 0 80px rgb(255 255 255 / .15);
  animation: float 6s ease-in-out infinite;
}
.g { font-family: var(--sg-sans); font-style: italic; font-weight: 700; font-size: clamp(7rem, 16vw, 12rem); color: var(--sg-cream); line-height: 1; letter-spacing: -0.04em; transform: translateY(-6%); }
.chip { position: absolute; background: var(--sg-cream); color: var(--sg-ink); padding: 10px 16px; border-radius: 999px; font-weight: 600; font-size: .85rem; box-shadow: 0 10px 30px rgb(0 0 0 / .15); }
.chip i { color: var(--sg-red); margin-right: 6px; }
.c1 { top: 12%; left: 4%; }
.c2 { bottom: 14%; right: 2%; }
@keyframes float { 50% { transform: translateY(-12px); } }

.perks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: -40px; position: relative; }
.perk { display: flex; gap: 14px; align-items: flex-start; background: #fff; border: 1px solid var(--sg-line); border-radius: var(--sg-radius); padding: 20px; box-shadow: 0 10px 30px rgb(42 26 21 / .06); }
.perk i { font-size: 1.3rem; color: var(--sg-red); background: var(--sg-cream); padding: 10px; border-radius: 12px; }

.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 28px; }
.head h2 { margin-top: 6px; }
.see-all { color: var(--sg-red); font-weight: 600; white-space: nowrap; }
.see-all i { font-size: .8rem; margin-left: 4px; }

.cats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.cat {
  display: flex; justify-content: space-between; align-items: flex-end; aspect-ratio: 3 / 4; padding: 18px;
  border-radius: var(--sg-radius); font-family: var(--sg-display); font-size: 1.25rem; font-weight: 600; color: #fff;
  background: linear-gradient(180deg, transparent 40%, rgb(0 0 0 / .35)), radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--c) 50%, #fff), var(--c));
  transition: transform .25s;
}
.cat:hover { transform: translateY(-4px); }
.cat i { font-size: .9rem; }

.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px 20px; }

.story { display: grid; grid-template-columns: 1.4fr .6fr; gap: 32px; align-items: center; background: var(--sg-ink); color: var(--sg-cream); border-radius: 28px; padding: 48px; }
.story > div { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.story p { max-width: 60ch; opacity: .85; }
.eyebrow.light { color: var(--sg-peach); }
.story-logo { width: 100%; max-width: 220px; border-radius: 50%; justify-self: center; box-shadow: 0 20px 60px rgb(217 48 31 / .4); }

.insta { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 24px; padding-bottom: 40px; }
.insta > i { font-size: 2rem; color: var(--sg-red); }

@media (max-width: 1000px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
  .cats { grid-template-columns: repeat(3, 1fr); }
  .perks { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .hero-grid { grid-template-columns: 1fr; min-height: 0; }
  .hero-art { min-height: 260px; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 24px 14px; }
  .story { grid-template-columns: 1fr; padding: 32px 24px; }
  .story-logo { max-width: 140px; justify-self: start; }
}
@media (max-width: 520px) {
  .perks { grid-template-columns: 1fr; }
  .cats { grid-template-columns: repeat(2, 1fr); }
}
</style>
