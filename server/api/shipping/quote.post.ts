import type { CartItem } from '#shared/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ cep: string; items: CartItem[] }>(event)
  const { subtotal, shippingItems } = resolveCart(body.items)
  const options = await quoteShipping(body.cep, shippingItems)
  return {
    options: applyFreeShipping(options, subtotal).sort((a, b) => a.price - b.price),
    freeShippingFrom: FREE_SHIPPING_FROM
  }
})
