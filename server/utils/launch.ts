import type { OrderLine } from '#shared/types'

/**
 * Trava de pré-lançamento. Em produção só vende com:
 *  1. Mercado Pago configurado (senão o pedido seria "aprovado" sem cobrança),
 *  2. Melhor Envio configurado (senão cobraria frete estimado),
 *  3. peça com `confirmed: true` no catálogo (senão venderia por preço de exemplo).
 * No `npm run dev` o fluxo inteiro continua liberado para demonstração.
 */
function integrationsReady() {
  return mercadoPagoConfigured() && shippingConfigured()
}

export function salesOpen() {
  return Boolean(import.meta.dev) || (integrationsReady() && products.some(p => p.confirmed))
}

export function assertCanSell(lines: OrderLine[]) {
  if (import.meta.dev) return
  if (!integrationsReady() || lines.some(l => !findProduct(l.productId)?.confirmed)) {
    throw createError({ statusCode: 409, statusMessage: 'Loja em pré-lançamento: esta compra ainda não está liberada.' })
  }
}
