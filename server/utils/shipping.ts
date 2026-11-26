import type { ShippingOption, ShippingService } from '#shared/types'

/**
 * Frete pelo Melhor Envio (a loja não tem contrato com os Correios, e a API de preço deles exige contrato).
 * Documentação: https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos
 *  - POST /api/v2/me/shipment/calculate, medidas em cm e peso em kg
 *  - usar custom_price e custom_delivery_time, que já trazem os ajustes da conta da loja
 * Sem token, cai numa tabela de estimativa (marcada como `estimated`), que nunca é usada para vender.
 */
const SERVICE_IDS: Record<ShippingService, number> = { PAC: 1, SEDEX: 2 }
const HANDLING_DAYS = 1 // dia útil de separação da loja

export interface ShippingItem {
  sku: string
  weight: number // gramas, já com a embalagem
  dimensions: { length: number, width: number, height: number } // cm
  unitPrice: number
  quantity: number
}

interface MelhorEnvioQuote {
  id: number
  price?: string
  custom_price?: string
  delivery_time?: number
  custom_delivery_time?: number
  error?: string
}

export function shippingConfigured() {
  return Boolean(useRuntimeConfig().melhorEnvio.token)
}

// O Nuxt converte variável de ambiente numérica em number, e aí um CEP perderia o zero à esquerda.
function originCep() {
  return onlyDigits(String(useRuntimeConfig().melhorEnvio.cepOrigem)).padStart(8, '0')
}

async function quoteMelhorEnvio(cep: string, items: ShippingItem[]): Promise<ShippingOption[]> {
  const cfg = useRuntimeConfig().melhorEnvio
  const url: string = `${cfg.apiUrl}/api/v2/me/shipment/calculate`

  let response: MelhorEnvioQuote[] | MelhorEnvioQuote
  try {
    response = await $fetch<MelhorEnvioQuote[] | MelhorEnvioQuote>(url, {
      method: 'POST',
      timeout: 10_000,
      retry: 0,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${cfg.token}`,
        'User-Agent': String(cfg.userAgent)
      },
      body: {
        from: { postal_code: originCep() },
        to: { postal_code: cep },
        products: items.map(i => ({
          id: i.sku,
          width: i.dimensions.width,
          height: i.dimensions.height,
          length: i.dimensions.length,
          weight: i.weight / 1000,
          insurance_value: i.unitPrice, // valor unitário: a API multiplica pela quantidade
          quantity: i.quantity
        })),
        options: { receipt: false, own_hand: false },
        services: Object.values(SERVICE_IDS).join(',')
      }
    })
  } catch (e: any) {
    // Não logar o erro inteiro: ele carrega o header Authorization
    console.error('[melhor-envio] falha na cotação', e?.status, e?.data?.message)
    if (e?.status === 401) console.error('[melhor-envio] token inválido ou vencido: gere outro no painel')
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível calcular o frete agora. Tente novamente.' })
  }

  const quotes = Array.isArray(response) ? response : [response]
  const options: ShippingOption[] = []
  for (const [service, id] of Object.entries(SERVICE_IDS) as [ShippingService, number][]) {
    const quote = quotes.find(q => q.id === id)
    if (!quote || quote.error) continue
    const price = Number(quote.custom_price ?? quote.price)
    const days = Number(quote.custom_delivery_time ?? quote.delivery_time)
    if (!(price > 0) || !Number.isFinite(days)) continue
    options.push({ service, code: String(id), name: service, price: round2(price), days: days + HANDLING_DAYS, estimated: false })
  }

  if (!options.length) throw createError({ statusCode: 422, statusMessage: 'Os Correios não atendem este CEP com esse pacote. Fale com a loja.' })
  return options
}

/** Tabela de estimativa da demonstração: usa a distância entre o 1º dígito dos CEPs como aproximação de região. */
function estimate(service: ShippingService, cep: string, items: ShippingItem[]): ShippingOption {
  const dist = Math.abs(Number(originCep()[0]) - Number(cep[0]))
  const kg = Math.max(1, Math.ceil(items.reduce((g, i) => g + i.weight * i.quantity, 0) / 1000))
  const base = service === 'PAC' ? 19.9 + dist * 3.4 : 29.9 + dist * 5.8
  const perKg = service === 'PAC' ? 4.5 : 8.9
  const days = service === 'PAC' ? 4 + dist * 1.2 : 1 + dist * 0.6
  return {
    service,
    code: String(SERVICE_IDS[service]),
    name: service,
    price: round2(base + (kg - 1) * perKg),
    days: Math.round(days) + HANDLING_DAYS,
    estimated: true
  }
}

export async function quoteShipping(cepDestino: string, items: ShippingItem[]): Promise<ShippingOption[]> {
  const cep = onlyDigits(String(cepDestino ?? ''))
  if (cep.length !== 8) throw createError({ statusCode: 400, statusMessage: 'CEP inválido' })
  if (shippingConfigured()) return quoteMelhorEnvio(cep, items)
  return (['PAC', 'SEDEX'] as const).map(s => estimate(s, cep, items))
}

/** Aplica a regra de frete grátis no PAC. */
export function applyFreeShipping(options: ShippingOption[], subtotal: number) {
  if (subtotal < FREE_SHIPPING_FROM) return options
  return options.map(o => (o.service === 'PAC' ? { ...o, price: 0 } : o))
}
