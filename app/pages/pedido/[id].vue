<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type { Order } from '#shared/types'

const route = useRoute()
const toast = useToast()
const { data: order, refresh, error } = await useFetch<Order>(`/api/orders/${route.params.id}`)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado', fatal: true })

useSeoMeta({ title: 'Seu pedido | Sempre Gabriela', robots: 'noindex' })

const statusInfo = computed(() => {
  switch (order.value?.status) {
    case 'approved': return { label: 'Pagamento aprovado', severity: 'success', icon: 'pi pi-check-circle' }
    case 'in_process': return { label: 'Pagamento em análise', severity: 'warn', icon: 'pi pi-clock' }
    case 'rejected': return { label: 'Pagamento recusado', severity: 'danger', icon: 'pi pi-times-circle' }
    case 'cancelled': return { label: 'Pedido cancelado', severity: 'secondary', icon: 'pi pi-ban' }
    default: return { label: 'Aguardando pagamento', severity: 'info', icon: 'pi pi-hourglass' }
  }
})

// Atualiza o status a cada 5s enquanto o Pix/boleto estiver pendente
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (order.value?.status === 'pending' || order.value?.status === 'in_process') refresh()
    else clearInterval(timer)
  }, 5000)
})
onBeforeUnmount(() => clearInterval(timer))

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ severity: 'success', summary: 'Código copiado!', life: 2000 })
  } catch {
    toast.add({ severity: 'warn', summary: 'Não foi possível copiar', life: 2000 })
  }
}

const simulating = ref(false)
async function simulatePaid() {
  simulating.value = true
  await $fetch(`/api/orders/${route.params.id}/simulate-payment`, { method: 'POST' })
  await refresh()
  simulating.value = false
}

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '')
</script>

