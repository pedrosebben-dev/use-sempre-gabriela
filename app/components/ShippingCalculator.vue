<script setup lang="ts">
import type { CartItem, ShippingOption } from '#shared/types'

/** Calculadora de frete dos Correios (PAC/SEDEX) para a página de produto e para a sacola. */
const props = defineProps<{ items: CartItem[] }>()
const checkout = useCheckoutStore()
const { data: cfg } = useStoreConfig()

const cep = ref(checkout.address.cep || '')
const loading = ref(false)
const error = ref('')
const options = ref<ShippingOption[]>([])

async function calc() {
  error.value = ''
  const digits = onlyDigits(cep.value)
  if (digits.length !== 8) {
    error.value = 'Digite um CEP com 8 números.'
    return
  }
  if (!props.items.length) {
    error.value = 'Escolha cor e tamanho primeiro.'
    return
  }
  loading.value = true
  try {
    const r = await $fetch<{ options: ShippingOption[] }>('/api/shipping/quote', {
      method: 'POST', body: { cep: digits, items: props.items }
    })
    options.value = r.options
    checkout.address.cep = digits // reaproveita no checkout
  } catch (e: any) {
    options.value = []
    error.value = e?.data?.statusMessage || 'Não foi possível calcular agora.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ship">
    <label for="ship-cep" class="small"><i class="pi pi-truck" /> Calcular frete e prazo</label>
    <form class="row" @submit.prevent="calc">
      <InputMask id="ship-cep" v-model="cep" mask="99999-999" placeholder="00000-000" class="cep" inputmode="numeric" />
      <Button type="submit" label="Calcular" outlined :loading="loading" />
    </form>
    <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener" class="small link">Não sei meu CEP</a>
    <small v-if="error" class="err">{{ error }}</small>
    <ul v-if="options.length" class="opts">
      <li v-for="o in options" :key="o.service">
        <span><strong>{{ o.name }}</strong> <span class="muted">· até {{ o.days }} dias úteis</span></span>
        <strong :class="{ free: o.price === 0 }">{{ o.price === 0 ? 'Grátis' : formatBRL(o.price) }}</strong>
      </li>
    </ul>
    <small v-if="options.length && cfg.shippingEstimated" class="muted">* valores estimados (modo demonstração)</small>
  </div>
</template>

<style scoped>
.ship { display: flex; flex-direction: column; gap: 8px; }
.ship label { font-weight: 600; }
.cep { flex: 1; max-width: 180px; }
.link { color: var(--sg-red); text-decoration: underline; width: fit-content; }
.err { color: var(--sg-red); }
.opts { list-style: none; margin: 4px 0 0; padding: 0; border: 1px solid var(--sg-line); border-radius: 12px; overflow: hidden; }
.opts li { display: flex; justify-content: space-between; padding: 10px 14px; font-size: .92rem; background: #fff; }
.opts li + li { border-top: 1px solid var(--sg-line); }
.free { color: #2e7d32; }
</style>
