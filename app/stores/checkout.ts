import { defineStore } from 'pinia'
import type { Address, Customer, PaymentMethod, ShippingOption, ShippingService } from '#shared/types'

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    customer: { name: '', email: '', cpf: '', phone: '' } as Customer,
    address: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' } as Address,
    shippingOptions: [] as ShippingOption[],
    shippingService: null as ShippingService | null,
    shippingLoading: false,
    shippingError: '',
    cepLoading: false,
    paymentMethod: 'pix' as PaymentMethod
  }),

  getters: {
    selectedShipping: s => s.shippingOptions.find(o => o.service === s.shippingService) || null
  },

  actions: {
    /** Preenche o endereço pelo CEP. */
    async lookupCep(cep: string) {
      const digits = onlyDigits(cep)
      if (digits.length !== 8) return
      this.cepLoading = true
      try {
        const r = await $fetch<Partial<Address>>(`/api/cep/${digits}`)
        Object.assign(this.address, { ...r, cep: digits })
      } catch {
        this.shippingError = 'CEP não encontrado. Preencha o endereço manualmente.'
      } finally {
        this.cepLoading = false
      }
    },

    /** Calcula PAC e SEDEX para o carrinho atual. */
    async quote(cep: string) {
      const cart = useCartStore()
      const digits = onlyDigits(cep)
      this.shippingError = ''
      if (digits.length !== 8) {
        this.shippingError = 'Digite um CEP válido com 8 números.'
        return
      }
      if (!cart.lines.length) return
      this.shippingLoading = true
      try {
        const r = await $fetch<{ options: ShippingOption[] }>('/api/shipping/quote', {
          method: 'POST',
          body: { cep: digits, items: cart.apiItems }
        })
        this.shippingOptions = r.options
        this.address.cep = digits
        if (!r.options.some(o => o.service === this.shippingService)) this.shippingService = r.options[0]?.service ?? null
      } catch (e: any) {
        this.shippingOptions = []
        this.shippingError = e?.data?.statusMessage || 'Não foi possível calcular o frete.'
      } finally {
        this.shippingLoading = false
      }
    }
  }
})
