/** Diz ao front se está em modo demonstração (sem expor segredos). */
export default defineEventHandler(() => ({
  paymentsDemo: !mercadoPagoConfigured(),
  shippingEstimated: !correiosConfigured()
}))
