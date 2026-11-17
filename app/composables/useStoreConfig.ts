/** Flags de modo demonstração (Correios / Mercado Pago sem credenciais). */
export function useStoreConfig() {
  return useFetch('/api/config', {
    key: 'store-config',
    default: () => ({ paymentsDemo: true, shippingEstimated: true })
  })
}
