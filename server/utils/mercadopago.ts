import { createHmac, randomUUID } from 'node:crypto'
import type { Order, OrderStatus } from '#shared/types'

/**
 * Mercado Pago — API de pagamentos (https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post)
 * Um único endpoint /v1/payments cobre cartão (token gerado no navegador pelo MercadoPago.js), Pix e boleto.
 * Sem NUXT_MERCADO_PAGO_ACCESS_TOKEN tudo roda em modo demonstração (sem cobrança).
 */
const API = 'https://api.mercadopago.com'

export function mercadoPagoConfigured() {
  return Boolean(useRuntimeConfig().mercadoPago.accessToken)
}

function mp<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}) {
  return $fetch<T>(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${useRuntimeConfig().mercadoPago.accessToken}`,
      ...(opts.headers as Record<string, string>)
    }
  })
}

/** A API documenta `yyyy-MM-dd'T'HH:mm:ss.SSSz` com deslocamento (ex.: -03:00), não o `Z` do toISOString. */
function mpDate(msFromNow: number) {
  const brt = new Date(Date.now() + msFromNow - 3 * 3_600_000)
  return brt.toISOString().replace('Z', '-03:00')
}

export function mapStatus(s: string): OrderStatus {
  if (s === 'approved' || s === 'authorized') return 'approved'
  if (s === 'in_process' || s === 'in_mediation') return 'in_process'
  if (s === 'rejected') return 'rejected'
  if (s === 'cancelled' || s === 'refunded' || s === 'charged_back') return 'cancelled'
  return 'pending'
}

interface MPPayment {
  id: number
  status: string
  status_detail: string
  external_reference?: string
  date_of_expiration?: string
  barcode?: { content: string }
  point_of_interaction?: { transaction_data?: { qr_code: string; qr_code_base64: string } }
  transaction_details?: { external_resource_url?: string }
}

export async function createPayment(order: Order, card?: { token: string; paymentMethodId: string; issuerId?: string; installments: number }) {
  const { public: pub } = useRuntimeConfig()
  const [firstName, ...rest] = order.customer.name.trim().split(/\s+/)
  const payer: Record<string, any> = {
    email: order.customer.email,
    first_name: firstName,
    last_name: rest.join(' ') || firstName,
    identification: { type: 'CPF', number: onlyDigits(order.customer.cpf) }
  }

  const body: Record<string, any> = {
    transaction_amount: order.total,
    description: `Pedido ${order.id} — Sempre Gabriela`,
    external_reference: order.id,
    statement_descriptor: 'SEMPREGABRIELA',
    payer,
    additional_info: {
      items: order.lines.map(l => ({
        id: l.sku, title: `${l.name} ${l.color} ${l.size}`, quantity: l.quantity, unit_price: l.unitPrice
      })),
      shipments: {
        receiver_address: {
          zip_code: onlyDigits(order.address.cep), street_name: order.address.street,
          street_number: order.address.number, city_name: order.address.city, state_name: order.address.state
        }
      }
    }
  }
  // Webhook só funciona com URL pública (https)
  if (pub.siteUrl.startsWith('https://')) body.notification_url = `${pub.siteUrl}/api/webhooks/mercadopago`

  if (order.paymentMethod === 'pix') {
    body.payment_method_id = 'pix'
    body.date_of_expiration = mpDate(30 * 60_000) // 30 min
  } else if (order.paymentMethod === 'boleto') {
    body.payment_method_id = 'bolbradesco'
    body.date_of_expiration = mpDate(3 * 86_400_000)
    payer.address = {
      zip_code: onlyDigits(order.address.cep), street_name: order.address.street, street_number: order.address.number,
      neighborhood: order.address.neighborhood, city: order.address.city, federal_unit: order.address.state
    }
  } else {
    if (!card?.token) throw createError({ statusCode: 400, statusMessage: 'Dados do cartão ausentes' })
    body.token = card.token
    body.payment_method_id = card.paymentMethodId
    body.installments = card.installments
    if (card.issuerId) body.issuer_id = Number(card.issuerId)
  }

  const p = await mp<MPPayment>('/v1/payments', {
    method: 'POST',
    headers: { 'X-Idempotency-Key': `${order.id}-${randomUUID()}` },
    body
  }).catch((e: any) => {
    console.error('[mercadopago]', e?.data || e)
    throw createError({ statusCode: 402, statusMessage: e?.data?.message || 'Pagamento recusado. Verifique os dados e tente novamente.' })
  })

  return applyPayment(order, p)
}

export function applyPayment(order: Order, p: MPPayment): Order {
  order.paymentId = String(p.id)
  order.status = mapStatus(p.status)
  order.statusDetail = p.status_detail
  const td = p.point_of_interaction?.transaction_data
  if (td?.qr_code) order.pix = { qrCode: td.qr_code, qrCodeBase64: td.qr_code_base64, expiresAt: p.date_of_expiration }
  if (p.transaction_details?.external_resource_url) {
    order.boleto = { url: p.transaction_details.external_resource_url, barcode: p.barcode?.content, expiresAt: p.date_of_expiration }
  }
  return order
}

export function getPayment(id: string) {
  return mp<MPPayment>(`/v1/payments/${id}`)
}

/** Valida o header x-signature dos webhooks (https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks). */
export function verifyWebhookSignature(xSignature: string | undefined, xRequestId: string | undefined, dataId: string) {
  const secret = useRuntimeConfig().mercadoPago.webhookSecret
  if (!secret) return true // sem segredo configurado, não valida (configure em produção!)
  if (!xSignature) return false
  const parts = Object.fromEntries(xSignature.split(',').map(p => p.trim().split('=') as [string, string]))
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${parts.ts};`
  const hash = createHmac('sha256', secret).update(manifest).digest('hex')
  return hash === parts.v1
}

/** Pagamento simulado para o modo demonstração. */
export function demoPayment(order: Order): Order {
  order.paymentId = `DEMO-${Date.now()}`
  if (order.paymentMethod === 'card') {
    order.status = 'approved'
    order.statusDetail = 'accredited'
  } else if (order.paymentMethod === 'pix') {
    order.status = 'pending'
    order.pix = {
      qrCode: `00020126580014BR.GOV.BCB.PIX0136DEMO-SEMPRE-GABRIELA-${order.id}5204000053039865406${order.total.toFixed(2)}5802BR5916SEMPRE GABRIELA6009SAO PAULO62070503***6304ABCD`,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString()
    }
  } else {
    order.status = 'pending'
    order.boleto = {
      url: '#',
      barcode: '23793.38128 60000.000003 00000.000400 1 00000000000000',
      expiresAt: new Date(Date.now() + 3 * 86_400_000).toISOString()
    }
  }
  return order
}
