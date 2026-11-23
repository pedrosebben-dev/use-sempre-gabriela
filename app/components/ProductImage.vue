<script setup lang="ts">
/** Foto da peça (com versão menor para telas pequenas) ou um placeholder na cor da variante. */
const props = withDefaults(defineProps<{ src?: string; alt: string; color?: string; ratio?: string; sizes?: string; eager?: boolean }>(), {
  ratio: '3 / 4',
  sizes: '(max-width: 760px) 50vw, 400px',
  eager: false
})
const bg = computed(() => props.color || '#f2672a')
const srcset = computed(() =>
  props.src?.startsWith('/produtos/') && props.src.endsWith('.jpg')
    ? `${props.src.replace(/\.jpg$/, '-p.jpg')} 600w, ${props.src} 1200w`
    : undefined
)
</script>

<template>
  <div class="pimg" :style="{ aspectRatio: ratio }">
    <img v-if="src" :loading="eager ? 'eager' : 'lazy'" :sizes="sizes" :srcset="srcset" :src="src" :alt="alt">
    <div v-else class="ph" :style="{ '--c': bg }" role="img" :aria-label="alt">
      <span class="g">g.</span>
      <span class="lbl">foto em breve</span>
    </div>
  </div>
</template>

<style scoped>
.pimg { container-type: inline-size; position: relative; width: 100%; overflow: hidden; border-radius: var(--sg-radius); background: var(--sg-cream); }
.pimg img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 15%; transition: transform .5s ease; }
.ph {
  position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 4px;
  background:
    radial-gradient(90% 70% at 80% 100%, color-mix(in srgb, var(--c) 55%, transparent), transparent 70%),
    linear-gradient(160deg, var(--sg-cream), color-mix(in srgb, var(--c) 22%, var(--sg-cream)));
}
.g { font-family: var(--sg-sans); font-style: italic; font-size: clamp(2.5rem, 7vw, 4.5rem); font-weight: 700; color: color-mix(in srgb, var(--c) 70%, #2a1a15); opacity: .35; line-height: 1; }
@container (max-width: 140px) { .lbl { display: none; } .g { font-size: 2rem; } }
.lbl { font-size: .7rem; letter-spacing: .2em; text-transform: uppercase; color: var(--sg-muted); }
</style>
