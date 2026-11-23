<script setup lang="ts">
import type { Product } from '#shared/types'

const { data: products } = await useFetch<Product[]>('/api/products')
const bySlug = (slug: string) => products.value?.find(p => p.slug === slug)
const heroProducts = computed(() =>
  ['vestido-longo-rubi', 'vestido-longo-tulipa', 'vestido-longo-lirio-noite'].flatMap(s => bySlug(s) ?? [])
)
const categoryTiles = computed(() =>
  CATEGORIES.flatMap((c) => {
    const cover = products.value?.find(p => p.category === c.value)
    return cover ? [{ ...c, image: cover.images[0], color: cover.variants[0]?.colorHex }] : []
  })
)

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
          <p>Vestidos longos, lisos e estampados, escolhidos a dedo. Encontre sua próxima peça favorita — e receba em casa.</p>
          <div class="row wrap">
            <Button as="router-link" to="/produtos" label="Comprar agora" icon="pi pi-arrow-right" icon-pos="right" class="sg-cta btn-light" />
            <Button as="router-link" to="/produtos?category=florais" label="Ver florais" class="sg-cta btn-ghost" outlined />
          </div>
        </div>
        <div class="hero-art">
          <NuxtLink v-for="(p, i) in heroProducts" :key="p.id" :to="`/produto/${p.slug}`" class="shot" :class="`s${i}`">
            <ProductImage :src="p.images[0]" :alt="p.name" :color="p.variants[0]?.colorHex" sizes="(max-width: 760px) 50vw, 280px" eager />
          </NuxtLink>
          <span class="chip" aria-hidden="true"><i class="pi pi-heart-fill" /> {{ PIX_DISCOUNT * 100 }}% off no Pix</span>
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
          <span class="eyebrow">Estilos</span>
          <h2>Escolha por estilo</h2>
        </div>
      </div>
      <div class="cats">
        <NuxtLink v-for="c in categoryTiles" :key="c.value" :to="`/produtos?category=${c.value}`" class="cat">
          <ProductImage :src="c.image" :alt="c.label" :color="c.color" sizes="(max-width: 1000px) 50vw, 290px" />
          <span class="cat-label">{{ c.label }} <i class="pi pi-arrow-up-right" /></span>
        </NuxtLink>
      </div>
    </section>

    <!-- COLLECTION -->
    <section class="section container">
      <div class="head">
        <div>
          <span class="eyebrow">Chegou agora</span>
          <h2>A coleção</h2>
        </div>
        <NuxtLink to="/produtos" class="see-all">Ver tudo <i class="pi pi-arrow-right" /></NuxtLink>
      </div>
      <div class="grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- STORY BANNER -->
    <section class="section container">
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
.hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; align-items: center; min-height: 560px; padding-top: 56px; padding-bottom: 80px; }
.hero-copy { display: flex; flex-direction: column; gap: 20px; }
.kicker { display: inline-block; width: fit-content; background: rgb(255 255 255 / .18); padding: 6px 14px; border-radius: 999px; font-size: .8rem; font-weight: 600; letter-spacing: .06em; }
.hero h1 em { font-style: italic; color: var(--sg-cream); }
.hero p { font-size: 1.1rem; max-width: 46ch; opacity: .95; }
.btn-light.p-button { background: var(--sg-cream); color: var(--sg-red-deep); border-color: var(--sg-cream); }
.btn-light.p-button:not(:disabled):hover { background: #fff; color: var(--sg-red-deep); border-color: #fff; }
.btn-ghost.p-button { color: #fff; border-color: rgb(255 255 255 / .7); }
.btn-ghost.p-button:not(:disabled):hover { background: rgb(255 255 255 / .12); color: #fff; border-color: #fff; }

.hero-art { position: relative; width: 100%; max-width: 520px; aspect-ratio: 1 / .86; justify-self: center; }
.shot { position: absolute; display: block; border: 4px solid var(--sg-cream); border-radius: 22px; overflow: hidden; box-shadow: 0 18px 40px rgb(63 11 9 / .3); transition: transform .25s; }
.shot :deep(.pimg) { border-radius: 0; }
.s0 { left: 0; top: 17%; width: 43%; transform: rotate(-5deg); }
.s1 { left: 24%; top: 0; width: 52%; z-index: 2; }
.s2 { right: 0; top: 17%; width: 43%; transform: rotate(5deg); }
.s1:hover { transform: translateY(-4px); }
.chip { position: absolute; left: 50%; bottom: 5%; z-index: 3; transform: translateX(-50%); white-space: nowrap; background: var(--sg-cream); color: var(--sg-ink); padding: 10px 16px; border-radius: 999px; font-weight: 600; font-size: .85rem; box-shadow: 0 10px 30px rgb(0 0 0 / .15); }
.chip i { color: var(--sg-red); margin-right: 6px; }

.perks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: -40px; position: relative; }
.perk { display: flex; gap: 14px; align-items: flex-start; background: #fff; border: 1px solid var(--sg-line); border-radius: var(--sg-radius); padding: 20px; box-shadow: 0 10px 30px rgb(42 26 21 / .06); }
.perk i { font-size: 1.3rem; color: var(--sg-red); background: var(--sg-cream); padding: 10px; border-radius: 12px; }

.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 28px; }
.head h2 { margin-top: 6px; }
.see-all { color: var(--sg-red); font-weight: 600; white-space: nowrap; }
.see-all i { font-size: .8rem; margin-left: 4px; }

.cats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.cat { position: relative; display: block; border-radius: var(--sg-radius); overflow: hidden; transition: transform .25s; }
.cat:hover { transform: translateY(-4px); }
.cat-label {
  position: absolute; inset: auto 0 0; display: flex; justify-content: space-between; align-items: flex-end; gap: 8px;
  padding: 56px 16px 16px; color: #fff; font-family: var(--sg-display); font-size: 1.25rem; font-weight: 600;
  background: linear-gradient(transparent, rgb(20 10 8 / .75));
}
.cat-label i { font-size: .9rem; }

.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 36px 24px; }

.story { display: grid; grid-template-columns: 1.4fr .6fr; gap: 32px; align-items: center; background: var(--sg-ink); color: var(--sg-cream); border-radius: 28px; padding: 48px; }
.story > div { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
.story p { max-width: 60ch; opacity: .85; }
.eyebrow.light { color: var(--sg-peach); }
.story-logo { width: 100%; max-width: 220px; border-radius: 50%; justify-self: center; box-shadow: 0 20px 60px rgb(217 48 31 / .4); }

.insta { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 24px; padding-bottom: 40px; }
.insta > i { font-size: 2rem; color: var(--sg-red); }

@media (max-width: 1000px) {
  .cats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .perks { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .hero-grid { grid-template-columns: 1fr; min-height: 0; }
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 14px; }
  .story { grid-template-columns: 1fr; padding: 32px 24px; }
  .story-logo { max-width: 140px; justify-self: start; }
}
@media (max-width: 520px) {
  .perks { grid-template-columns: 1fr; }
}
</style>