<template>
  <div v-if="order" class="container page narrow">
    <div class="hero card">
      <i :class="[statusInfo.icon, `st-${statusInfo.severity}`]" class="big-icon" />
      <h1 v-if="order.status === 'approved'">Obrigada, {{ order.customer.name.split(' ')[0] }}! 🧡</h1>
      <h1 v-else>Quase lá, {{ order.customer.name.split(' ')[0] }}!</h1>
      <p class="muted">Pedido <strong>#{{ order.id }}</strong> · {{ fmtDate(order.createdAt) }}</p>
      <Tag :value="statusInfo.label" :severity="statusInfo.severity as any" rounded />
      <Message v-if="order.demo" severity="info" :closable="false" size="small">Pedido de demonstração — nenhuma cobrança real foi feita.</Message>
    </div>

    <!-- PIX -->
    <section v-if="order.paymentMethod === 'pix' && order.pix && order.status === 'pending'" class="card pay">
      <h2>Pague com Pix</h2>
      <p class="muted">Abra o app do seu banco, escolha <strong>Pix → Ler QR Code</strong> ou <strong>Pix copia e cola</strong>.</p>
      <div class="qr">
        <img v-if="order.pix.qrCodeBase64" :src="`data:image/png;base64,${order.pix.qrCodeBase64}`" alt="QR Code Pix" width="220" height="220">
        <div v-else class="qr-demo" aria-label="QR Code de demonstração"><i class="pi pi-qrcode" /></div>
      </div>
      <div class="copy">
        <InputText :model-value="order.pix.qrCode" readonly aria-label="Código Pix copia e cola" />
        <Button label="Copiar" icon="pi pi-copy" @click="copy(order.pix!.qrCode)" />
      </div>
      <p class="muted small">Válido até {{ fmtDate(order.pix.expiresAt) }}. Esta página atualiza sozinha quando o pagamento for confirmado.</p>
      <Button v-if="order.demo" label="Simular pagamento (demo)" severity="secondary" outlined :loading="simulating" @click="simulatePaid" />
    </section>

    <!-- BOLETO -->
    <section v-if="order.paymentMethod === 'boleto' && order.boleto && order.status === 'pending'" class="card pay">
      <h2>Seu boleto</h2>
      <div v-if="order.boleto.barcode" class="copy">
        <InputText :model-value="order.boleto.barcode" readonly aria-label="Linha digitável" />
        <Button label="Copiar" icon="pi pi-copy" @click="copy(order.boleto!.barcode!)" />
      </div>
      <Button v-if="order.boleto.url !== '#'" as="a" :href="order.boleto.url" target="_blank" rel="noopener" label="Abrir boleto" icon="pi pi-external-link" />
      <p class="muted small">Vence em {{ fmtDate(order.boleto.expiresAt) }}. Compensação em até 2 dias úteis.</p>
      <Button v-if="order.demo" label="Simular pagamento (demo)" severity="secondary" outlined :loading="simulating" @click="simulatePaid" />
    </section>

    <section v-if="order.status === 'approved'" class="card next">
      <h2>Próximos passos</h2>
      <Timeline :value="['Pagamento aprovado', 'Separando suas peças com carinho', `Envio pelos Correios (${order.shipping.name})`, 'Chegou! Marca a gente no Insta 💕']" class="tl">
        <template #content="{ item, index }">
          <span :class="{ done: index === 0 }">{{ item }}</span>
        </template>
      </Timeline>
      <p class="muted small">Você vai receber o código de rastreio no e-mail <strong>{{ order.customer.email }}</strong>. Prazo: até {{ order.shipping.days }} dias úteis.</p>
    </section>

    <!-- RESUMO -->
    <section class="card">
      <h2>Resumo do pedido</h2>
      <div v-for="l in order.lines" :key="l.sku" class="row between line">
        <span>{{ l.quantity }}× {{ l.name }} <span class="muted small">({{ l.color }}, {{ l.size }})</span></span>
        <span>{{ formatBRL(l.unitPrice * l.quantity) }}</span>
      </div>
      <Divider />
      <div class="row between"><span>Subtotal</span><span>{{ formatBRL(order.subtotal) }}</span></div>
      <div v-if="order.discount" class="row between pix"><span>Desconto Pix</span><span>− {{ formatBRL(order.discount) }}</span></div>
      <div class="row between"><span>Frete {{ order.shipping.name }}</span><span>{{ order.shipping.price ? formatBRL(order.shipping.price) : 'Grátis' }}</span></div>
      <div class="row between total"><span>Total</span><span>{{ formatBRL(order.total) }}</span></div>
      <p v-if="order.installments && order.installments > 1" class="muted small">Pago em {{ order.installments }}x de {{ formatBRL(order.total / order.installments) }}</p>
      <Divider />
      <p class="small"><strong>Entrega em:</strong> {{ order.address.street }}, {{ order.address.number }}<span v-if="order.address.complement"> – {{ order.address.complement }}</span>, {{ order.address.neighborhood }}, {{ order.address.city }}/{{ order.address.state }} · CEP {{ order.address.cep }}</p>
    </section>

    <div class="row center-row">
      <Button as="router-link" to="/produtos" label="Continuar comprando" text icon="pi pi-arrow-left" />
    </div>
  </div>
</template>

<style scoped>
.narrow { max-width: 720px; display: flex; flex-direction: column; gap: 18px; }
.hero { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 24px; }
.big-icon { font-size: 2.8rem; }
.st-success { color: #1b7a55; }
.st-warn { color: #c77700; }
.st-danger { color: var(--sg-red); }
.st-info { color: var(--sg-orange); }
.pay { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.qr img { border-radius: 12px; border: 1px solid var(--sg-line); }
.qr-demo { width: 220px; height: 220px; display: grid; place-items: center; border-radius: 16px; background: var(--sg-cream); border: 2px dashed var(--sg-peach); }
.qr-demo i { font-size: 7rem; color: var(--sg-ink); opacity: .8; }
.copy { display: flex; gap: 8px; width: 100%; }
.copy :deep(input) { flex: 1; font-family: ui-monospace, monospace; font-size: .8rem; }
.next .tl { margin: 12px 0; }
.done { font-weight: 700; color: #1b7a55; }
:deep(.p-timeline-event-opposite) { display: none; }
h2 { font-family: var(--sg-sans); font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
.line { padding: 6px 0; }
.total { font-weight: 700; font-size: 1.15rem; margin-top: 6px; }
.pix { color: #1b7a55; }
.center-row { justify-content: center; }
</style>
