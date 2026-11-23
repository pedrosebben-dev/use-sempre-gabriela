import type { CartItem, OrderLine } from '#shared/types'
import type { ShippingItem } from './shipping'

/** Revalida os itens do carrinho contra o catálogo (preço e estoque vêm SEMPRE do servidor). */
export function resolveCart(items: CartItem[]) {
  if (!Array.isArray(items) || !items.length) throw createError({ statusCode: 400, statusMessage: 'Carrinho vazio' })

  const lines: OrderLine[] = []
  const shippingItems: ShippingItem[] = []
  for (const it of items) {
    const product = findProduct(it.productId)
    const variant = product?.variants.find(v => v.sku === it.sku)
    const qty = Math.floor(Number(it.quantity))
    if (!product || !variant) throw createError({ statusCode: 400, statusMessage: `Item indisponível: ${it.sku}` })
    if (!(qty > 0) || qty > variant.stock) {
      throw createError({ statusCode: 409, statusMessage: `Estoque insuficiente para ${product.name} (${variant.color}, ${variant.size})` })
    }
    lines.push({
      productId: product.id, sku: variant.sku, name: product.name, color: variant.color,
      size: variant.size, unitPrice: product.price, quantity: qty
    })
    shippingItems.push({ sku: variant.sku, weight: product.weight, dimensions: product.dimensions, unitPrice: product.price, quantity: qty })
  }
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0))
  return { lines, subtotal, shippingItems }
}
