<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import type { Order, PaymentMethod } from '#shared/types'

const cart = useCartStore()
const co = useCheckoutStore()
const toast = useToast()
const { data: cfg } = useStoreConfig()
const { tokenize, demo: mpDemo } = useMercadoPago()

useSeoMeta({ title: 'Finalizar compra | Sempre Gabriela', robots: 'noindex' })

const states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

// ------- CEP → endereço + frete -------
const cepInput = ref(co.address.cep)
async function onCep() {
  const digits = onlyDigits(cepInput.value)
  if (digits.length !== 8) return
  await co.lookupCep(digits)
  await co.quote(digits)
}
onMounted(() => { if (onlyDigits(cepInput.value).length === 8) onCep() })
watch(() => cart.apiItems, () => { if (co.address.cep) co.quote(co.address.cep) }, { deep: true })

// ------- totais (exibição; o servidor recalcula tudo) -------
const discount = computed(() => (co.paymentMethod === 'pix' ? round2(cart.subtotal * PIX_DISCOUNT) : 0))
const shippingPrice = computed(() => co.selectedShipping?.price ?? 0)
const total = computed(() => round2(cart.subtotal - discount.value + shippingPrice.value))

// ------- cartão -------
const card = reactive({ number: '', holder: '', expiry: '', cvv: '', installments: 1 })
const brand = computed(() => detectBrand(card.number))
const installmentOptions = computed(() => {
  const max = maxInstallmentsFor(total.value)
  return Array.from({ length: max }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}x de ${formatBRL(total.value / (i + 1))} sem juros`
  }))
})
watch(installmentOptions, (opts) => { if (card.installments > opts.length) card.installments = opts.length })

// ------- validação -------
const errors = ref<Record<string, string>>({})
function validate() {
  const e: Record<string, string> = {}
  const c = co.customer
  const a = co.address
  if (c.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = 'E-mail inválido'
  if (!isValidCPF(c.cpf)) e.cpf = 'CPF inválido'
  if (onlyDigits(c.phone).length < 10) e.phone = 'Telefone inválido'
  if (onlyDigits(cepInput.value).length !== 8) e.cep = 'CEP inválido'
  if (!a.street) e.street = 'Obrigatório'
  if (!a.number) e.number = 'Obrigatório'
  if (!a.neighborhood) e.neighborhood = 'Obrigatório'
  if (!a.city) e.city = 'Obrigatório'
  if (!a.state) e.state = 'Obrigatório'
  if (!co.selectedShipping) e.shipping = 'Escolha a forma de entrega'
  if (co.paymentMethod === 'card') {
    if (onlyDigits(card.number).length < 13) e.cardNumber = 'Número inválido'
    if (card.holder.trim().length < 3) e.cardHolder = 'Nome como está no cartão'
    const [mm, yy] = card.expiry.split('/').map(Number)
    const now = new Date()
    const exp = new Date(2000 + (yy || 0), mm || 0, 0)
    if (!mm || mm > 12 || exp < now) e.cardExpiry = 'Validade inválida'
    if (onlyDigits(card.cvv).length < 3) e.cardCvv = 'CVV inválido'
  }
  errors.value = e
  return !Object.keys(e).length
}

// ------- enviar -------
const submitting = ref(false)
async function placeOrder() {
  if (!validate()) {
    toast.add({ severity: 'warn', summary: 'Confira os campos destacados', life: 3000 })
    return
  }
  submitting.value = true
  try {
    let cardData
    if (co.paymentMethod === 'card') {
      const t = await tokenize({ ...card, cpf: co.customer.cpf })
      cardData = { ...t, installments: card.installments }
    }
    const order = await $fetch<Order>('/api/orders', {
      method: 'POST',
      body: {
        items: cart.apiItems,
        customer: co.customer,
        address: { ...co.address, cep: onlyDigits(cepInput.value) },
        shippingService: co.shippingService,
        paymentMethod: co.paymentMethod,
        card: cardData
      }
    })
    if (order.status === 'rejected') {
      toast.add({ severity: 'error', summary: 'Pagamento recusado', detail: 'Tente outro cartão ou pague com Pix.', life: 6000 })
      return
    }
    cart.clear()
    await navigateTo(`/pedido/${order.id}`)
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Não foi possível concluir', detail: e?.data?.statusMessage || e?.message, life: 6000 })
  } finally {
    submitting.value = false
  }
}

const methods: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'pix', label: 'Pix', icon: 'pi pi-qrcode' },
  { value: 'card', label: 'Cartão de crédito', icon: 'pi pi-credit-card' },
  { value: 'boleto', label: 'Boleto', icon: 'pi pi-barcode' }
]
</script>

<template>
  <div class="container page">
    <div class="row between head">
      <h1>Finalizar compra</h1>
      <span class="secure"><i class="pi pi-lock" /> Ambiente seguro</span>
    </div>

    <ClientOnly>
      <div v-if="!cart.lines.length" class="card empty">
        <p>Sua sacola está vazia.</p>
        <Button as="router-link" to="/produtos" label="Ver a coleção" />
      </div>

      <form v-else class="layout" novalidate @submit.prevent="placeOrder">
        <div class="stack main">
          <Message v-if="cfg.paymentsDemo || cfg.shippingEstimated" severity="info" :closable="false">
            <strong>Modo demonstração:</strong>
            <span v-if="cfg.paymentsDemo"> nenhum pagamento é cobrado de verdade.</span>
            <span v-if="cfg.shippingEstimated"> Frete calculado por tabela estimada.</span>
            Configure as chaves no <code>.env</code> para ativar Mercado Pago e Correios.
          </Message>

          <!-- 1. DADOS -->
          <section class="card">
            <h2 class="step"><span>1</span> Seus dados</h2>
            <div class="grid-form">
              <div class="field">
                <label for="name">Nome completo</label>
                <InputText id="name" v-model="co.customer.name" autocomplete="name" :invalid="!!errors.name" />
                <small v-if="errors.name" class="error">{{ errors.name }}</small>
              </div>
              <div class="field span-3">
                <label for="email">E-mail</label>
                <InputText id="email" v-model="co.customer.email" type="email" autocomplete="email" :invalid="!!errors.email" />
                <small v-if="errors.email" class="error">{{ errors.email }}</small>
              </div>
              <div class="field span-3">
                <label for="phone">Celular / WhatsApp</label>
                <InputMask id="phone" v-model="co.customer.phone" mask="(99) 99999-9999" autocomplete="tel" :invalid="!!errors.phone" />
                <small v-if="errors.phone" class="error">{{ errors.phone }}</small>
              </div>
              <div class="field span-3">
                <label for="cpf">CPF</label>
                <InputMask id="cpf" v-model="co.customer.cpf" mask="999.999.999-99" :invalid="!!errors.cpf" />
                <small v-if="errors.cpf" class="error">{{ errors.cpf }}</small>
              </div>
            </div>
          </section>

          <!-- 2. ENDEREÇO -->
          <section class="card">
            <h2 class="step"><span>2</span> Endereço de entrega</h2>
            <div class="grid-form">
              <div class="field span-2">
                <label for="cep">CEP</label>
                <IconField>
                  <InputMask id="cep" v-model="cepInput" mask="99999-999" autocomplete="postal-code" :invalid="!!errors.cep" @complete="onCep" @blur="onCep" />
                  <InputIcon v-if="co.cepLoading" class="pi pi-spin pi-spinner" />
                </IconField>
                <small v-if="errors.cep" class="error">{{ errors.cep }}</small>
              </div>
              <div class="field span-4">
                <label for="street">Rua</label>
                <InputText id="street" v-model="co.address.street" autocomplete="address-line1" :invalid="!!errors.street" />
              </div>
              <div class="field span-2">
                <label for="number">Número</label>
                <InputText id="number" v-model="co.address.number" :invalid="!!errors.number" />
              </div>
              <div class="field span-4">
                <label for="complement">Complemento <span class="muted">(opcional)</span></label>
                <InputText id="complement" v-model="co.address.complement" autocomplete="address-line2" />
              </div>
              <div class="field span-2">
                <label for="neighborhood">Bairro</label>
                <InputText id="neighborhood" v-model="co.address.neighborhood" :invalid="!!errors.neighborhood" />
              </div>
              <div class="field span-2">
                <label for="city">Cidade</label>
                <InputText id="city" v-model="co.address.city" autocomplete="address-level2" :invalid="!!errors.city" />
              </div>
              <div class="field span-2">
                <label for="state">Estado</label>
                <Select id="state" v-model="co.address.state" :options="states" placeholder="UF" :invalid="!!errors.state" />
              </div>
            </div>
          </section>

          <!-- 3. FRETE -->
          <section class="card">
            <h2 class="step"><span>3</span> Entrega pelos Correios</h2>
            <p v-if="!co.shippingOptions.length && !co.shippingLoading" class="muted">Digite seu CEP para ver as opções de entrega.</p>
            <div v-if="co.shippingLoading" class="stack">
              <Skeleton height="56px" border-radius="12px" />
              <Skeleton height="56px" border-radius="12px" />
            </div>
            <div v-else class="stack">
              <label v-for="o in co.shippingOptions" :key="o.service" class="ship-opt" :class="{ on: co.shippingService === o.service }">
                <RadioButton v-model="co.shippingService" :value="o.service" name="shipping" />
                <div class="grow">
                  <strong>{{ o.name }}</strong>
                  <p class="muted small">Chega em até {{ o.days }} dias úteis após a confirmação do pagamento</p>
                </div>
                <strong :class="{ free: o.price === 0 }">{{ o.price === 0 ? 'Grátis' : formatBRL(o.price) }}</strong>
              </label>
            </div>
            <small v-if="co.shippingError" class="error">{{ co.shippingError }}</small>
            <small v-else-if="errors.shipping" class="error">{{ errors.shipping }}</small>
          </section>

          <!-- 4. PAGAMENTO -->
          <section class="card">
            <h2 class="step"><span>4</span> Pagamento</h2>
            <div class="methods" role="radiogroup" aria-label="Forma de pagamento">
              <button
                v-for="m in methods" :key="m.value" type="button" class="method" :class="{ on: co.paymentMethod === m.value }"
                role="radio" :aria-checked="co.paymentMethod === m.value" @click="co.paymentMethod = m.value"
              >
                <i :class="m.icon" />
                <span>{{ m.label }}</span>
                <Tag v-if="m.value === 'pix'" :value="`-${PIX_DISCOUNT * 100}%`" severity="success" rounded />
              </button>
            </div>

            <div v-if="co.paymentMethod === 'pix'" class="pay-info">
              <i class="pi pi-bolt" />
              <p>Ao finalizar, você recebe o <strong>QR Code</strong> e o código <strong>copia e cola</strong>. O pagamento é aprovado na hora e você economiza <strong>{{ formatBRL(discount) }}</strong>.</p>
            </div>

            <div v-else-if="co.paymentMethod === 'boleto'" class="pay-info">
              <i class="pi pi-clock" />
              <p>O boleto vence em 3 dias úteis. A compensação leva até 2 dias úteis e só então o pedido é enviado.</p>
            </div>

            <div v-else class="grid-form card-form">
              <div class="field">
                <label for="cc-number">Número do cartão</label>
                <IconField>
                  <InputMask id="cc-number" v-model="card.number" mask="9999 9999 9999 9?999" :auto-clear="false" autocomplete="cc-number" inputmode="numeric" :invalid="!!errors.cardNumber" />
                  <InputIcon v-if="brand" class="brand">{{ brand }}</InputIcon>
                </IconField>
                <small v-if="errors.cardNumber" class="error">{{ errors.cardNumber }}</small>
              </div>
              <div class="field">
                <label for="cc-name">Nome impresso no cartão</label>
                <InputText id="cc-name" v-model="card.holder" autocomplete="cc-name" :invalid="!!errors.cardHolder" style="text-transform: uppercase" />
                <small v-if="errors.cardHolder" class="error">{{ errors.cardHolder }}</small>
              </div>
              <div class="field span-3">
                <label for="cc-exp">Validade</label>
                <InputMask id="cc-exp" v-model="card.expiry" mask="99/99" placeholder="MM/AA" autocomplete="cc-exp" :invalid="!!errors.cardExpiry" />
                <small v-if="errors.cardExpiry" class="error">{{ errors.cardExpiry }}</small>
              </div>
              <div class="field span-3">
                <label for="cc-cvv">CVV</label>
                <InputMask id="cc-cvv" v-model="card.cvv" mask="999?9" :auto-clear="false" autocomplete="cc-csc" inputmode="numeric" :invalid="!!errors.cardCvv" />
                <small v-if="errors.cardCvv" class="error">{{ errors.cardCvv }}</small>
              </div>
              <div class="field">
                <label for="cc-inst">Parcelas</label>
                <Select id="cc-inst" v-model="card.installments" :options="installmentOptions" option-label="label" option-value="value" />
              </div>
              <p class="muted small"><i class="pi pi-shield" /> Os dados do cartão são criptografados pelo Mercado Pago e não passam pelo nosso servidor.<span v-if="mpDemo"> (demonstração: use qualquer cartão de teste, ex. 4235 6477 2802 5682)</span></p>
            </div>
          </section>
        </div>

        <!-- RESUMO -->
        <aside class="summary card">
          <h2 class="step">Resumo</h2>
          <div class="lines">
            <div v-for="l in cart.lines" :key="l.sku" class="sline">
              <div class="sthumb">
                <ProductImage :src="l.image" :alt="l.name" :color="l.colorHex" ratio="1" />
                <span class="qty">{{ l.quantity }}</span>
              </div>
              <div class="grow">
                <strong class="small">{{ l.name }}</strong>
                <p class="muted small">{{ l.color }} · {{ l.size }}</p>
              </div>
              <span class="small price">{{ formatBRL(l.price * l.quantity) }}</span>
            </div>
          </div>
          <Divider />
          <div class="stack totals">
            <div class="row between"><span>Subtotal</span><span>{{ formatBRL(cart.subtotal) }}</span></div>
            <div v-if="discount" class="row between pix"><span>Desconto Pix</span><span>− {{ formatBRL(discount) }}</span></div>
            <div class="row between">
              <span>Frete {{ co.selectedShipping ? `(${co.selectedShipping.name})` : '' }}</span>
              <span>{{ co.selectedShipping ? (shippingPrice === 0 ? 'Grátis' : formatBRL(shippingPrice)) : '—' }}</span>
            </div>
            <Divider />
            <div class="row between total"><span>Total</span><span class="price">{{ formatBRL(total) }}</span></div>
            <p v-if="co.paymentMethod === 'card'" class="muted small right">em {{ card.installments }}x de {{ formatBRL(total / card.installments) }}</p>
          </div>
          <Button
            type="submit" :loading="submitting" class="sg-cta w-full" icon="pi pi-lock"
            :label="co.paymentMethod === 'pix' ? 'Pagar com Pix' : co.paymentMethod === 'boleto' ? 'Gerar boleto' : 'Pagar com cartão'"
          />
          <p class="muted small center">Ao finalizar você concorda com nossa <NuxtLink to="/trocas" class="link">política de trocas</NuxtLink>.</p>
        </aside>
      </form>

      <template #fallback>
        <Skeleton height="500px" border-radius="18px" />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.head { margin-bottom: 24px; flex-wrap: wrap; }
.secure { color: #1b7a55; font-weight: 600; font-size: .9rem; }
.layout { display: grid; grid-template-columns: 1fr 400px; gap: 28px; align-items: start; }
.main { gap: 18px; }
.step { font-family: var(--sg-sans); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.step span { width: 28px; height: 28px; border-radius: 50%; background: var(--sg-red); color: #fff; display: grid; place-items: center; font-size: .85rem; }
.ship-opt { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--sg-line); border-radius: 14px; cursor: pointer; transition: border-color .15s, background .15s; }
.ship-opt.on { border-color: var(--sg-red); background: #fff7f3; }
.grow { flex: 1; min-width: 0; }
.free { color: #1b7a55; }
.error { color: var(--sg-red); }
.methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
.method { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px; border: 1px solid var(--sg-line); border-radius: 14px; background: #fff; cursor: pointer; font: inherit; font-weight: 600; color: var(--sg-ink); }
.method i { font-size: 1.3rem; color: var(--sg-muted); }
.method.on { border-color: var(--sg-red); background: #fff7f3; box-shadow: 0 0 0 1px var(--sg-red); }
.method.on i { color: var(--sg-red); }
.pay-info { display: flex; gap: 14px; background: var(--sg-cream); padding: 16px; border-radius: 14px; }
.pay-info i { color: var(--sg-red); font-size: 1.2rem; margin-top: 2px; }
.brand { font-size: .7rem; font-weight: 700; text-transform: uppercase; font-style: normal; color: var(--sg-muted); width: auto; }
.summary { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 6px; }
.lines { display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow: auto; }
.sline { display: flex; align-items: center; gap: 12px; }
.sthumb { position: relative; width: 56px; flex: none; }
.sthumb :deep(.pimg) { border-radius: 10px; }
.qty { position: absolute; top: -6px; right: -6px; background: var(--sg-ink); color: #fff; font-size: .7rem; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; }
.totals { gap: 8px; }
.total { font-size: 1.25rem; font-weight: 700; }
.pix { color: #1b7a55; }
.right { text-align: right; }
.center { text-align: center; margin-top: 8px; }
.link { color: var(--sg-red); text-decoration: underline; }
.empty { text-align: center; display: grid; gap: 12px; justify-items: center; padding: 48px; }
@media (max-width: 960px) {
  .layout { grid-template-columns: 1fr; }
  .summary { position: static; }
}
@media (max-width: 520px) {
  .methods { grid-template-columns: 1fr; }
  .method { flex-direction: row; justify-content: flex-start; }
}
</style>
