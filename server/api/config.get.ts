/** Diz ao front em que estado a loja está (sem expor segredos). */
export default defineEventHandler(() => ({
  paymentsDemo: !mercadoPagoConfigured(),
  shippingEstimated: !shippingConfigured(),
  preview: products.some(p => !p.confirmed),
  salesOpen: salesOpen()
}))
