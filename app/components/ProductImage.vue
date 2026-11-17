<script setup lang="ts">
/** Mostra a foto da peça ou, enquanto as fotos não chegam, um placeholder na cor da variante. */
const props = withDefaults(defineProps<{ src?: string; alt: string; color?: string; ratio?: string }>(), {
  ratio: '4 / 5'
})
const bg = computed(() => props.color || '#f2672a')
</script>

<template>
  <div class="pimg" :style="{ aspectRatio: ratio }">
    <img v-if="src" :src="src" :alt="alt" loading="lazy">
    <div v-else class="ph" :style="{ '--c': bg }" role="img" :aria-label="alt">
      <span class="g">g.</span>
      <span class="lbl">foto em breve</span>
    </div>
  </div>
</template>

<style scoped>
.pimg { container-type: inline-size; position: relative; width: 100%; overflow: hidden; border-radius: var(--sg-radius); background: var(--sg-cream); }
.pimg img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
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
