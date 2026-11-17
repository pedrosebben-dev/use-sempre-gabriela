import { defineStore } from 'pinia'
import type { CartItem, Product, ProductVariant } from '#shared/types'

export interface CartLine extends CartItem {
  slug: string
  name: string
  color: string
  colorHex: string
  size: string
  price: number
  image?: string
  maxStock: number
}

const STORAGE_KEY = 'sg-cart-v1'

export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: [] as CartLine[],
    drawerOpen: false,
    hydrated: false
  }),

  getters: {
    count: s => s.lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: s => round2(s.lines.reduce((n, l) => n + l.price * l.quantity, 0)),
    freeShippingRemaining(): number {
      return Math.max(0, round2(FREE_SHIPPING_FROM - this.subtotal))
    },
    freeShippingProgress(): number {
      return Math.min(100, Math.round((this.subtotal / FREE_SHIPPING_FROM) * 100))
    },
    /** Formato enviado para a API (só ids + quantidade; o preço é recalculado no servidor). */
    apiItems: (s): CartItem[] => s.lines.map(({ productId, sku, quantity }) => ({ productId, sku, quantity }))
  },

  actions: {
    hydrate() {
      if (this.hydrated || !import.meta.client) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) this.lines = JSON.parse(raw)
      } catch { /* storage indisponível */ }
      this.hydrated = true
      this.$subscribe((_m, state) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines)) } catch { /* ignore */ }
      })
    },

    add(product: Product, variant: ProductVariant, quantity = 1) {
      const existing = this.lines.find(l => l.sku === variant.sku)
      if (existing) {
        existing.quantity = Math.min(variant.stock, existing.quantity + quantity)
      } else {
        this.lines.push({
          productId: product.id, sku: variant.sku, slug: product.slug, name: product.name,
          color: variant.color, colorHex: variant.colorHex, size: variant.size,
          price: product.price, image: product.images[0], quantity: Math.min(quantity, variant.stock),
          maxStock: variant.stock
        })
      }
      this.drawerOpen = true
    },

    setQuantity(sku: string, quantity: number) {
      const line = this.lines.find(l => l.sku === sku)
      if (!line) return
      if (quantity <= 0) return this.remove(sku)
      line.quantity = Math.min(line.maxStock, quantity)
    },

    remove(sku: string) {
      this.lines = this.lines.filter(l => l.sku !== sku)
    },

    clear() {
      this.lines = []
    }
  }
})
