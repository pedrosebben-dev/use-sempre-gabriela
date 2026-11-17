<script setup lang="ts">
useSeoMeta({ title: 'Sobre a marca | Sempre Gabriela' })
</script>

<template>
  <div class="container page narrow">
    <img src="/logo-instagram.jpg" alt="Logo Sempre Gabriela" class="logo">
    <span class="eyebrow">Sobre nós</span>
    <h1>Tá, mas quem é Gabriela?</h1>
    <p class="lead">A Sempre Gabriela é moda feminina para todas as suas versões — a que trabalha, a que sai, a que descansa e a que se reinventa.</p>
    <p>Por trás da marca estão a Gabriela e a Letícia, que escolhem pessoalmente cada peça pensando em conforto, caimento e naquela sensação de "essa é a minha cara". Trabalhamos com coleções pequenas, reposição constante e um atendimento de amiga, direto pelo WhatsApp e Instagram.</p>
    <p class="muted small">(Texto provisório — substitua pela história real da marca.)</p>
    <div class="row wrap">
      <Button as="router-link" to="/produtos" label="Ver a coleção" />
      <Button as="a" href="https://www.instagram.com/use.sempregabriela/" target="_blank" rel="noopener" label="@use.sempregabriela" icon="pi pi-instagram" outlined />
    </div>
  </div>
</template>

<style scoped>
.narrow { max-width: 720px; display: flex; flex-direction: column; gap: 18px; }
.logo { width: 120px; border-radius: 50%; }
.lead { font-size: 1.2rem; }
</style>
